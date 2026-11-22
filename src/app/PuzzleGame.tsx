import { useState } from "react";
import { CodeViewer } from "../components/CodeViewer";
import { languages } from "../data/languages";
import { canSubmit, resetPuzzleProgress, submitGuess, toggleLine } from "../game/rules";
import type { BugdlePuzzle, PuzzleProgress } from "../game/types";

interface Props {
  puzzle: BugdlePuzzle;
  progress: PuzzleProgress;
  setProgress: (progress: PuzzleProgress) => void;
}

export function PuzzleGame({ puzzle, progress, setProgress }: Props) {
  const [selection, setSelection] = useState<readonly number[]>([]);
  const [notice, setNotice] = useState("");
  const { guesses, state } = progress;
  const finished = state !== "in-progress";
  const count = puzzle.bugs.length;
  const [language, extension] = languages[puzzle.language];

  function toggle(line: number) {
    const result = toggleLine(puzzle, selection, line);
    setSelection(result.selectedLines);
    setNotice(result.reason === "selection-full" ? "Selection full. Deselect a line to choose another." : "");
  }

  function submit() {
    const next = submitGuess(puzzle, selection, progress);
    setProgress(next);
    setSelection([]);
    const last = next.guesses[next.guesses.length - 1];
    const outcome = next.state === "won" ? " Puzzle solved." : next.state === "lost" ? " Out of attempts." : "";
    setNotice(`Guess ${next.guesses.length}: ${last.correctCount} of ${count} correct.${outcome}`);
  }

  return <main className="frame">
      <section className="intro" aria-labelledby="puzzle-title">
        <a className="back-link" href="#puzzles">← Back to puzzles</a>
        <div className="metadata"><span>{language}</span><span>{puzzle.difficulty}</span></div>
        <h2 id="puzzle-title">{puzzle.title}</h2>
        <p>{puzzle.description}</p>
      </section>
      <div className="workspace">
        <section className="editor panel" aria-label="Code review">
          <div className="file"><span aria-hidden="true">&lt;/&gt;</span> {puzzle.id}.{extension}</div>
          <CodeViewer puzzle={puzzle} selection={selection} finished={finished} onToggle={toggle} />
          {!finished && <div className="controls">
            <div><h3>There are {count} bugs. Select {count} lines.</h3>
              <p>{selection.length} of {count} selected</p></div>
            <div className="actions">
              <button className="secondary" disabled={!selection.length} onClick={() => {
                setSelection([]); setNotice("");
              }}>Clear selection</button>
              <button className="primary" disabled={!canSubmit(puzzle, selection, progress)} onClick={submit}>Submit guess</button>
            </div>
          </div>}
          <p role="status" className="notice">{notice}</p>
        </section>
        <aside>
          <section className="panel side">
            <h3>Guess history</h3>
            <p className="remaining">{puzzle.maxAttempts - guesses.length} attempts remaining</p>
            <ol className="history">{Array.from({ length: puzzle.maxAttempts }, (_, i) => {
              const guess = guesses[i];
              return <li key={i}><span>Guess {i + 1}</span>
                {guess ? <strong className={guess.status}>{guess.correctCount} of {count} correct</strong>
                  : <span className="unused">Unused</span>}</li>;
            })}</ol>
          </section>
          {finished && <section className="panel side result">
            <h3>{state === "won" ? `Solved in ${guesses.length}/${puzzle.maxAttempts}` : "Out of attempts"}</h3>
            <ul>{puzzle.bugs.map(bug => <li key={bug.line}>
              <strong>Line {bug.line}</strong><p>{bug.explanation}</p>
            </li>)}</ul>
            <button className="primary" onClick={() => {
              setProgress(resetPuzzleProgress(puzzle.id)); setSelection([]); setNotice("");
            }}>Replay puzzle</button>
          </section>}
        </aside>
      </div>
  </main>;
}
