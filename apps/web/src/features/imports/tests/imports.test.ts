import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ImportStateView } from "../components/ImportWorkspace";
import type { ImportDetail } from "../schemas/view-model";
import { toImportFeatureState } from "../schemas/view-model";

globalThis.React = React;

const completedImport: ImportDetail = {
  auditHistory: [
    {
      createdAt: "2026-07-20T20:00:00Z",
      eventType: "import_queued",
      fromStatus: "artifact_stored",
      message: "Import artifact stored and processing queued.",
      toStatus: "queued",
    },
    {
      createdAt: "2026-07-20T20:01:00Z",
      eventType: "import_completed",
      fromStatus: "processing",
      message: "Import processing completed.",
      toStatus: "completed",
    },
  ],
  counts: { accepted: 1, rejected: 0 },
  id: "import_1",
  products: [
    {
      brand: "Northstar",
      category: "Footwear",
      currency: "USD",
      gtin: "1234567890123",
      id: "supplier_product_1",
      manufacturerPartNumber: "MPN-1",
      price: "89.99",
      provenance: { importId: "import_1", mappingVersion: "m3_supplier_v1", sourceRowNumber: 1 },
      rawSource: { mpn: "MPN-1", supplier_sku: "SKU-1", title: "Trail Shoe" },
      sourceRowNumber: 1,
      supplierSku: "SKU-1",
      title: "Trail Shoe",
    },
  ],
  source: {
    byteSize: 120,
    contentType: "text/csv",
    filename: "northstar-products.csv",
    sha256: "abc123",
  },
  status: "completed",
  tenantId: "tenant_northstar",
};

test("import state covers permission denied, empty, loading, error, and ready", () => {
  assert.equal(toImportFeatureState(completedImport, []).kind, "permission_denied");
  assert.equal(toImportFeatureState(null, ["catalog.import:read"]).kind, "empty");
  assert.deepEqual({ kind: "loading", message: "Loading import status." }, { kind: "loading", message: "Loading import status." });
  assert.deepEqual({ kind: "error", message: "Failed." }, { kind: "error", message: "Failed." });
  assert.equal(toImportFeatureState(completedImport, ["catalog.import:read"]).kind, "ready");
});

test("completed import renders counts, provenance, raw source values, and audit history", () => {
  const state = toImportFeatureState(completedImport, ["catalog.import:read"]);
  const markup = renderToStaticMarkup(createElement(ImportStateView, { state }));

  assert.match(markup, /completed/);
  assert.match(markup, /1 accepted, 0 rejected/);
  assert.match(markup, /SKU-1/);
  assert.match(markup, /Trail Shoe/);
  assert.match(markup, /MPN-1/);
  assert.match(markup, /m3_supplier_v1/);
  assert.match(markup, /Import artifact stored and processing queued/);
  assert.match(markup, /Import processing completed/);
});
