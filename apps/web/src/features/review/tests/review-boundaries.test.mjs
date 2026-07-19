import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";

const reviewRoute = await readFile(
  new URL("../../../app/(app)/review/page.tsx", import.meta.url),
  "utf8",
);

async function readFeatureFiles(relativeDirectory) {
  const directory = new URL(`../${relativeDirectory}`, import.meta.url);
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const relativePath = join(relativeDirectory, entry.name).replaceAll("\\", "/");

    if (entry.isDirectory()) {
      files.push(...(await readFeatureFiles(relativePath)));
      continue;
    }

    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push({
        path: relativePath,
        source: await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8"),
      });
    }
  }

  return files;
}

test("/review route is a thin review feature composition boundary", () => {
  assert.match(reviewRoute, /import\s+\{\s*ReviewWorkspace\s*\}\s+from\s+["']@\/features\/review["']/);
  assert.doesNotMatch(reviewRoute, /PrototypeEmptyState/);
  assert.doesNotMatch(reviewRoute, /features\/demo-data|features\/auth|use[A-Z]\w+|getDemo|useState|useEffect/);
  assert.match(reviewRoute, /return\s+<ReviewWorkspace\s*\/>;/);
});

test("review feature entry point exports the workspace and hides internals", async () => {
  const index = await readFile(new URL("../index.ts", import.meta.url), "utf8");

  assert.match(index, /ReviewWorkspace/);
  assert.doesNotMatch(index, /demo-data|auth|api\/review|state\/review-state/);
});

test("review feature does not import dashboard modules", async () => {
  const files = await readFeatureFiles(".");

  for (const file of files) {
    assert.doesNotMatch(file.source, /features\/dashboard|components\/layout\/PrototypeEmptyState/, file.path);
  }
});

test("review components stay presentational and avoid auth or fixture access", async () => {
  const files = await readFeatureFiles("components");

  for (const file of files) {
    assert.doesNotMatch(file.source, /features\/demo-data|features\/auth|api\/review|getSession|useCurrentSession/, file.path);
  }
});

test("review adapter is React-free and receives safe session data", async () => {
  const adapter = await readFile(new URL("../api/review.ts", import.meta.url), "utf8");
  const state = await readFile(new URL("../state/review-state.ts", import.meta.url), "utf8");

  assert.match(adapter, /CurrentSessionView/);
  assert.doesNotMatch(adapter, /from ["']react["']|useCurrentSession|features\/auth/);
  assert.doesNotMatch(state, /adapters\/review|getSession|from ["']react["']/);
});

test("shared UI primitives remain independent of review internals", async () => {
  const uiDirectory = new URL("../../../components/ui/", import.meta.url);
  const entries = await readdir(uiDirectory, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.name.endsWith(".tsx") && !entry.name.endsWith(".ts")) {
      continue;
    }

    const source = await readFile(new URL(`../../../components/ui/${entry.name}`, import.meta.url), "utf8");
    assert.doesNotMatch(source, /features\/review|features\/demo-data|features\/auth/, entry.name);
  }
});
