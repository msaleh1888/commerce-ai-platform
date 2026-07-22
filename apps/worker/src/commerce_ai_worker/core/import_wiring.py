from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy.orm import Session

from commerce_ai_api.core.import_wiring import build_process_import
from commerce_ai_api.db.session import create_session_factory
from commerce_ai_api.modules.catalog_ingestion.application.use_cases import ProcessImport
from commerce_ai_worker.core.config import get_worker_settings


@contextmanager
def worker_db_session() -> Iterator[Session]:
    session_factory = create_session_factory(get_worker_settings().database_url)
    with session_factory() as session:
        yield session


def resolve_process_import_use_case(db_session: Session) -> ProcessImport:
    return build_process_import(db_session)
