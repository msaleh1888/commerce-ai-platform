from celery import Celery

from commerce_ai_worker.core.config import WorkerSettings, get_worker_settings


def create_celery_app(settings: WorkerSettings | None = None) -> Celery:
    settings = settings or get_worker_settings()
    app = Celery(
        "commerce_ai_worker",
        broker=settings.broker_url,
        backend=settings.result_backend,
        include=["commerce_ai_worker.tasks.health", "commerce_ai_worker.tasks.imports"],
    )
    app.conf.update(
        broker_connection_retry_on_startup=True,
        task_always_eager=settings.task_always_eager,
        task_default_queue=settings.task_default_queue,
        task_eager_propagates=True,
        task_ignore_result=False,
        task_serializer="json",
        result_serializer="json",
        accept_content=["json"],
        timezone="UTC",
        enable_utc=True,
    )
    return app


celery_app = create_celery_app()
