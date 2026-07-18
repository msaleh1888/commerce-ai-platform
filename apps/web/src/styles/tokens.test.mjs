import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const tokenCss = await readFile(new URL("./tokens.css", import.meta.url), "utf8");

const requiredTokens = [
  "--color-surface-application",
  "--color-surface-sidebar",
  "--color-surface-raised",
  "--color-surface-selected",
  "--color-surface-evidence",
  "--color-text-primary",
  "--color-text-secondary",
  "--color-text-muted",
  "--color-text-inverse",
  "--color-border-subtle",
  "--color-focus-ring",
  "--color-accent-deep",
  "--color-accent-teal",
  "--color-status-processing",
  "--color-status-ready",
  "--color-status-review",
  "--color-status-failed",
  "--color-status-inactive",
  "--space-4",
  "--font-size-body",
  "--shadow-raised",
  "--radius-md",
];

test("M2 token groups are present", () => {
  for (const token of requiredTokens) {
    assert.match(tokenCss, new RegExp(`${token}:`));
  }
});
