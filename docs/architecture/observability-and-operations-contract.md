# Observability and Operations Contract

## Operational Signals

Every API request, task, import, index operation, search, review decision, approval execution, and evaluation run carries a correlation ID. Structured logs include timestamp, service, environment, correlation ID, tenant-safe identifier, operation name, outcome, and safe error classification.

Audit events are product records; logs, traces, and metrics are operational records. None substitutes for another.

## Telemetry

The final release emits OpenTelemetry traces across API, worker, database, retrieval, and approved model adapters. Metrics include request/task duration, error counts, queue age, import throughput, index lag, search latency, approval outcomes, and model cost/latency where available. Secrets, access tokens, raw sensitive payloads, and unrestricted supplier content MUST be redacted.

## Health and Recovery

Liveness verifies a process can run. Readiness verifies required dependencies for its declared capability. Migrations run as a controlled job. Operations must support backup/restore, reindex from PostgreSQL, retry/resume from durable workflow state, and failure-injection evidence before final release.

## Release Evidence

Production-like release evidence includes migrations, health probes, resource limits, load/soak results, worker failure recovery, reindexing, backup/restore, tenant-isolation results, alert coverage, and documented known limitations.
