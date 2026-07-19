"""Authentication and authorization dependencies."""

from __future__ import annotations

from collections.abc import Callable

from fastapi import Cookie, Depends, HTTPException, status

from commerce_ai_api.core.auth_wiring import (
    build_login,
    build_logout,
    build_resolve_authenticated_session,
    build_safe_session_view,
    build_switch_active_tenant,
    get_db_session,
)
from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO
from commerce_ai_api.modules.identity.application.errors import AuthorizationDeniedError
from commerce_ai_api.modules.identity.application.use_cases import (
    BuildSafeSessionView,
    Login,
    Logout,
    ResolveAuthenticatedSession,
    SwitchActiveTenant,
)
from commerce_ai_api.modules.identity.domain.session_tokens import hash_session_token
def session_token_hash_from_cookie(commerce_ai_session: str | None = Cookie(default=None)) -> str:
    if not commerce_ai_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return hash_session_token(commerce_ai_session)


def resolve_authenticated_session_use_case(
    db_session=Depends(get_db_session),
) -> ResolveAuthenticatedSession:
    return build_resolve_authenticated_session(db_session)


def require_authenticated_session(
    session_token_hash: str = Depends(session_token_hash_from_cookie),
    use_case: ResolveAuthenticatedSession = Depends(resolve_authenticated_session_use_case),
) -> AuthenticatedSessionDTO:
    authenticated_session = use_case.execute(session_token_hash)
    if authenticated_session is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
        )
    return authenticated_session


def require_capability(capability: str) -> Callable[[AuthenticatedSessionDTO], AuthenticatedSessionDTO]:
    def dependency(
        authenticated_session: AuthenticatedSessionDTO = Depends(require_authenticated_session),
    ) -> AuthenticatedSessionDTO:
        from commerce_ai_api.modules.identity.application.use_cases import RequireCapability

        try:
            RequireCapability().execute(authenticated_session, capability)
        except AuthorizationDeniedError as exc:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied.") from exc
        return authenticated_session

    return dependency


def login_use_case(db_session=Depends(get_db_session)) -> Login:
    return build_login(db_session)


def logout_use_case(db_session=Depends(get_db_session)) -> Logout:
    return build_logout(db_session)


def build_safe_session_view_use_case(db_session=Depends(get_db_session)) -> BuildSafeSessionView:
    return build_safe_session_view(db_session)


def switch_active_tenant_use_case(db_session=Depends(get_db_session)) -> SwitchActiveTenant:
    return build_switch_active_tenant(db_session)
