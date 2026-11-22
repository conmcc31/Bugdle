import { expect, test } from "vitest";
import { puzzles } from "../data";
import { supportedLanguages, type BugdlePuzzle } from "../game/types";
import { validatePuzzle, validatePuzzleCatalog } from "../game/validation";

// Pin each answer to its statement so editing a snippet cannot silently move it.
const targetStatements: Record<string, string[]> = {
  "js-cart-total": [
    "for (let i = 0; i < items.length - 1; i++) {",
    "total: subtotal + discount,",
  ],
  "js-user-filter": [
    "return user.active || containsQuery;",
    "const limit = options.limit || 10;",
  ],
  "ts-order-summary": [
    "if (order.status === \"paid\") {",
    "unitCount += 1;",
  ],
  "ts-access-control": [
    "return minute <= session.closes;",
    "if (pass.active) {",
  ],
  "py-scoreboard": [
    "totals[name] = score",
    "return (total, name)",
  ],
  "py-inventory": [
    "return stock[item] > quantity",
    "stock[item] += quantity",
  ],
};

test("the V1 catalog has two valid puzzles in each supported language", () => {
  validatePuzzleCatalog(puzzles);
  expect(puzzles).toHaveLength(6);
  for (const language of supportedLanguages) {
    expect(puzzles.filter(puzzle => puzzle.language === language)).toHaveLength(2);
  }
});

test.each(puzzles)("$id keeps its reviewed target statements", puzzle => {
  const lines = puzzle.code.split("\n");
  expect(puzzle.maxAttempts).toBe(5);
  expect(puzzle.bugs.map(bug => lines[bug.line - 1].trim()))
    .toEqual(targetStatements[puzzle.id]);
});

const base = puzzles[0];
test("catalog rejects repeated IDs", () => {
  expect(() => validatePuzzleCatalog([base, base])).toThrow(/duplicate puzzle ID/);
});

test.each<[Partial<BugdlePuzzle>, RegExp]>([
  [{ id: " " }, /id must be nonempty/],
  [{ code: "\n" }, /code must be nonempty/],
  [{ maxAttempts: 0 }, /positive integer/],
  [{ maxAttempts: 1.5 }, /positive integer/],
  [{ bugs: base.bugs.slice(0, 1) }, /at least two/],
  [{ bugs: [base.bugs[0], base.bugs[0]] }, /duplicate target/],
])("rejects invalid puzzle fields (%j)", (changes, message) => {
  expect(() => validatePuzzle({ ...base, ...changes })).toThrow(message);
});

test.each([
  [0, /outside/], [4, /outside/], [1.5, /integer/], [2, /blank/],
] as const)("rejects invalid target line %s", (line, message) => {
  const bugs = [{ line, explanation: "Example" }, { line: 3, explanation: "Example" }];
  expect(() => validatePuzzle({ ...base, code: "first\n  \nlast", bugs })).toThrow(message);
});

test("rejects a missing explanation", () => {
  const bugs = [{ ...base.bugs[0], explanation: " " }, base.bugs[1]];
  expect(() => validatePuzzle({ ...base, bugs })).toThrow(/missing explanation/);
});
