"""Tenancy application use cases."""

from __future__ import annotations

from typing import Protocol

from commerce_ai_api.modules.tenancy.application.dtos import MembershipDTO, TenantDTO, TenantContextDTO
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import capabilities_for_role


class MembershipReader(Protocol):
    def get_active_for_user(self, *, tenant_id: str, user_id: str) -> Membership | None: ...

    def list_active_for_user(self, *, user_id: str) -> list[Membership]: ...


class TenantReader(Protocol):
    def get_by_id(self, tenant_id: str) -> Tenant | None: ...


def _to_tenant_dto(tenant: Tenant) -> TenantDTO:
    return TenantDTO(id=tenant.id, name=tenant.name, slug=tenant.slug)


class ResolveTenantContext:
    def __init__(self, memberships: MembershipReader) -> None:
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


class ListActiveTenantMemberships:
    def __init__(self, memberships: MembershipReader, tenants: TenantReader) -> None:
        self._memberships = memberships
        self._tenants = tenants

    def execute(self, user_id: str) -> list[MembershipDTO]:
        membership_dtos: list[MembershipDTO] = []
        for membership in self._memberships.list_active_for_user(user_id=user_id):
            tenant = self._tenants.get_by_id(membership.tenant_id)
            if tenant is None:
                continue
            membership_dtos.append(
                MembershipDTO(
                    id=membership.id,
                    tenant=_to_tenant_dto(tenant),
                    user_id=membership.user_id,
                    role=membership.role,
                    is_active=membership.is_active,
                    capabilities=capabilities_for_role(membership.role),
                )
            )
        return membership_dtos
