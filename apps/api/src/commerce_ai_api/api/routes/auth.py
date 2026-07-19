"""Auth HTTP routes."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from commerce_ai_api.api.dependencies.auth import (
    build_safe_session_view_use_case,
    login_use_case,
    logout_use_case,
    require_authenticated_session,
    session_token_hash_from_cookie,
    switch_active_tenant_use_case,
)
from commerce_ai_api.api.schemas.auth import ActiveTenantRequest, LoginRequest, SessionResponse
from commerce_ai_api.core.config import Settings, get_settings
from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO, LoginCommand, SafeSessionViewDTO
from commerce_ai_api.modules.identity.application.errors import AuthorizationDeniedError, InvalidCredentialsError
from commerce_ai_api.modules.identity.application.use_cases import BuildSafeSessionView, Login, Logout, SwitchActiveTenant


router = APIRouter(prefix="/auth", tags=["auth"])


def _session_response(session_view: SafeSessionViewDTO) -> SessionResponse:
    return SessionResponse(
        actor={
            "id": session_view.actor.id,
            "name": session_view.actor.name,
            "email": session_view.actor.email,
        },
        activeTenant={
            "id": session_view.active_tenant.id,
            "name": session_view.active_tenant.name,
            "slug": session_view.active_tenant.slug,
        },
        memberships=tuple(
            {
                "tenant": {
                    "id": membership.tenant.id,
                    "name": membership.tenant.name,
                    "slug": membership.tenant.slug,
                },
                "role": membership.role,
                "allowedCapabilities": membership.allowed_capabilities,
            }
            for membership in session_view.memberships
        ),
        role=session_view.role,
        allowedCapabilities=session_view.allowed_capabilities,
    )


def _set_session_cookie(response: Response, settings: Settings, raw_session_token: str, max_age: int) -> None:
    response.set_cookie(
        key=settings.session_cookie_name,
        value=raw_session_token,
        max_age=max_age,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )


def _clear_session_cookie(response: Response, settings: Settings) -> None:
    response.delete_cookie(
        key=settings.session_cookie_name,
        httponly=True,
        secure=settings.session_cookie_secure,
        samesite="lax",
        path="/",
    )


@router.post("/login", response_model=SessionResponse)
def login(
    request_body: LoginRequest,
    request: Request,
    response: Response,
    settings: Settings = Depends(get_settings),
    use_case: Login = Depends(login_use_case),
) -> SessionResponse:
    try:
        login_result = use_case.execute(
            LoginCommand(
                email=request_body.email,
                password=request_body.password,
                user_agent=request.headers.get("user-agent"),
                ip_address=request.client.host if request.client else None,
            )
        )
    except InvalidCredentialsError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.") from exc

    _set_session_cookie(response, settings, login_result.raw_session_token, max_age=12 * 60 * 60)
    return _session_response(login_result.session_view)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    settings: Settings = Depends(get_settings),
    session_token_hash: str = Depends(session_token_hash_from_cookie),
    _: AuthenticatedSessionDTO = Depends(require_authenticated_session),
    use_case: Logout = Depends(logout_use_case),
) -> Response:
    use_case.execute(session_token_hash)
    _clear_session_cookie(response, settings)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/session", response_model=SessionResponse)
def current_session(
    authenticated_session: AuthenticatedSessionDTO = Depends(require_authenticated_session),
    use_case: BuildSafeSessionView = Depends(build_safe_session_view_use_case),
) -> SessionResponse:
    session_view = use_case.execute(authenticated_session)
    if session_view is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required.")
    return _session_response(session_view)


@router.put("/active-tenant", response_model=SessionResponse)
def switch_active_tenant(
    request_body: ActiveTenantRequest,
    authenticated_session: AuthenticatedSessionDTO = Depends(require_authenticated_session),
    use_case: SwitchActiveTenant = Depends(switch_active_tenant_use_case),
) -> SessionResponse:
    try:
        session_view = use_case.execute(authenticated_session, request_body.tenant_id)
    except AuthorizationDeniedError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.") from exc
    return _session_response(session_view)
