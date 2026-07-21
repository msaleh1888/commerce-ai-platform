from __future__ import annotations

from dataclasses import dataclass, field
from hashlib import sha256 as calculate_sha256
from uuid import uuid4

from commerce_ai_api.modules.catalog_ingestion.application.storage import StoredArtifact


@dataclass
class InMemoryImportArtifactStorage:
    _objects: dict[tuple[str, str], bytes] = field(default_factory=dict)

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
        existing = next((stored for (stored_key, _version), stored in self._objects.items() if stored_key == key), None)
        if existing is not None and existing != content:
            raise ValueError("Artifact key already exists with different bytes.")

        version = f"memory-version-{uuid4().hex}"
        self._objects[(key, version)] = content
        return StoredArtifact(key=key, provider_version_id=version, sha256=sha256, byte_size=byte_size)

    def read_recorded_version(self, *, key: str, provider_version_id: str, sha256: str, byte_size: int) -> bytes:
        content = self._objects[(key, provider_version_id)]
        if len(content) != byte_size or calculate_sha256(content).hexdigest() != sha256:
            raise ValueError("Stored artifact failed hash or size verification.")
        return content
