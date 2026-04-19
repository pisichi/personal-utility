import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Verify that the CodeEditor markup includes standard classes
// and that line wrapping is enabled.

test("CodeEditor uses correct classes and configuration", () => {
  const file = readFileSync(resolve(__dirname, "../editors/CodeEditor.svelte"), "utf-8");
  expect(file).toMatch(/h-full/);
  expect(file).toMatch(/lineWrapping/);
  expect(file).toMatch(/overflow-hidden/);
});
