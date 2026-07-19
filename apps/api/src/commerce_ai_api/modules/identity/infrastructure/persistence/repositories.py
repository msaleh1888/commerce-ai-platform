"""Identity repository implementations."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from commerce_ai_api.modules.identity.domain.entities import SessionRecord, User
from commerce_ai_api.modules.identity.infrastructure.persistence.models import SessionModel, UserModel


def _to_user(model: UserModel) -> User:
    return User(
        id=model.id,
        email=model.email,
        display_name=model.display_name,
        password_hash=model.password_hash,
        is_active=model.is_active,
        created_at=model.created_at,
    )


def _to_session_record(model: SessionModel) -> SessionRecord:
    return SessionRecord(
        id=model.id,
        session_token_hash=model.session_token_hash,
        user_id=model.user_id,
        active_tenant_id=model.active_tenant_id,
        issued_at=model.issued_at,
        expires_at=model.expires_at,
        revoked_at=model.revoked_at,
        user_agent=model.user_agent,
        ip_address=model.ip_address,
    )


class UserRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_by_id(self, user_id: str) -> User | None:
        model = self._session.get(UserModel, user_id)
        return _to_user(model) if model else None

    def get_by_email(self, email: str) -> User | None:
        model = self._session.scalar(select(UserModel).where(UserModel.email == email))
        return _to_user(model) if model else None

    def upsert(self, user: User) -> None:
        model = self._session.get(UserModel, user.id)
        if model is None:
            self._session.add(
                UserModel(
                    id=user.id,
                    email=user.email,
                    display_name=user.display_name,
                    password_hash=user.password_hash,
                    is_active=user.is_active,
                    created_at=user.created_at,
                )
            )
            return

        model.email = user.email
        model.display_name = user.display_name
        model.password_hash = user.password_hash
        model.is_active = user.is_active
        model.created_at = user.created_at


class SessionRepository:
    def __init__(self, session: Session) -> None:
        self._session = session

    def get_active_by_token_hash(self, session_token_hash: str) -> SessionRecord | None:
        model = self._session.scalar(
            select(SessionModel).where(
                SessionModel.session_token_hash == session_token_hash,
                SessionModel.revoked_at.is_(None),
            )
        )
        session_record = _to_session_record(model) if model else None
        return session_record if session_record and session_record.is_active else None

    def add(self, session_record: SessionRecord) -> None:
        self._session.add(
            SessionModel(
                id=session_record.id,
                session_token_hash=session_record.session_token_hash,
                user_id=session_record.user_id,
                active_tenant_id=session_record.active_tenant_id,
                issued_at=session_record.issued_at,
                expires_at=session_record.expires_at,
                revoked_at=session_record.revoked_at,
                user_agent=session_record.user_agent,
                ip_address=session_record.ip_address,
            )
        )

    def revoke_by_token_hash(self, session_token_hash: str, revoked_at: datetime) -> bool:
        model = self._session.scalar(
            select(SessionModel).where(
                SessionModel.session_token_hash == session_token_hash,
                SessionModel.revoked_at.is_(None),
            )
        )
        if model is None:
            return False

        model.revoked_at = revoked_at
        return True

    def update_active_tenant(self, *, session_id: str, active_tenant_id: str) -> None:
        model = self._session.get(SessionModel, session_id)
        if model is not None:
            model.active_tenant_id = active_tenant_id
