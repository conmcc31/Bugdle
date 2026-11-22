import { afterEach, expect, test, vi } from "vitest";
import { puzzles } from "../data";
import { resetPuzzleProgress, submitGuess } from "../game/rules";
import { loadProgress, saveProgress } from "../game/storage";

const [first, second] = puzzles;
const ongoing = submitGuess(first, [1, 2], resetPuzzleProgress(first.id));
const won = submitGuess(second, second.bugs.map(bug => bug.line), resetPuzzleProgress(second.id));

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

test.each([
  ["invalid JSON", "{"],
  ["wrong shape", "null"],
  ["wrong puzzle", JSON.stringify(won)],
  ["invalid line", JSON.stringify({ ...ongoing, guesses: [{ ...ongoing.guesses[0], selectedLines: [0, 2] }] })],
  ["wrong score", JSON.stringify({ ...ongoing, guesses: [{ ...ongoing.guesses[0], correctCount: 2 }] })],
  ["wrong status", JSON.stringify({ ...ongoing, state: "won" })],
  ["extra attempts", JSON.stringify({ ...ongoing, guesses: Array(6).fill(ongoing.guesses[0]) })],
])("isolates a save with %s and allows a fresh submission", (_, damaged) => {
  saveProgress(won);
  window.localStorage.setItem(`bugdle:v1:progress:${first.id}`, damaged);
  expect(loadProgress(puzzles)).toEqual({ [second.id]: won });
  expect(saveProgress(ongoing)).toBe(true);
  expect(loadProgress(puzzles)).toEqual({ [first.id]: ongoing, [second.id]: won });
});

test("blocked storage access falls back to an empty session", () => {
  vi.spyOn(window, "localStorage", "get").mockImplementation(() => { throw new Error("blocked"); });
  expect(loadProgress(puzzles)).toEqual({});
  expect(saveProgress(ongoing)).toBe(false);
});
