from __future__ import annotations

from sqlalchemy.orm import Session

from commerce_ai_api.core.config import get_settings
from commerce_ai_api.db.session import SqlAlchemyUnitOfWork
from commerce_ai_api.modules.catalog.infrastructure.persistence.repositories import SupplierProductRepository
from commerce_ai_api.modules.catalog_ingestion.application.storage import ImportArtifactStorage
from commerce_ai_api.modules.catalog_ingestion.application.use_cases import CreateImport, GetImportDetail, ProcessImport
from commerce_ai_api.modules.catalog_ingestion.infrastructure.persistence.repositories import CatalogImportRepository
from commerce_ai_api.modules.catalog_ingestion.infrastructure.providers.memory_artifact_storage import InMemoryImportArtifactStorage
from commerce_ai_api.modules.catalog_ingestion.infrastructure.providers.s3_artifact_storage import (
    S3ImportArtifactStorage,
    S3ImportArtifactStorageConfig,
)


_artifact_storage = InMemoryImportArtifactStorage()


def _build_artifact_storage(db_session: Session) -> ImportArtifactStorage:
    bind = db_session.get_bind()
    if bind.dialect.name == "sqlite":
        return _artifact_storage

    settings = get_settings()
    return S3ImportArtifactStorage(
        S3ImportArtifactStorageConfig(
            endpoint_url=settings.import_artifact_endpoint_url,
            bucket=settings.import_artifact_bucket,
            region=settings.import_artifact_region,
            access_key=settings.import_artifact_access_key,
            secret_key=settings.import_artifact_secret_key,
            use_tls=settings.import_artifact_use_tls,
        )
    )


def build_create_import(db_session: Session) -> CreateImport:
    return CreateImport(CatalogImportRepository(db_session), _build_artifact_storage(db_session), SqlAlchemyUnitOfWork(db_session))


def build_process_import(db_session: Session) -> ProcessImport:
    return ProcessImport(
        CatalogImportRepository(db_session),
        SupplierProductRepository(db_session),
        _build_artifact_storage(db_session),
        SqlAlchemyUnitOfWork(db_session),
    )


def build_get_import_detail(db_session: Session) -> GetImportDetail:
    return GetImportDetail(CatalogImportRepository(db_session), SupplierProductRepository(db_session))
