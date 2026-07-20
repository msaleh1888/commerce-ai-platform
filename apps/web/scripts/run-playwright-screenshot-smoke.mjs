import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const nextEnvPath = fileURLToPath(new URL("../next-env.d.ts", import.meta.url));
const playwrightCliPath = fileURLToPath(new URL("../node_modules/@playwright/test/cli.js", import.meta.url));
const originalNextEnv = await readFile(nextEnvPath, "utf8");

const exitCode = await new Promise((resolve, reject) => {
  const child = spawn(process.execPath, [playwrightCliPath, "test", "--config=playwright.config.ts"], {
    stdio: "inherit",
  });

  child.once("error", reject);
  child.once("exit", (code) => resolve(code ?? 1));
});

const currentNextEnv = await readFile(nextEnvPath, "utf8");
if (currentNextEnv !== originalNextEnv) {
  await writeFile(nextEnvPath, originalNextEnv);
}

process.exitCode = exitCode;
