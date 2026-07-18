# Canonical Backend Architecture

## Package Tree

Future backend code MUST use this shape. Empty directories are not created until their owning milestone begins.

```text
apps/api/src/commerce_ai_api/
  main.py                         # composition root only
  core/                            # settings, logging, shared errors, dependency wiring
  api/
    dependencies/                  # actor/tenant/auth dependencies
    routes/                        # HTTP adapters only
    schemas/                       # request/response DTOs only
  modules/
    <domain>/
      application/                 # use cases, commands, queries, public contracts
      domain/                      # entities, value objects, domain errors, state rules
      infrastructure/
        persistence/               # SQLAlchemy models and repositories
        providers/                 # domain-owned external adapters, if approved
      tasks/                       # task adapters owned by the domain, if needed
  db/                              # engine/session, Alembic integration only
  fixtures/ scripts/
apps/worker/src/commerce_ai_worker/
  celery_app.py                    # worker composition root
  tasks/                            # imports registered domain task adapters only
  core/                             # worker settings and dependency wiring
```

## Dependency Direction

```text
api route / worker task / MCP tool
              -> application use case
              -> domain rules and public contracts
              -> infrastructure repository/provider
              -> SQLAlchemy / external SDK
```

Dependencies only flow rightward. `domain` MUST NOT import FastAPI, Celery, SQLAlchemy, Pydantic HTTP schemas, or provider SDKs. `application` MUST NOT import routes, task modules, or framework request/response types. Infrastructure implementations may depend inward on domain/application contracts, never the reverse.

## Layer Contracts

### Routes/controllers

A route is a transport adapter. It resolves dependencies, validates a request DTO, calls exactly one named use case or query handler, and serializes a response DTO. It may map known application errors via a shared exception mapper. It must contain no business branching beyond transport validation.

### Application services/use cases

One use case represents one user or system intent, for example `CreateImport`, `ProcessImport`, `SearchProducts`, `CreateReviewCase`, or `ExecuteApproval`. It owns authorization-sensitive workflow decisions, transaction scope, domain collaboration, and emitted audit/domain events. Commands mutate; queries do not mutate.

### Repositories

A repository is the only interface that loads or writes an owning domain's protected persistence models. Its public methods accept a `TenantId`/`tenant_id` for all tenant-owned records. It returns domain entities or application DTOs, not SQLAlchemy models. Complex read-only SQL may live in a named query repository within the owning domain.

### Transactions and sessions

The application use case owns transaction scope through a unit-of-work or injected session boundary. Repositories do not commit. Routes and tasks do not commit. Network/model/index calls occur outside an open database transaction; a subsequent idempotent transition records their effect.

### Errors

Domains raise domain errors with no HTTP status. Application services translate expected infrastructure failures into application errors. A central API mapper translates application errors into the documented HTTP response. Unknown errors are logged with correlation context and return a safe generic response.

## Worker Contract

The worker composition root wires the same use cases and repository implementations as the API. A Celery task is limited to: validate a task DTO, establish correlation context, call a use case, select retry behavior for classified transient failures, and return safe task metadata. It does not encode a second version of a workflow.

Task payloads MUST include stable entity IDs, tenant ID, operation/idempotency ID, and correlation ID. They MUST NOT include ORM objects, request objects, access tokens, secrets, or mutable authoritative snapshots.

## Cross-domain Collaboration

Use a public application contract when one domain needs a synchronous capability from another. Use a typed domain event and task when the work is asynchronous. Never reach into another domain's repository or persistence model. The owner of a record owns its state transition.

## Testing Layout

```text
tests/
  unit/<domain>/                   # domain rules, services, repository behavior in isolation
  integration/api/                 # HTTP contract, auth, tenant isolation
  integration/worker/              # task-to-use-case wiring and retry/idempotency
  integration/persistence/         # migrations, constraints, transaction behavior
  architecture/                    # import/dependency boundaries and required conventions
```
