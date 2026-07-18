"""Password hashing helpers for application-managed demo auth."""

from __future__ import annotations

from argon2 import PasswordHasher
from argon2.low_level import Type


_PASSWORD_HASHER = PasswordHasher(type=Type.ID)


def hash_password(password: str) -> str:
    if not password:
        raise ValueError("Password must not be empty.")
    return _PASSWORD_HASHER.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    return _PASSWORD_HASHER.verify(password_hash, password)
