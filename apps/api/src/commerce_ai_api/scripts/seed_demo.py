"""Non-mutating demo seed command stub."""

from __future__ import annotations

from collections.abc import Sequence

from commerce_ai_api.fixtures.loader import load_demo_seed_fixture, summarize_seed_fixture


def render_seed_summary(summary: dict[str, str | int]) -> str:
    """Render the seed summary in a deterministic console format."""
    lines = [f"Loaded demo seed fixture: {summary['fixture']}"]
    lines.extend(
        f"{key}={summary[key]}"
        for key in ("tenants", "users", "suppliers", "products", "review_cases", "mode")
    )
    return "\n".join(lines)


def main(argv: Sequence[str] | None = None) -> int:
    _ = argv
    fixture = load_demo_seed_fixture()
    summary = summarize_seed_fixture(fixture)
    print(render_seed_summary(summary))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
