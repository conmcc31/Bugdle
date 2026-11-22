import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test } from "vitest";
import { App } from "../app/App";
import { puzzles } from "../data";
import { languages } from "../data/languages";

afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
});

const card = (title: string) => screen.getByRole("link", { name: new RegExp(title) });

test("the library opens every catalog puzzle and provides a return link", async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole("heading", { level: 1, name: "Bugdle" })).toBeDefined();
  expect(screen.getAllByText("Not started")).toHaveLength(puzzles.length);
  for (const puzzle of puzzles) {
    const entry = card(puzzle.title);
    for (const label of [languages[puzzle.language][0], puzzle.difficulty, `${puzzle.bugs.length} bugs`]) {
      expect(within(entry).getByText(label)).toBeDefined();
    }
    await user.click(entry);
    await screen.findByRole("heading", { name: puzzle.title });
    await user.click(screen.getByRole("link", { name: /Back to puzzles/ }));
    await screen.findByRole("heading", { name: "Puzzle library" });
  }
});

test("the library tracks independent games and resumes submitted guesses", async () => {
  const user = userEvent.setup();
  render(<App />);
  const [first, second] = puzzles;
  async function open(title: string) {
    await user.click(card(title));
    await screen.findByRole("heading", { name: title });
  }
  async function back() {
    await user.click(screen.getByRole("link", { name: /Back to puzzles/ }));
    await screen.findByRole("heading", { name: "Puzzle library" });
  }
  async function guess(lines: number[]) {
    for (const line of lines) {
      await user.click(screen.getByRole("button", { name: new RegExp(`^Line ${line}: `) }));
    }
    await user.click(screen.getByRole("button", { name: "Submit guess" }));
  }
  await open(first.title);
  await guess([1, 2]);
  await back();
  expect(within(card(first.title)).getByText("In progress")).toBeDefined();
  await open(second.title);
  await guess(second.bugs.map(bug => bug.line));
  await back();
  expect(within(card(second.title)).getByText("Solved")).toBeDefined();
  await open(first.title);
  expect(screen.getByText("4 attempts remaining")).toBeDefined();
  for (let i = 1; i < first.maxAttempts; i++) await guess([1, 2]);
  await back();
  expect(within(card(first.title)).getByText("Not solved")).toBeDefined();
  await open(second.title);
  expect(screen.getByRole("heading", { name: "Solved in 1/5" })).toBeDefined();
  await user.click(screen.getByRole("button", { name: "Replay puzzle" }));
  await back();
  expect(within(card(first.title)).getByText("Not solved")).toBeDefined();
  expect(within(card(second.title)).getByText("Not started")).toBeDefined();
});
