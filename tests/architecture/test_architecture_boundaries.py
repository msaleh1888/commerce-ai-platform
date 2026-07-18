from __future__ import annotations

import subprocess
import sys
from pathlib import Path


def test_architecture_boundary_check_passes() -> None:
    repository_root = Path(__file__).resolve().parents[2]
    result = subprocess.run(
        [sys.executable, "tools/architecture/check_boundaries.py"],
        cwd=repository_root,
        capture_output=True,
        text=True,
        check=False,
    )

    assert result.returncode == 0, result.stdout + result.stderr
