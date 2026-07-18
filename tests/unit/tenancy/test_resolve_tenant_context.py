from __future__ import annotations

from dataclasses import dataclass

import pytest

from commerce_ai_api.modules.tenancy.application.use_cases import ResolveTenantContext
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import Role


@dataclass(frozen=True, slots=True)
class MembershipStub:
    role: Role


class MembershipRepositoryStub:
    def __init__(self, membership: MembershipStub | None) -> None:
        self.membership = membership
        self.calls: list[tuple[str, str]] = []

    def get_active_for_user(self, *, tenant_id: str, user_id: str) -> MembershipStub | None:
        self.calls.append((tenant_id, user_id))
        return self.membership


def test_resolve_tenant_context_uses_scoped_membership_lookup() -> None:
    repository = MembershipRepositoryStub(MembershipStub(role=Role.CATALOG_MANAGER))
    tenant_context = ResolveTenantContext(repository).execute(user_id="user_nora", tenant_id="tenant_northstar")

    assert repository.calls == [("tenant_northstar", "user_nora")]
    assert tenant_context.actor_id == "user_nora"
    assert tenant_context.tenant_id == "tenant_northstar"
    assert tenant_context.role == Role.CATALOG_MANAGER
    assert "catalog_changes:approve" in tenant_context.capabilities


def test_resolve_tenant_context_denies_missing_membership() -> None:
    with pytest.raises(TenantAccessDeniedError):
        ResolveTenantContext(MembershipRepositoryStub(None)).execute(user_id="user_nora", tenant_id="tenant_acme")
