import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const uiIndex = await readFile(new URL("./index.ts", import.meta.url), "utf8");

const requiredPrimitives = [
  "Button",
  "IconButton",
  "StatusBadge",
  "Panel",
  "DataTable",
  "Tabs",
  "Select",
  "Dialog",
  "Drawer",
  "Tooltip",
  "EmptyState",
];

test("M2 shared primitive inventory is exported", () => {
  for (const primitive of requiredPrimitives) {
    assert.match(uiIndex, new RegExp(`\\b${primitive}\\b`));
  }
});

test("shared primitives stay presentational", async () => {
  for (const primitive of requiredPrimitives) {
    const source = await readFile(new URL(`./${primitive}.tsx`, import.meta.url), "utf8");

    assert.doesNotMatch(source, /from ["']@\/features\//);
    assert.doesNotMatch(source, /from ["']@\/lib\/api-client/);
    assert.doesNotMatch(source, /from ["']@\/lib\/auth/);
    assert.doesNotMatch(source, /from ["']@\/lib\/tenant/);
  }
});

test("modal primitives expose the required accessibility behavior", async () => {
  for (const primitive of ["Dialog", "Drawer"]) {
    const source = await readFile(new URL(`./${primitive}.tsx`, import.meta.url), "utf8");

    assert.match(source, /aria-labelledby=/);
    assert.match(source, /aria-describedby=/);
    assert.match(source, /useModalAccessibility/);
    assert.match(source, /bg-surface-overlay/);
  }
});

test("tabs expose controlled ARIA relationships and keyboard navigation", async () => {
  const source = await readFile(new URL("./Tabs.tsx", import.meta.url), "utf8");

  assert.match(source, /aria-controls=/);
  assert.match(source, /aria-labelledby=/);
  assert.match(source, /ArrowRight/);
  assert.match(source, /ArrowLeft/);
});
