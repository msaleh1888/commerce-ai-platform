import type { DemoScenarioData } from "../contracts";

const acmeTenant = {
  id: "tenant_acme_outlet",
  name: "Acme Outlet",
  slug: "acme-outlet",
} as const;

const merchandiserCapabilities = [
  "catalog.product:read",
  "catalog.review:read",
  "evaluation.run:read",
  "audit.event:read",
] as const;

export const acmeOutletScenario = {
  id: "acme-outlet",
  session: {
    actor: {
      id: "user_acme_jordan_lee",
      name: "Jordan Lee",
      email: "jordan.lee@acme-outlet.example",
    },
    activeTenant: acmeTenant,
    memberships: [
      {
        tenant: acmeTenant,
        role: "merchandiser",
        allowedCapabilities: merchandiserCapabilities,
      },
    ],
    role: "merchandiser",
    allowedCapabilities: merchandiserCapabilities,
  },
  dashboard: {
    metricCards: [
      {
        id: "metric_acme_products_indexed",
        label: "Products indexed",
        value: "6,208",
        status: "ready",
        sourceContext: "Catalog projection idx_acme_catalog_v2026_07_11",
      },
      {
        id: "metric_acme_supplier_rows",
        label: "Supplier rows processed",
        value: "378",
        status: "ready",
        sourceContext: "Acme outlet electronics import imp_acme_2026_07_11_001",
      },
      {
        id: "metric_acme_review_open",
        label: "Open duplicate reviews",
        value: "2",
        status: "review_required",
        sourceContext: "Matching config match_cfg_acme_demo_v1",
      },
      {
        id: "metric_acme_search_quality",
        label: "Demo search quality",
        value: "nDCG@10 0.78",
        status: "ready",
        sourceContext: "Demo evaluation run eval_acme_2026_07_11_r01",
      },
    ],
    recentImports: [
      {
        id: "imp_acme_2026_07_11_001",
        source: "acme-outlet-portable-storage.csv",
        supplierName: "Metro Electronics",
        status: "indexed",
        submittedAt: "2026-07-11T10:12:00Z",
        completedAt: "2026-07-11T10:18:40Z",
        rowCounts: {
          total: 378,
          accepted: 378,
          normalized: 372,
          rejected: 0,
          reviewCandidates: 2,
        },
        searchableState: "searchable",
      },
    ],
    feedHealth: [
      {
        id: "feed_acme_metro_storage",
        source: "Metro Electronics",
        status: "ready",
        lastReceivedAt: "2026-07-11T10:12:00Z",
        detail: "Portable storage feed indexed for Acme Outlet.",
      },
    ],
    pipelineStages: [
      {
        id: "stage_acme_ingestion",
        label: "Ingestion",
        status: "ready",
        processedCount: 378,
        issueCount: 0,
      },
      {
        id: "stage_acme_normalization",
        label: "Normalization",
        status: "ready",
        processedCount: 372,
        issueCount: 6,
      },
      {
        id: "stage_acme_matching",
        label: "Duplicate matching",
        status: "review_required",
        processedCount: 372,
        issueCount: 2,
      },
      {
        id: "stage_acme_indexing",
        label: "Search indexing",
        status: "ready",
        processedCount: 372,
        issueCount: 0,
      },
    ],
    reviewSummary: {
      open: 2,
      highRisk: 0,
      assignedToMe: 1,
      oldestOpenAge: "6h",
    },
    reviewCases: [
      {
        caseId: "rev_acme_dup_samsung_t7_shield_001",
        tenantId: "tenant_acme_outlet",
        status: "unresolved",
        risk: "medium",
        proposal: "merge_duplicate",
        confidence: 0.87,
        reasonCodes: ["brand_match", "mpn_match", "capacity_match", "title_similarity"],
        sourceImportId: "imp_acme_2026_07_11_001",
        sourceSupplier: "Metro Electronics",
        age: "6h",
        assignee: "Jordan Lee",
        title: "Samsung T7 Shield Portable SSD duplicate candidate",
      },
    ],
    evaluationSummary: {
      manifestId: "manifest_acme_m2_demo_v1",
      runId: "eval_acme_2026_07_11_r01",
      configurationId: "retrieval_hybrid_cfg_acme_demo_v1",
      status: "demo_data",
      evaluatedAt: "2026-07-11T11:02:00Z",
      metrics: [
        {
          id: "metric_acme_ndcg10",
          label: "Search nDCG@10",
          value: "0.78",
          baselineValue: "0.71 lexical baseline",
          delta: "+0.07",
        },
        {
          id: "metric_acme_duplicate_precision",
          label: "Duplicate precision@5",
          value: "0.86",
          baselineValue: "0.82 rules baseline",
          delta: "+0.04",
        },
      ],
      baselineComparison:
        "Demo fixture compares Acme Outlet search and matching against tenant-local baseline labels.",
      demoDataNotice:
        "Demo evaluation data; not a verified production measurement.",
    },
    auditEvents: [
      {
        id: "audit_acme_2026_07_11_001",
        timestamp: "2026-07-11T10:19:02Z",
        actor: "System",
        tenant: acmeTenant,
        action: "search.index.updated",
        target: "idx_acme_catalog_v2026_07_11",
        metadata: ["372 normalized rows searchable", "tenant scoped projection"],
      },
    ],
  },
  reviewCases: [
    {
      summary: {
        caseId: "rev_acme_dup_samsung_t7_shield_001",
        tenantId: "tenant_acme_outlet",
        status: "unresolved",
        risk: "medium",
        proposal: "merge_duplicate",
        confidence: 0.87,
        reasonCodes: ["brand_match", "mpn_match", "capacity_match", "title_similarity"],
        sourceImportId: "imp_acme_2026_07_11_001",
        sourceSupplier: "Metro Electronics",
        age: "6h",
        assignee: "Jordan Lee",
        title: "Samsung T7 Shield Portable SSD duplicate candidate",
      },
      recordA: {
        id: "prd_acme_supplier_me_samsung_t7shield_2tb",
        supplier: "Metro Electronics",
        supplierSku: "ME-SAM-T7SHIELD-2TB-BLK",
        title: "Samsung T7 Shield Portable SSD 2TB Black",
        brand: "Samsung",
        category: "Portable SSD",
        gtin: "887276651566",
        manufacturerPartNumber: "MU-PE2T0S/AM",
        price: 164.99,
        currency: "USD",
        color: "Black",
        capacity: "2TB",
        connectivity: "USB-C",
        sourceImportId: "imp_acme_2026_07_11_001",
      },
      recordB: {
        id: "prd_acme_canonical_samsung_t7shield_2tb",
        supplier: "Acme Outlet Canonical Catalog",
        supplierSku: "ACME-STORAGE-2204",
        title: "Samsung T7 Shield Portable SSD 2TB",
        brand: "Samsung",
        category: "Portable SSD",
        gtin: "887276651566",
        manufacturerPartNumber: "MU-PE2T0S/AM",
        price: 169.99,
        currency: "USD",
        color: "Black",
        capacity: "2TB",
        connectivity: "USB-C",
        sourceImportId: "imp_acme_seed_catalog_2026_07_01",
      },
      provenance: [
        {
          field: "gtin",
          source: "Metro Electronics",
          sourceImportId: "imp_acme_2026_07_11_001",
          sourceRow: 44,
          observedAt: "2026-07-11T10:13:20Z",
        },
      ],
      rawNormalizedCanonical: [
        {
          field: "title",
          rawValue: "SAMSUNG T7 SHIELD 2TB PORTABLE SSD BLK",
          normalizedValue: "Samsung T7 Shield Portable SSD 2TB Black",
          canonicalValue: "Samsung T7 Shield Portable SSD 2TB",
        },
      ],
      conflicts: [
        {
          field: "title",
          recordAValue: "Includes Black color suffix",
          recordBValue: "Canonical title omits color suffix",
          severity: "low",
          note: "Color is preserved separately.",
        },
      ],
      signals: [
        {
          id: "signal_acme_gtin_exact",
          label: "GTIN exact match",
          value: "887276651566",
          weight: "supporting",
          explanation: "Both records use the same normalized GTIN.",
        },
      ],
      approvalContext: {
        required: true,
        operationId: "op_demo_acme_merge_samsung_t7shield_20260711",
        requiredCapability: "catalog.approval:execute",
        allowedForCurrentRole: false,
        message:
          "This merchandiser fixture can inspect evidence but cannot execute approval; no server-side catalog mutation occurs.",
      },
      auditPreview: {
        action: "approval.duplicate_merge.requested",
        target: "prd_acme_canonical_samsung_t7shield_2tb",
        metadata: [
          "source prd_acme_supplier_me_samsung_t7shield_2tb",
          "operation op_demo_acme_merge_samsung_t7shield_20260711",
          "confidence 0.87",
          "approval capability unavailable for current role",
        ],
      },
      evaluationContext: {
        label: "Demo duplicate-review evaluation context",
        runId: "eval_acme_2026_07_11_r01",
        manifestId: "manifest_acme_m2_demo_v1",
        configurationId: "match_cfg_acme_demo_v1",
        status: "demo_data",
        metricNotes: [
          "Precision labels are tenant-local demo context.",
          "Metrics are not production measurements.",
        ],
      },
    },
  ],
} as const satisfies DemoScenarioData;
