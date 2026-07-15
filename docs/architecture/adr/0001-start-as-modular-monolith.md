# ADR 0001: Start as a Modular Monolith

## Status

Accepted for MVP.

## Context

The long-term blueprint includes many domains: identity, tenancy, ingestion, retrieval, matching, agents, MCP, memory, observability, and evaluation. Splitting these into microservices too early would increase deployment, testing, and data-consistency overhead before the product workflow is proven.

## Decision

Start with a modular monolith backend and separate worker processes. Use explicit internal modules and boundaries, but deploy the main API as one FastAPI application for the MVP.

## Consequences

- Development stays faster during product discovery.
- Cross-module transactions are simpler.
- Local Docker Compose remains manageable.
- Domain boundaries must be enforced through code organization and tests.
- Services can be extracted later only when operational evidence justifies it.

## Reconsider When

- Independent scaling needs become clear.
- Deployment ownership boundaries matter.
- A module creates unacceptable resource contention.
- The modular monolith becomes difficult to test or change safely.

