# API

FastAPI service for the commerce AI platform.

## Local Development

From the repository root:

```bash
python -m pip install -e ".[dev]"
python -m uvicorn commerce_ai_api.main:app --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Run API tests:

```bash
python -m pytest tests/unit/api
```

Configuration is loaded from environment variables with the `COMMERCE_AI_` prefix. See `.env.example` for local defaults.
