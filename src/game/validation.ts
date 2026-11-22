import { difficulties, supportedLanguages, type BugdlePuzzle } from "./types";

/** Checks source-controlled puzzle data during development. */
export function validatePuzzle(puzzle: BugdlePuzzle): void {
  function requireValid(condition: boolean, message: string) {
    if (!condition) throw new Error(`${puzzle.id || "(missing ID)"}: ${message}`);
  }

  for (const field of ["id", "title", "description", "code"] as const) {
    requireValid(Boolean(puzzle[field].trim()), `${field} must be nonempty`);
  }
  requireValid(supportedLanguages.includes(puzzle.language), "unsupported language");
  requireValid(difficulties.includes(puzzle.difficulty), "unsupported difficulty");
  requireValid(Number.isInteger(puzzle.maxAttempts) && puzzle.maxAttempts > 0,
    "maxAttempts must be a positive integer");
  requireValid(puzzle.bugs.length >= 2, "expected at least two bug targets");

  const lines = puzzle.code.split("\n");
  const seen = new Set<number>();
  for (const { line, explanation } of puzzle.bugs) {
    requireValid(Number.isInteger(line) && line >= 1 && line <= lines.length,
      `target line ${line} is outside the source or not an integer`);
    requireValid(Boolean(lines[line - 1].trim()), `target line ${line} is blank`);
    requireValid(!seen.has(line), `duplicate target line ${line}`);
    requireValid(Boolean(explanation.trim()), `missing explanation for line ${line}`);
    seen.add(line);
  }
}

export function validatePuzzleCatalog(puzzles: readonly BugdlePuzzle[]): void {
  const ids = new Set<string>();
  for (const puzzle of puzzles) {
    validatePuzzle(puzzle);
    if (ids.has(puzzle.id)) throw new Error(`duplicate puzzle ID: ${puzzle.id}`);
    ids.add(puzzle.id);
  }
}
