import type { BugdlePuzzle, Guess, PuzzleProgress } from "./types";

export function resetPuzzleProgress(puzzleId: string): PuzzleProgress {
  return { puzzleId, guesses: [], state: "in-progress" };
}

function isSelectable(lines: readonly string[], line: number): boolean {
  return Number.isInteger(line) && Boolean(lines[line - 1]?.trim());
}

export function toggleLine(
  puzzle: BugdlePuzzle,
  selectedLines: readonly number[],
  line: number,
): { selectedLines: readonly number[]; reason?: "invalid-line" | "selection-full" } {
  if (!isSelectable(puzzle.code.split("\n"), line)) {
    return { selectedLines, reason: "invalid-line" };
  }
  if (selectedLines.includes(line)) {
    return { selectedLines: selectedLines.filter(selected => selected !== line) };
  }
  if (selectedLines.length >= puzzle.bugs.length) {
    return { selectedLines, reason: "selection-full" };
  }
  return { selectedLines: [...selectedLines, line] };
}

function isCompleteSelection(puzzle: BugdlePuzzle, selectedLines: readonly number[]): boolean {
  const lines = puzzle.code.split("\n");
  const unique = new Set(selectedLines);
  return selectedLines.length === puzzle.bugs.length
    && unique.size === selectedLines.length
    && Array.from(unique).every(line => isSelectable(lines, line));
}

function acceptsGuesses(puzzle: BugdlePuzzle, progress: PuzzleProgress): boolean {
  return progress.puzzleId === puzzle.id
    && progress.state === "in-progress"
    && progress.guesses.length < puzzle.maxAttempts;
}

export function canSubmit(
  puzzle: BugdlePuzzle,
  selectedLines: readonly number[],
  progress: PuzzleProgress,
): boolean {
  return acceptsGuesses(puzzle, progress) && isCompleteSelection(puzzle, selectedLines);
}

export function evaluateGuess(
  puzzle: BugdlePuzzle,
  selectedLines: readonly number[],
): Pick<Guess, "correctCount" | "status"> {
  if (!isCompleteSelection(puzzle, selectedLines)) {
    throw new Error("Select exactly one unique, nonblank line for each bug.");
  }

  const targets = new Set(puzzle.bugs.map(bug => bug.line));
  const correctCount = selectedLines.filter(line => targets.has(line)).length;
  if (correctCount === targets.size) return { correctCount, status: "green" };
  return { correctCount, status: correctCount === 0 ? "red" : "yellow" };
}

export function submitGuess(
  puzzle: BugdlePuzzle,
  selectedLines: readonly number[],
  progress: PuzzleProgress,
): PuzzleProgress {
  if (!acceptsGuesses(puzzle, progress)) {
    throw new Error("This progress cannot accept another guess for this puzzle.");
  }

  const score = evaluateGuess(puzzle, selectedLines);
  const guess = { ...score, selectedLines: [...selectedLines].sort((a, b) => a - b) };
  const guesses = [...progress.guesses, guess];
  let state: PuzzleProgress["state"] = "in-progress";
  if (score.status === "green") state = "won";
  else if (guesses.length === puzzle.maxAttempts) state = "lost";
  return { puzzleId: puzzle.id, guesses, state };
}
