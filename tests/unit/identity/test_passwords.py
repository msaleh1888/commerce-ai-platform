from __future__ import annotations

import pytest

from commerce_ai_api.modules.identity.domain.passwords import hash_password, verify_password


def test_password_round_trip_uses_argon2id() -> None:
    password_hash = hash_password("correct-horse-battery-staple")

    assert password_hash.startswith("$argon2id$")
    assert verify_password(password_hash, "correct-horse-battery-staple")


def test_verify_password_returns_false_for_wrong_or_invalid_credentials() -> None:
    password_hash = hash_password("correct-horse-battery-staple")

    assert not verify_password(password_hash, "not-the-password")
    assert not verify_password("not-an-argon2-hash", "correct-horse-battery-staple")


def test_hash_password_rejects_empty_password() -> None:
    with pytest.raises(ValueError, match="must not be empty"):
        hash_password("")
