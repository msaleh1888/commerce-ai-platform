# Retrieval and Indexing Contract

## Ownership

`catalog` owns product records. `retrieval` owns lexical query behavior, Qdrant projection shape, index lifecycle, ranking evidence, and hybrid fusion. Qdrant is not a product database.

## Projection Contract

Every vector point MUST contain product ID, tenant ID, projection/index version, catalog provenance reference, and only approved filterable metadata. PostgreSQL records projection status and index version. An index write becomes visible only through an idempotent retrieval state transition.

## Query Contract

Lexical, dense, and hybrid modes implement one retrieval result contract: product ID, ranking position, mode/configuration version, score details, and evidence references. Tenant and metadata filters are passed to the underlying lexical/vector query before candidates are returned. Hybrid fusion is deterministic and versioned.

## Invariants

- A retrieval result MUST belong to the requested tenant.
- A vector projection MUST be reconstructible from PostgreSQL state.
- Reindexing MUST not mutate canonical catalog fields.
- A product marked not searchable MUST not appear in modes requiring its projection.
- Search evaluation must run the same frozen query/label set for compared modes.

## Operations and Tests

The retrieval domain provides a reindex command, drift detection, and safe failure status. Required tests cover tenant filtering in every mode, projection rebuild, stale projection behavior, deterministic fusion, evidence shape, and evaluation manifest compatibility.
