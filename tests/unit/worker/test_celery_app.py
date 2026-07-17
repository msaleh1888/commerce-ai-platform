from commerce_ai_worker.celery_app import create_celery_app
from commerce_ai_worker.core.config import WorkerSettings


def test_create_celery_app_uses_worker_settings() -> None:
    settings = WorkerSettings(
        broker_url="redis://example.test:6379/2",
        result_backend="redis://example.test:6379/3",
        task_default_queue="test_queue",
        task_always_eager=True,
    )

    app = create_celery_app(settings)

    assert app.conf.broker_url == "redis://example.test:6379/2"
    assert app.conf.result_backend == "redis://example.test:6379/3"
    assert app.conf.task_default_queue == "test_queue"
    assert app.conf.task_always_eager is True
    assert "commerce_ai_worker.tasks.health" in app.conf.include
