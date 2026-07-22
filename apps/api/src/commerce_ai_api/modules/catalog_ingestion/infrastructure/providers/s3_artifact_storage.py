from __future__ import annotations

from dataclasses import dataclass
from hashlib import sha256 as calculate_sha256

from commerce_ai_api.modules.catalog_ingestion.application.storage import StoredArtifact


@dataclass(frozen=True)
class S3ImportArtifactStorageConfig:
    endpoint_url: str
    bucket: str
    region: str
    access_key: str
    secret_key: str
    use_tls: bool


class S3ImportArtifactStorage:
    def __init__(self, config: S3ImportArtifactStorageConfig) -> None:
        import boto3

        self._bucket = config.bucket
        self._client = boto3.client(
            "s3",
            endpoint_url=config.endpoint_url,
            region_name=config.region,
            aws_access_key_id=config.access_key,
            aws_secret_access_key=config.secret_key,
            use_ssl=config.use_tls,
        )

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
        self._verify_expected_content(content=content, sha256=sha256, byte_size=byte_size)
        response = self._client.put_object(
            Bucket=self._bucket,
            Key=key,
            Body=content,
            ContentType=content_type,
            Metadata={
                "tenant-id": tenant_id,
                "import-id": import_id,
                "sha256": sha256,
                "byte-size": str(byte_size),
            },
            IfNoneMatch="*",
        )
        provider_version_id = response.get("VersionId")
        if not provider_version_id:
            raise ValueError("S3-compatible storage did not return an object version ID.")
        return StoredArtifact(key=key, provider_version_id=provider_version_id, sha256=sha256, byte_size=byte_size)

    def read_recorded_version(self, *, key: str, provider_version_id: str, sha256: str, byte_size: int) -> bytes:
        response = self._client.get_object(Bucket=self._bucket, Key=key, VersionId=provider_version_id)
        content = response["Body"].read()
        self._verify_expected_content(content=content, sha256=sha256, byte_size=byte_size)
        return content

    @staticmethod
    def _verify_expected_content(*, content: bytes, sha256: str, byte_size: int) -> None:
        if len(content) != byte_size or calculate_sha256(content).hexdigest() != sha256:
            raise ValueError("Stored artifact failed hash or size verification.")
