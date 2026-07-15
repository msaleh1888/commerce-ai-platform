# Product Brief

## Working Name

Commerce Intelligence Operations Platform

The final product name is still open. Until then, this working name describes the project plainly enough for planning, portfolio writing, and technical documentation.

## One-Sentence Description

A multi-tenant AI commerce operations platform that imports messy supplier catalogs, normalizes and indexes product data, detects duplicate product records, supports evaluated hybrid search, and routes risky catalog changes through human review.

## Why This Exists

Retailers often receive product data from many suppliers in inconsistent formats. The same product can appear with different titles, missing attributes, conflicting identifiers, and category drift. Search quality suffers, catalog teams waste time reviewing duplicates manually, and AI recommendations become risky when they cannot cite reliable evidence.

This project demonstrates how to build a production-minded AI SaaS workflow around that problem instead of building a generic chatbot. The first release focuses on a polished, demonstrable workflow that proves backend reliability, multi-tenancy, retrieval quality, human approval, and evaluation discipline.

## Target Users

- Retailer administrator: manages tenants, members, roles, and catalog sources.
- Catalog manager: imports catalogs, reviews duplicate candidates, approves safe changes, and monitors import status.
- Merchandiser: tests product search quality and investigates weak results.
- AI/data engineer: compares retrieval configurations and reviews evaluation reports.
- Viewer: can inspect catalog/search/evaluation results without changing state.

## First Portfolio MVP

The first portfolio release should prove one complete workflow:

1. A user signs in and works inside a tenant.
2. The user imports CSV or JSON supplier catalog data.
3. The system validates, normalizes, stores, and indexes the products.
4. The catalog becomes searchable through lexical, dense, and hybrid retrieval.
5. The system detects likely duplicate or variant product records.
6. A catalog manager reviews a duplicate case with evidence.
7. The manager approves or rejects the proposed catalog operation.
8. The system records the decision in the authoritative database and audit log.
9. An evaluation report shows retrieval and matching quality against fixed baselines.

## Portfolio Signal

The project should make these hiring claims defensible:

- I can design and implement a real AI-enabled SaaS product.
- I can build reliable async ingestion and idempotent processing.
- I can implement retrieval systems with measured baselines.
- I can use LLMs and embeddings as bounded components, not trusted magic.
- I can enforce multi-tenant authorization across APIs, workers, and retrieval.
- I can build human approval into AI-assisted operations.
- I can communicate architecture tradeoffs through ADRs and reproducible evidence.

## Non-Goals for the First Portfolio MVP

- Payment processing or billing.
- Real Shopify or marketplace integrations.
- Fully autonomous catalog mutation.
- Multimodal product image, OCR, or video workflows.
- Memory systems.
- MCP tooling.
- Multi-agent systems.
- Kubernetes production deployment.
- A broad analytics suite.
- A generic document chatbot.

These remain valid later directions, but they should not distract from shipping the first polished demo.

## Success Criteria

The MVP is successful when a reviewer can run or watch a demo and understand:

- What business problem the product solves.
- How data enters, moves through, and exits the system.
- How tenant boundaries are enforced.
- How retrieval quality is measured.
- How risky AI/catalog actions require human approval.
- What evidence supports the public portfolio claims.

