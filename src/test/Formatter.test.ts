import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = resolve(__filename, '..');

// Ensure formatter component uses modern classes and supports the new features.

test("Formatter component includes correct logic and structure", () => {
  const file = readFileSync(resolve(__dirname, "../features/formatter/Formatter.svelte"), "utf-8");
  expect(file).toMatch(/flex-1/);
  expect(file).toMatch(/detectFormatType/);
  expect(file).toMatch(/import { validateXml, formatXmlWithOrgMsg } from/);
  expect(file).toMatch(/formats\.find/);
  expect(file).toMatch(/dispatch\('update'/);
  expect(file).toMatch(/errorMessage/);
  expect(file).toMatch(/syntaxError/);
});
