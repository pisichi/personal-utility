import { expect, test } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

// Ensure comparator component markup references the height variable
// and that the merge view uses lineWrapping.

test("Comparator component includes editor height style", () => {
  const file = readFileSync(resolve(__dirname, "../features/diff/Comparator.svelte"), "utf-8");
  expect(file).toMatch(/--editor-height/);
  expect(file).toMatch(/lineWrapping/);
});
