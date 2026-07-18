"""Demo seed command for deterministic identity and tenancy records."""

from __future__ import annotations

import argparse
import os
from collections.abc import Sequence
from datetime import UTC, datetime

from commerce_ai_api.fixtures.loader import load_demo_seed_fixture, summarize_seed_fixture
from commerce_ai_api.modules.identity.domain.entities import User
from commerce_ai_api.modules.identity.domain.passwords import hash_password
from commerce_ai_api.modules.identity.infrastructure.persistence.repositories import UserRepository
from commerce_ai_api.modules.tenancy.domain.entities import Membership, Tenant
from commerce_ai_api.modules.tenancy.domain.roles import Role
from commerce_ai_api.modules.tenancy.infrastructure.persistence.repositories import MembershipRepository, TenantRepository
from commerce_ai_api.db.session import database_session


def render_seed_summary(summary: dict[str, str | int]) -> str:
    """Render the seed summary in a deterministic console format."""
    lines = [f"Loaded demo seed fixture: {summary['fixture']}"]
    lines.extend(
        f"{key}={summary[key]}"
        for key in ("tenants", "users", "memberships", "sessions", "suppliers", "products", "review_cases", "mode")
    )
    return "\n".join(lines)


def apply_identity_tenancy_seed(database_url: str | None = None) -> dict[str, str | int]:
    fixture = load_demo_seed_fixture()
    demo_password = os.environ.get("COMMERCE_AI_DEMO_SEED_PASSWORD")
    if not demo_password:
        raise ValueError("COMMERCE_AI_DEMO_SEED_PASSWORD is required when applying identity seed records.")

    created_at = datetime(2026, 7, 18, tzinfo=UTC)
    with database_session(database_url) as session:
        tenant_repository = TenantRepository(session)
        user_repository = UserRepository(session)
        membership_repository = MembershipRepository(session)

        for tenant in fixture["tenants"]:
            tenant_repository.upsert(
                Tenant(id=tenant["id"], name=tenant["name"], slug=tenant["slug"], created_at=created_at)
            )

        for user in fixture["users"]:
            existing_user = user_repository.get_by_id(user["id"])
            password_hash = existing_user.password_hash if existing_user else hash_password(demo_password)
            user_repository.upsert(
                User(
                    id=user["id"],
                    email=user["email"],
                    display_name=user["name"],
                    password_hash=password_hash,
                    is_active=True,
                    created_at=created_at,
                )
            )

        for membership in fixture["memberships"]:
            membership_repository.upsert(
                Membership(
                    id=membership["id"],
                    tenant_id=membership["tenant_id"],
                    user_id=membership["user_id"],
                    role=Role(membership["role"]),
                    is_active=True,
                    created_at=created_at,
                ),
                tenant_id=membership["tenant_id"],
            )

        session.commit()

    summary = summarize_seed_fixture(fixture)
    return {**summary, "mode": "applied_identity_tenancy"}


def parse_args(argv: Sequence[str] | None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="Apply identity and tenancy seed records to PostgreSQL.")
    parser.add_argument("--database-url", default=None, help="Override COMMERCE_AI_DATABASE_URL for this seed run.")
    return parser.parse_args(argv)


def main(argv: Sequence[str] | None = None) -> int:
    args = parse_args(argv)
    summary = apply_identity_tenancy_seed(args.database_url) if args.apply else summarize_seed_fixture(load_demo_seed_fixture())
    print(render_seed_summary(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
