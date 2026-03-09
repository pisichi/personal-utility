import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Verify that the CodeEditor markup includes the standard height variable
// and that line wrapping is enabled to prevent horizontal scrollbars.

test("CodeEditor uses standard height variable", () => {
  const file = readFileSync(resolve(__dirname, "../editors/CodeEditor.svelte"), "utf-8");
  expect(file).toMatch(/--editor-height/);
  expect(file).toMatch(/lineWrapping/);
  expect(file).toMatch(/overflow-auto/);
});
