"""Identity application errors."""

from __future__ import annotations


class AuthenticationRequiredError(Exception):
    """Raised when a request has no valid authenticated session."""


class InvalidCredentialsError(Exception):
    """Raised when login credentials do not identify an active user."""


class AuthorizationDeniedError(Exception):
    """Raised when an authenticated actor lacks required access."""
