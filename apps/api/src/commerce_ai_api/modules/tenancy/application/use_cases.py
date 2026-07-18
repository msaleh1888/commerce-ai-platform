"""Tenancy application use cases."""

from __future__ import annotations

from commerce_ai_api.modules.tenancy.application.dtos import TenantContextDTO
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import capabilities_for_role


class ResolveTenantContext:
    def __init__(self, memberships) -> None:
        self._memberships = memberships

    def execute(self, user_id: str, tenant_id: str) -> TenantContextDTO:
        membership = self._memberships.get_active_for_user(tenant_id=tenant_id, user_id=user_id)
        if membership is None:
            raise TenantAccessDeniedError("User does not have active membership in tenant.")

        return TenantContextDTO(
            actor_id=user_id,
            tenant_id=tenant_id,
            role=membership.role,
            capabilities=capabilities_for_role(membership.role),
        )
