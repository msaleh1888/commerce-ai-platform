from __future__ import annotations

from datetime import UTC, datetime

import pytest

from commerce_ai_api.modules.identity.application.dtos import AuthenticatedSessionDTO, SessionDTO
from commerce_ai_api.modules.identity.application.errors import AuthorizationDeniedError
from commerce_ai_api.modules.identity.application.use_cases import SwitchActiveTenant
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.tenancy.application.dtos import TenantContextDTO
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import Role


class SessionWriterStub:
    def update_active_tenant(self, *, session_id: str, active_tenant_id: str) -> None:
        raise AssertionError("A denied tenant switch must not update the session.")


class UserReaderStub:
    def get_by_id(self, user_id: str) -> User:
        return User(
            id=user_id,
            email="nora.manager@northstar.example",
            display_name="Nora Patel",
            password_hash="unused",
            is_active=True,
            created_at=datetime(2026, 7, 19, tzinfo=UTC),
        )


class TenantContextResolverStub:
    def execute(self, user_id: str, tenant_id: str) -> TenantContextDTO:
        raise TenantAccessDeniedError("User does not have active membership in tenant.")


class MembershipListerStub:
    def execute(self, user_id: str):
        return []


class UnitOfWorkStub:
    def __enter__(self) -> "UnitOfWorkStub":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        return None


def test_switch_active_tenant_translates_denied_membership_to_application_error() -> None:
    authenticated_session = AuthenticatedSessionDTO(
        session=SessionDTO(
            id="session_nora",
            user_id="user_nora",
            active_tenant_id="tenant_northstar",
            issued_at=datetime(2026, 7, 19, tzinfo=UTC),
            expires_at=datetime(2026, 7, 20, tzinfo=UTC),
            revoked_at=None,
        ),
        tenant_context=TenantContextDTO(
            actor_id="user_nora",
            tenant_id="tenant_northstar",
            role=Role.CATALOG_MANAGER,
            capabilities=frozenset(),
        ),
    )
    use_case = SwitchActiveTenant(
        SessionWriterStub(),
        UserReaderStub(),
        TenantContextResolverStub(),
        MembershipListerStub(),
        UnitOfWorkStub(),
    )

    with pytest.raises(AuthorizationDeniedError):
        use_case.execute(authenticated_session, "tenant_acme")
