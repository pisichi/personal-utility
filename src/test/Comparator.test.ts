import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Ensure comparator component markup uses modern classes
// and that the merge view uses lineWrapping.

test("Comparator component includes correct styles and configuration", () => {
  const file = readFileSync(resolve(__dirname, "../features/diff/Comparator.svelte"), "utf-8");
  expect(file).toMatch(/flex-1/);
  expect(file).toMatch(/lineWrapping/);
  expect(file).toMatch(/initMergeView/);
});
