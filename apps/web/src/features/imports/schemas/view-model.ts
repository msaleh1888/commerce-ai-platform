export type ImportProduct = {
  readonly id: string;
  readonly sourceRowNumber: number;
  readonly supplierSku: string;
  readonly title: string;
  readonly brand: string | null;
  readonly category: string | null;
  readonly price: string;
  readonly currency: string;
  readonly gtin: string | null;
  readonly manufacturerPartNumber: string | null;
  readonly rawSource: Record<string, string>;
  readonly provenance: Record<string, string | number>;
};

export type ImportAuditEvent = {
  readonly eventType: string;
  readonly fromStatus: string | null;
  readonly toStatus: string;
  readonly message: string;
  readonly createdAt: string;
};

export type ImportDetail = {
  readonly id: string;
  readonly tenantId: string;
  readonly status: "queued" | "processing" | "completed" | "failed" | "partial";
  readonly source: {
    readonly filename: string;
    readonly contentType: string;
    readonly sha256: string;
    readonly byteSize: number;
  };
  readonly counts: { readonly accepted: number; readonly rejected: number };
  readonly products: readonly ImportProduct[];
  readonly auditHistory: readonly ImportAuditEvent[];
};

export type ImportFeatureState =
  | { readonly kind: "loading"; readonly message: string }
  | { readonly kind: "empty"; readonly message: string }
  | { readonly kind: "error"; readonly message: string }
  | { readonly kind: "permission_denied"; readonly message: string }
  | { readonly kind: "ready"; readonly detail: ImportDetail };

export function toImportFeatureState(
  detail: ImportDetail | null,
  allowedCapabilities: readonly string[],
): ImportFeatureState {
  if (!allowedCapabilities.includes("catalog.import:read")) {
    return {
      kind: "permission_denied",
      message: "catalog.import:read is required to inspect catalog imports.",
    };
  }
  if (detail === null) {
    return { kind: "empty", message: "No supplier import has been selected." };
  }
  return { kind: "ready", detail };
}
