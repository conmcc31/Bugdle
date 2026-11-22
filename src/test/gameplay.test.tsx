import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { App } from "../app/App";
import { highlight } from "../components/highlight";
import { puzzles } from "../data";

afterEach(() => { cleanup(); vi.restoreAllMocks(); window.localStorage.clear(); });
const puzzle = puzzles[0];
function openPuzzle() {
  window.history.replaceState(null, "", `#puzzles/${puzzle.id}`);
  render(<App />);
}

const [first, second] = puzzle.bugs.map(bug => bug.line);
const line = (n: number) => screen.getByRole("button", { name: new RegExp(`^Line ${n}: `) });
const submit = () => screen.getByRole<HTMLButtonElement>("button", { name: "Submit guess" });

test("keyboard selection, selection cap, and clear", async () => {
  const user = userEvent.setup();
  openPuzzle();
  expect(submit().disabled).toBe(true);
  expect(screen.queryByRole("button", { name: /^Line 4:/ })).toBeNull();
  screen.getByRole("button", { name: "Skip to guess controls" }).focus();
  await user.keyboard("{Enter}");
  expect(document.activeElement?.id).toBe("selection-heading");
  line(1).focus();
  await user.keyboard("{Enter}");
  expect(line(1).getAttribute("aria-pressed")).toBe("true");
  await user.keyboard(" ");
  expect(line(1).getAttribute("aria-pressed")).toBe("false");
  await user.click(line(1));
  await user.click(line(2));
  await user.click(line(3));
  expect(screen.getByRole("status").textContent).toMatch(/Selection full/);
  expect(line(3).getAttribute("aria-pressed")).toBe("false");
  expect(submit().disabled).toBe(false);
  await user.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(submit().disabled).toBe(true);
  expect(screen.getAllByRole("button", { pressed: false })).toHaveLength(
    puzzle.code.split("\n").filter(source => source.trim()).length,
  );
});

test("partial feedback stays aggregate until a win, and replay starts a fresh game", async () => {
  const user = userEvent.setup();
  openPuzzle();
  await user.click(line(first));
  await user.click(line(1));
  await user.click(submit());
  expect(screen.getByRole("status").textContent).toMatch(/Guess 1: 1 of 2 correct/);
  expect(screen.getByText("1 of 2 correct").className).toBe("yellow");
  expect(line(first).className).toBe(line(1).className);
  expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  for (const bug of puzzle.bugs) expect(screen.queryByText(bug.explanation)).toBeNull();

  await user.click(line(first));
  await user.click(line(second));
  await user.click(submit());
  expect(screen.getByRole("heading", { name: "Solved in 2/5" })).toBeDefined();
  for (const bug of puzzle.bugs) expect(screen.getByText(bug.explanation)).toBeDefined();
  expect(screen.queryByRole("button", { name: /^Line / })).toBeNull();
  await user.click(screen.getByRole("button", { name: "Replay puzzle" }));
  expect(screen.getByText("5 attempts remaining")).toBeDefined();
  expect(screen.queryByText(puzzle.bugs[0].explanation)).toBeNull();
  expect(submit().disabled).toBe(true);
});

test("five misses exhaust the attempts and reveal the solutions", async () => {
  const user = userEvent.setup();
  openPuzzle();
  for (let i = 0; i < puzzle.maxAttempts; i++) {
    await user.click(line(1));
    await user.click(line(2));
    await user.click(submit());
  }
  expect(screen.getAllByText("0 of 2 correct")).toHaveLength(5);
  expect(screen.getByRole("heading", { name: "Out of attempts" })).toBeDefined();
  expect(screen.queryByRole("button", { name: "Submit guess" })).toBeNull();
  for (const bug of puzzle.bugs) expect(screen.getByText(bug.explanation)).toBeDefined();
});

test.each(puzzles)("highlighting preserves every source line of $id", async fixture => {
  const tokens = await highlight(fixture);
  expect(tokens.map(row => row.map(token => token.content).join(""))).toEqual(fixture.code.split("\n"));
  expect(new Set(tokens.flat().map(token => token.color)).size).toBeGreaterThan(1);
});

test("refresh restores submitted guesses, and restart requires confirmation", async () => {
  const user = userEvent.setup();
  openPuzzle();
  await user.click(line(1));
  await user.click(line(2));
  await user.click(submit());
  await user.click(line(3));
  cleanup();
  openPuzzle();
  expect(screen.getByText("4 attempts remaining")).toBeDefined();
  expect(screen.getByText("0 of 2 correct")).toBeDefined();
  expect(screen.queryAllByRole("button", { pressed: true })).toHaveLength(0);
  const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
  const restart = screen.getByRole("button", { name: "Restart puzzle" });
  await user.click(restart);
  expect(screen.getByText("4 attempts remaining")).toBeDefined();
  await user.click(restart);
  expect(confirm).toHaveBeenCalledTimes(2);
  cleanup();
  openPuzzle();
  expect(screen.getByText("5 attempts remaining")).toBeDefined();
});

test("a quota error keeps the game playable and the next save retries the whole history", async () => {
  const user = userEvent.setup();
  openPuzzle();
  vi.spyOn(Object.getPrototypeOf(window.localStorage), "setItem").mockImplementationOnce(() => {
    throw new DOMException("Full", "QuotaExceededError");
  });
  await user.click(line(1));
  await user.click(line(2));
  await user.click(submit());
  expect(screen.getByRole("alert").textContent).toMatch(/could not be saved/);
  expect(screen.getByText("4 attempts remaining")).toBeDefined();
  await user.click(line(first));
  await user.click(line(second));
  await user.click(submit());
  expect(screen.queryByRole("alert")).toBeNull();
  cleanup();
  openPuzzle();
  expect(screen.getByRole("heading", { name: "Solved in 2/5" })).toBeDefined();
});
