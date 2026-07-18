"""Database engine, session, and unit-of-work wiring."""

from __future__ import annotations

from collections.abc import Iterator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from commerce_ai_api.core.config import get_settings


def create_database_engine(database_url: str | None = None):
    return create_engine(database_url or get_settings().database_url)


def create_session_factory(database_url: str | None = None) -> sessionmaker[Session]:
    return sessionmaker(bind=create_database_engine(database_url), expire_on_commit=False)


@contextmanager
def database_session(database_url: str | None = None) -> Iterator[Session]:
    session_factory = create_session_factory(database_url)
    with session_factory() as session:
        yield session


class SqlAlchemyUnitOfWork:
    def __init__(self, session: Session) -> None:
        self.session = session

    def __enter__(self) -> "SqlAlchemyUnitOfWork":
        return self

    def __exit__(self, exc_type, exc_value, traceback) -> None:
        if exc_type is None:
            self.session.commit()
        else:
            self.session.rollback()
