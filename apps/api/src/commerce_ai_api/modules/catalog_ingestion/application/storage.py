from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass(frozen=True)
class StoredArtifact:
    key: str
    provider_version_id: str
    sha256: str
    byte_size: int


class ImportArtifactStorage(Protocol):
    def put_original_once(
        self,
        *,
        key: str,
        content: bytes,
        content_type: str,
        sha256: str,
        byte_size: int,
        tenant_id: str,
        import_id: str,
    ) -> StoredArtifact:
        ...

    def read_recorded_version(
        self, *, key: str, provider_version_id: str, sha256: str, byte_size: int
    ) -> bytes:
        ...
