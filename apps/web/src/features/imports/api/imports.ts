import type { ImportDetail } from "../schemas/view-model";

const API_BASE_URL = process.env.NEXT_PUBLIC_COMMERCE_AI_API_URL ?? "http://localhost:8000";

export async function uploadSupplierCatalog(file: File): Promise<{ id: string; tenantId: string; status: string }> {
  const body = new FormData();
  body.append("file", file);
  const response = await fetch(`${API_BASE_URL}/imports`, {
    body,
    credentials: "include",
    method: "POST",
  });
  if (!response.ok) {
    throw new Error(`Import upload failed with ${response.status}.`);
  }
  return response.json();
}

export async function loadImportDetail(importId: string): Promise<ImportDetail> {
  const response = await fetch(`${API_BASE_URL}/imports/${importId}`, {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(`Import detail failed with ${response.status}.`);
  }
  return response.json();
}
