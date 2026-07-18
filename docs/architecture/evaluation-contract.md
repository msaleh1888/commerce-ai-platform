# Evaluation Contract

## Ownership

`evaluation` owns immutable manifests, dataset references, labels, run records, metrics, configuration snapshots, artifacts, and result status. Product domains expose read-only adapters required to execute an evaluation.

## Manifest Requirements

Each frozen manifest MUST identify dataset/subset version, split, labels, task type, metric definitions, baseline/configuration, model version where relevant, index version where relevant, and expected artifact format. A manifest change creates a new version; it does not overwrite prior runs.

## Run Requirements

A run records manifest version, application commit, start/end time, tenant scope when applicable, configuration, model/index versions, metrics, artifact locations, and terminal status. Runs are immutable after completion except for safe artifact-link repair recorded in audit metadata.

Retrieval, matching, generation, agent, and memory evaluation are separate task types. Scores must not be combined without a separately defined metric and ADR-approved interpretation.

## Tests

Tests verify manifest validation, repeatability against the same inputs, comparable baseline runs, safe artifact handling, and tenant isolation for tenant-specific datasets or results.
