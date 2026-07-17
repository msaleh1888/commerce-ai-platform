# Worker

Celery worker process for asynchronous commerce AI platform jobs.

The M1 skeleton only includes a health/no-op task. Later milestones will add catalog ingestion, indexing, matching, and evaluation tasks.

## Local Settings

Worker configuration is loaded from environment variables with the `COMMERCE_AI_WORKER_` prefix.

| Variable | Default | Purpose |
| --- | --- | --- |
| `COMMERCE_AI_WORKER_ENVIRONMENT` | `local` | Environment label included in health output. |
| `COMMERCE_AI_WORKER_BROKER_URL` | `redis://localhost:6379/0` | Celery broker URL. |
| `COMMERCE_AI_WORKER_RESULT_BACKEND` | `redis://localhost:6379/1` | Celery result backend URL. |
| `COMMERCE_AI_WORKER_TASK_DEFAULT_QUEUE` | `commerce_ai` | Default queue name. |
| `COMMERCE_AI_WORKER_TASK_ALWAYS_EAGER` | `false` | Run tasks inline for local smoke tests. |

## Install

From the repository root:

```bash
python -m pip install -e ".[dev]"
```

## Run With Redis

Start Redis locally, then run:

```bash
python -m celery -A commerce_ai_worker.celery_app:celery_app worker --loglevel=INFO
```

In another terminal, enqueue the health task:

```bash
python -m commerce_ai_worker.scripts.smoke_health
```

The command prints the task id and result. The worker terminal also logs task receipt and completion.

## Smoke Test Without Redis

Until Docker Compose is added in M1-05, the task can be executed inline:

```bash
$env:COMMERCE_AI_WORKER_TASK_ALWAYS_EAGER="true"
python -m commerce_ai_worker.scripts.smoke_health
```

## Tests

```bash
python -m pytest tests/unit/worker
```
