import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Ensure formatter component uses shared constants and not hard-coded heights
// and that detection logic has been removed in favor of a persisted dropdown.

test("Formatter component relies on shared size constants", () => {
  const file = readFileSync(resolve(__dirname, "../features/formatter/Formatter.svelte"), "utf-8");
  expect(file).not.toMatch(/600px/);
  expect(file).toMatch(/--editor-height/);
  // detection code should be gone
  expect(file).not.toMatch(/detectFormatType/);
  // sanitizeXml helper should exist
  expect(file).toMatch(/function validateXml/);
  // sanitizer removed
  expect(file).not.toMatch(/sanitizeXml/);
  // dropdown only has json/xml, no "auto"
  expect(file).not.toMatch(/option value="auto"/);
  expect(file).toMatch(/option value="json"/);
  expect(file).toMatch(/option value="xml"/);
  // verify we save formatType to localStorage on change
  expect(file).toMatch(/localStorage.setItem\('formatterFormatType'/);
  // error message area present
  expect(file).toMatch(/errorMessage/);
  expect(file).toMatch(/text-red-400/);
});
