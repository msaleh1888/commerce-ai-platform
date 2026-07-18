# AI, Agent, and MCP Contract

## AI Provider Boundary

`ai` exposes narrow, typed adapters for embeddings and structured proposals. Provider SDKs are contained in adapter implementations. Callers receive validated DTOs plus safe metadata: provider/model, configuration/prompt version, latency, cost when available, and correlation ID.

Provider output, retrieved text, supplier content, and tool arguments are untrusted. They require schema validation, content/size limits, redaction, and hostile-input test fixtures before they influence durable state or user-visible proposals.

## Agent Boundary

Agents are introduced only after the deterministic workflow and evaluation contract exist. An agent MUST have an approved tool registry, actor/tenant/role context, read/propose-only default permissions, step/time/token/cost budgets, checkpoints, run history, and evaluation dataset.

An agent MUST NOT write catalog state, call repositories, or bypass the approval use case. Its proposal includes evidence, confidence, uncertainty, tool history, and a correlation ID.

## MCP Boundary

MCP is an external adapter over approved API/application contracts. Each tool declares its tenant scope, authorization requirement, validated input/output DTOs, audit behavior, and rate/budget policy. Tool discovery is permission-scoped. MCP tools MUST NOT expose raw database, repository, or unrestricted search capabilities.

## Tests

Test malformed/provider output, prompt injection, unauthorized tool access, cross-tenant tool access, budget exhaustion, invalid tool invocation, proposal validation, and the absence of direct mutation paths.
