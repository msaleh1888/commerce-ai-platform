"""Tenant-scoped repository implementations."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.errors import TenantAccessDeniedError
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence.models import MembershipModel, TenantModel


def _to_tenant(model: TenantModel) -> Tenant:
    return Tenant(id=model.id, name=model.name, slug=model.slug, created_at=model.created_at)


def _to_membership(model: MembershipModel) -> Membership:
    return Membership(
        id=model.id,
        tenant_id=model.tenant_id,
        user_id=model.user_id,
        role=Role(model.role),
        is_active=model.is_active,
        created_at=model.created_at,
    )


class TenantRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, tenant_id: str) -> Tenant | None:
        model = self._session.get(TenantModel, tenant_id)
        return _to_tenant(model) if model else None

    def upsert(self, tenant: Tenant) -> None:
        model = self._session.get(TenantModel, tenant.id)
        if model is None:
            self._session.add(TenantModel(id=tenant.id, name=tenant.name, slug=tenant.slug, created_at=tenant.created_at))
            return

        model.name = tenant.name
        model.slug = tenant.slug
        model.created_at = tenant.created_at


class MembershipRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_active_for_user(self, *, tenant_id: str, user_id: str) -> Membership | None:
        model = self._session.scalar(
            select(MembershipModel).where(
                MembershipModel.tenant_id == tenant_id,
                MembershipModel.user_id == user_id,
                MembershipModel.is_active.is_(True),
            )
        )
        return _to_membership(model) if model else None

    def list_active_for_user(self, *, user_id: str, tenant_id: str | None = None) -> list[Membership]:
        if tenant_id is not None:
            membership = self.get_active_for_user(tenant_id=tenant_id, user_id=user_id)
            return [membership] if membership else []

        models = self._session.scalars(
            select(MembershipModel)
            .where(
                MembershipModel.user_id == user_id,
                MembershipModel.is_active.is_(True),
            )
            .order_by(MembershipModel.created_at, MembershipModel.id)
        ).all()
        return [_to_membership(model) for model in models]

    def list_active_for_user_id(self, *, user_id: str) -> list[Membership]:
        models = self._session.scalars(
            select(MembershipModel)
            .where(
                MembershipModel.user_id == user_id,
                MembershipModel.is_active.is_(True),
            )
            .order_by(MembershipModel.tenant_id)
        ).all()
        return [_to_membership(model) for model in models]

    def list_active_for_user(self, *, user_id: str) -> list[Membership]:
        return self.list_active_for_user_id(user_id=user_id)

    def require_active_for_user(self, *, tenant_id: str, user_id: str) -> Membership:
        membership = self.get_active_for_user(tenant_id=tenant_id, user_id=user_id)
        if membership is None:
            raise TenantAccessDeniedError("User does not have active membership in tenant.")
        return membership

    def upsert(self, membership: Membership, *, tenant_id: str) -> None:
        if membership.tenant_id != tenant_id:
            raise TenantAccessDeniedError("Membership mutation tenant scope does not match record tenant.")

        model = self._session.get(MembershipModel, membership.id)
        if model is not None and model.tenant_id != tenant_id:
            raise TenantAccessDeniedError("Membership mutation cannot cross tenant scope.")

        if model is None:
            self._session.add(
                MembershipModel(
                    id=membership.id,
                    tenant_id=membership.tenant_id,
                    user_id=membership.user_id,
                    role=membership.role.value,
                    is_active=membership.is_active,
                    created_at=membership.created_at,
                )
            )
            return

        model.user_id = membership.user_id
        model.role = membership.role.value
        model.is_active = membership.is_active
        model.created_at = membership.created_at
