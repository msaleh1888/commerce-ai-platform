"use client";

import { FileUp, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Button, Panel, StatusBadge } from "@/components/ui";
import { useCurrentSession } from "@/lib/auth";

import { loadImportDetail, uploadSupplierCatalog } from "../api/imports";
import type { ImportDetail, ImportFeatureState } from "../schemas/view-model";
import { toImportFeatureState } from "../schemas/view-model";

const statusTone: Record<ImportDetail["status"], "processing" | "ready" | "failed" | "review" | "inactive"> = {
  completed: "ready",
  failed: "failed",
  partial: "review",
  processing: "processing",
  queued: "inactive",
};

export function ImportWorkspace() {
  const { session } = useCurrentSession();
  const [selectedImportId, setSelectedImportId] = useState<string | null>(null);
  const [state, setState] = useState<ImportFeatureState>(() => toImportFeatureState(null, session.allowedCapabilities));
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!selectedImportId) {
      setState(toImportFeatureState(null, session.allowedCapabilities));
      return;
    }

    let cancelled = false;
    setState({ kind: "loading", message: "Loading import status." });
    loadImportDetail(selectedImportId)
      .then((detail) => {
        if (!cancelled) {
          setState(toImportFeatureState(detail, session.allowedCapabilities));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ kind: "error", message: "Import details could not be loaded." });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedImportId, session.allowedCapabilities]);

  async function onUpload(formData: FormData) {
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return;
    }
    setUploading(true);
    setState({ kind: "loading", message: "Uploading supplier catalog." });
    try {
      const created = await uploadSupplierCatalog(file);
      setSelectedImportId(created.id);
    } catch {
      setState({ kind: "error", message: "The supplier catalog could not be uploaded." });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
      <Panel
        actions={
          selectedImportId ? (
            <Button onClick={() => setSelectedImportId(selectedImportId)} type="button" variant="secondary">
              <RefreshCw aria-hidden="true" size={16} />
              Refresh
            </Button>
          ) : null
        }
        description="Upload an approved CSV or JSON supplier catalog and inspect the tenant-scoped processing result."
        title="Supplier Imports"
      >
        <form action={onUpload} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium text-text-secondary">
            Catalog file
            <input
              accept=".csv,.json,text/csv,application/json"
              className="min-h-10 border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              name="file"
              type="file"
            />
          </label>
          <Button disabled={uploading} type="submit">
            <FileUp aria-hidden="true" size={16} />
            Upload
          </Button>
        </form>
      </Panel>
      <ImportStateView state={state} />
    </div>
  );
}

export function ImportStateView({ state }: { readonly state: ImportFeatureState }) {
  if (state.kind !== "ready") {
    const title =
      state.kind === "permission_denied"
        ? "Permission required"
        : state.kind === "empty"
          ? "No import selected"
          : state.kind === "loading"
            ? "Loading import"
            : "Import unavailable";
    return (
      <Panel title={title}>
        <p className="text-sm text-text-muted">{state.message}</p>
      </Panel>
    );
  }

  const { detail } = state;
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Panel
        actions={<StatusBadge tone={statusTone[detail.status]}>{detail.status}</StatusBadge>}
        description={`${detail.counts.accepted} accepted, ${detail.counts.rejected} rejected`}
        title={detail.source.filename}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-text-muted">
              <tr>
                <th className="py-2 pr-3">Row</th>
                <th className="py-2 pr-3">SKU</th>
                <th className="py-2 pr-3">Title</th>
                <th className="py-2 pr-3">Price</th>
                <th className="py-2 pr-3">Raw source</th>
              </tr>
            </thead>
            <tbody>
              {detail.products.map((product) => (
                <tr className="border-b border-border last:border-0" key={product.id}>
                  <td className="py-2 pr-3">{product.sourceRowNumber}</td>
                  <td className="py-2 pr-3 font-medium text-text-primary">{product.supplierSku}</td>
                  <td className="py-2 pr-3">{product.title}</td>
                  <td className="py-2 pr-3">{`${product.price} ${product.currency}`}</td>
                  <td className="py-2 pr-3 text-text-muted">{JSON.stringify(product.rawSource)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="Provenance">
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-text-muted">SHA-256</dt>
            <dd className="break-all font-mono text-xs text-text-primary">{detail.source.sha256}</dd>
          </div>
          <div>
            <dt className="text-text-muted">Mapping</dt>
            <dd>{detail.products[0]?.provenance.mappingVersion ?? "m3_supplier_v1"}</dd>
          </div>
        </dl>
        <h3 className="mt-5 text-sm font-semibold text-text-primary">Audit history</h3>
        <ol className="mt-2 space-y-2 text-sm text-text-muted">
          {detail.auditHistory.map((event) => (
            <li key={`${event.eventType}-${event.createdAt}`}>{event.message}</li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
