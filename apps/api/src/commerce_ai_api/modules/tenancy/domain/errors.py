"""Tenancy domain errors."""

from __future__ import annotations


class TenantAccessDeniedError(Exception):
    """Raised when an actor lacks membership in the requested tenant."""
