# ADR 0006: Versioned Evaluation Manifests

## Status

Accepted for MVP.

## Context

The project's public claims must be reproducible. Retrieval, matching, and AI behavior can change when data, prompts, models, indexes, or code change. Without versioned manifests, evaluation results become hard to trust.

## Decision

Use versioned evaluation manifests that record dataset subset, split, query set, labels, retrieval configuration, model versions, index versions, application commit, and metric definitions.

## Consequences

- Results are easier to reproduce and publish honestly.
- Experiments can be compared against baselines.
- The project needs lightweight dataset and config tracking from the beginning.
- Public README claims can distinguish planned targets from achieved measurements.

## Reconsider When

- A dedicated experiment tracker is introduced.
- Dataset size requires external artifact storage.
- Evaluation moves from local files to a managed data platform.

