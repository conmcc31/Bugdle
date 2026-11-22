import { resetPuzzleProgress, submitGuess } from "./rules";
import type { BugdlePuzzle, PuzzleProgress } from "./types";

function progressKey(id: string) {
  return `bugdle:v1:progress:${id}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function restorePuzzle(puzzle: BugdlePuzzle, saved: unknown): PuzzleProgress | undefined {
  if (!isRecord(saved) || saved.puzzleId !== puzzle.id || !Array.isArray(saved.guesses)
      || saved.guesses.length > puzzle.maxAttempts) return;

  let progress = resetPuzzleProgress(puzzle.id);
  for (const guess of saved.guesses) {
    if (!isRecord(guess) || !Array.isArray(guess.selectedLines)) return;
    // Recompute each result with the current puzzle's rules before accepting the history.
    progress = submitGuess(puzzle, guess.selectedLines, progress);
    const result = progress.guesses[progress.guesses.length - 1];
    if (result.correctCount !== guess.correctCount || result.status !== guess.status) return;
  }
  if (progress.state === saved.state) return progress;
}

export function loadProgress(puzzles: readonly BugdlePuzzle[]): Record<string, PuzzleProgress> {
  const restored: Record<string, PuzzleProgress> = {};
  for (const puzzle of puzzles) {
    try {
      const raw = window.localStorage.getItem(progressKey(puzzle.id));
      if (raw === null) continue;
      const progress = restorePuzzle(puzzle, JSON.parse(raw));
      if (progress) restored[puzzle.id] = progress;
    } catch {
      // A blocked read, malformed JSON, or illegal guess affects only this puzzle.
    }
  }
  return restored;
}

export function saveProgress(progress: PuzzleProgress): boolean {
  try {
    const key = progressKey(progress.puzzleId);
    if (progress.guesses.length === 0) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
