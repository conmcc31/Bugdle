import { expect, test } from "vitest";
import { puzzles } from "../data";
import { canSubmit, evaluateGuess, resetPuzzleProgress, submitGuess, toggleLine } from "../game/rules";
import type { BugdlePuzzle, PuzzleProgress } from "../game/types";

const puzzle: BugdlePuzzle = {
  ...puzzles[0],
  code: "first\n  \nthird\nfourth\nfifth",
  bugs: [
    { line: 1, explanation: "First issue" },
    { line: 4, explanation: "Second issue" },
  ],
};
const fresh = resetPuzzleProgress(puzzle.id);

test("a full selection permits deselection and reports when another line will not fit", () => {
  const one = toggleLine(puzzle, [], 1).selectedLines;
  const two = toggleLine(puzzle, one, 4).selectedLines;
  expect(one).toEqual([1]);
  expect(two).toEqual([1, 4]);
  expect(toggleLine(puzzle, two, 5)).toEqual({ selectedLines: two, reason: "selection-full" });
  expect(toggleLine(puzzle, two, 1)).toEqual({ selectedLines: [4] });
  expect(canSubmit(puzzle, one, fresh)).toBe(false);
  expect(canSubmit(puzzle, two, fresh)).toBe(true);
});

test.each([0, 2, 6, -1, 1.5, NaN])("line %s cannot be added or submitted", line => {
  expect(toggleLine(puzzle, [4], line)).toEqual({ selectedLines: [4], reason: "invalid-line" });
  expect(canSubmit(puzzle, [4, line], fresh)).toBe(false);
  expect(() => submitGuess(puzzle, [4, line], fresh)).toThrow();
});

test.each([[], [1], [4, 4], [3, 4, 5]].map(lines => ({ lines })))(
  "rejects incomplete, duplicate, or oversized guesses ($lines)", ({ lines }) => {
    expect(canSubmit(puzzle, lines, fresh)).toBe(false);
    expect(() => evaluateGuess(puzzle, lines)).toThrow();
    expect(() => submitGuess(puzzle, lines, fresh)).toThrow();
  },
);

test.each([
  { lines: [3, 5], correctCount: 0, status: "red" },
  { lines: [1, 5], correctCount: 1, status: "yellow" },
  { lines: [4, 1], correctCount: 2, status: "green" },
])("returns only aggregate feedback for a $status guess", ({ lines, correctCount, status }) => {
  expect(evaluateGuess(puzzle, lines)).toEqual({ correctCount, status });
});

test("progress stores sorted copies and allows lines to be reused in later attempts", () => {
  const selection = [5, 1];
  const first = submitGuess(puzzle, selection, fresh);
  expect(selection).toEqual([5, 1]);
  selection.length = 0;
  const second = submitGuess(puzzle, [1, 3], first);
  expect(first.guesses).toEqual([{ selectedLines: [1, 5], correctCount: 1, status: "yellow" }]);
  expect(second.guesses).toEqual([...first.guesses, {
    selectedLines: [1, 3], correctCount: 1, status: "yellow",
  }]);
  expect(resetPuzzleProgress(puzzle.id)).toEqual({ puzzleId: puzzle.id, guesses: [], state: "in-progress" });
  expect(fresh.guesses).toEqual([]);
});

test.each([
  { final: [1, 4], outcome: "won" },
  { final: [3, 4], outcome: "lost" },
  { final: [3, 5], outcome: "lost" },
])("a fifth guess of $final ends the game as $outcome", ({ final, outcome }) => {
  let progress = fresh;
  for (let attempt = 1; attempt <= 4; attempt++) {
    progress = submitGuess(puzzle, [3, 5], progress);
    expect(progress.state).toBe("in-progress");
  }
  expect(canSubmit(puzzle, final, progress)).toBe(true);
  const finished = submitGuess(puzzle, final, progress);
  expect(finished.guesses).toHaveLength(5);
  expect(finished.state).toBe(outcome);
  expect(canSubmit(puzzle, [1, 4], finished)).toBe(false);
  expect(() => submitGuess(puzzle, [1, 4], finished)).toThrow();
});

test("honors the configured bug count and attempt limit", () => {
  const threeBugs = { ...puzzle, bugs: [...puzzle.bugs, { line: 5, explanation: "Third issue" }], maxAttempts: 1 };
  expect(canSubmit(threeBugs, [1, 4], fresh)).toBe(false);
  const result = submitGuess(threeBugs, [1, 3, 4], fresh);
  expect(result.guesses[0].correctCount).toBe(2);
  expect(result.state).toBe("lost");
});

test("an early win and another puzzle's progress both reject submission", () => {
  const won = submitGuess(puzzle, [1, 4], fresh);
  expect(won.state).toBe("won");
  const other: PuzzleProgress = resetPuzzleProgress("other-puzzle");
  for (const progress of [won, other]) {
    expect(canSubmit(puzzle, [3, 5], progress)).toBe(false);
    expect(() => submitGuess(puzzle, [3, 5], progress)).toThrow();
  }
});
