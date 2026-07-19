"""Fail fast on repository architecture dependency-boundary violations."""

from __future__ import annotations

import ast
import sys
from pathlib import Path


REPOSITORY_ROOT = Path(__file__).resolve().parents[2]
API_SOURCE = REPOSITORY_ROOT / "apps" / "api" / "src" / "commerce_ai_api"
WORKER_SOURCE = REPOSITORY_ROOT / "apps" / "worker" / "src" / "commerce_ai_worker"


def imported_modules(path: Path) -> list[str]:
    tree = ast.parse(path.read_text(encoding="utf-8"), filename=str(path))
    modules: list[str] = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            modules.extend(alias.name for alias in node.names)
        elif isinstance(node, ast.ImportFrom) and node.module:
            modules.append(node.module)
    return modules


def check_files(paths: list[Path], forbidden_fragments: tuple[str, ...]) -> list[str]:
    violations: list[str] = []
    for path in paths:
        for module in imported_modules(path):
            if any(fragment in module for fragment in forbidden_fragments):
                relative_path = path.relative_to(REPOSITORY_ROOT)
                violations.append(f"{relative_path}: forbidden import '{module}'")
    return violations


def python_files(path: Path) -> list[Path]:
    return sorted(candidate for candidate in path.rglob("*.py") if candidate.name != "__init__.py") if path.exists() else []


def main() -> int:
    violations: list[str] = []
    api_adapter_files = python_files(API_SOURCE / "api" / "routes") + python_files(API_SOURCE / "api" / "dependencies")
    violations.extend(
        check_files(
            api_adapter_files,
            ("commerce_ai_api.db", ".infrastructure.persistence", "sqlalchemy", "commerce_ai_worker"),
        )
    )
    violations.extend(
        check_files(
            python_files(WORKER_SOURCE / "tasks"),
            ("commerce_ai_api.db", ".infrastructure.persistence", "sqlalchemy"),
        )
    )

    modules_root = API_SOURCE / "modules"
    for domain_dir in (path for path in modules_root.iterdir() if path.is_dir()) if modules_root.exists() else []:
        domain_files = python_files(domain_dir / "domain")
        violations.extend(
            check_files(domain_files, ("fastapi", "celery", "sqlalchemy", "commerce_ai_api.api"))
        )

        application_files = python_files(domain_dir / "application")
        violations.extend(
            check_files(application_files, ("commerce_ai_api.api.routes", "commerce_ai_worker.tasks"))
        )

        persistence_root = domain_dir / "infrastructure" / "persistence"
        for persistence_file in python_files(persistence_root):
            for module in imported_modules(persistence_file):
                if ".infrastructure.persistence" in module and domain_dir.name not in module:
                    relative_path = persistence_file.relative_to(REPOSITORY_ROOT)
                    violations.append(
                        f"{relative_path}: cross-domain persistence import '{module}'"
                    )

    if violations:
        print("Architecture boundary violations:")
        print("\n".join(f"- {violation}" for violation in violations))
        return 1

    print("Architecture boundary checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
