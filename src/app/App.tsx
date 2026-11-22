import { useEffect, useRef, useState } from "react";
import { puzzles } from "../data";
import { languages } from "../data/languages";
import { resetPuzzleProgress } from "../game/rules";
import { loadProgress, saveProgress } from "../game/storage";
import type { PuzzleProgress } from "../game/types";
import { PuzzleGame } from "./PuzzleGame";

function cardStatus(progress?: PuzzleProgress) {
  if (progress?.state === "won") return "Solved";
  if (progress?.state === "lost") return "Not solved";
  return progress?.guesses.length ? "In progress" : "Not started";
}

export function App() {
  const [route, setRoute] = useState(() => window.location.hash);
  const [progress, setProgress] = useState(() => loadProgress(puzzles));
  const [unsaved, setUnsaved] = useState<Record<string, boolean>>({});
  const puzzle = puzzles.find(entry => route === `#puzzles/${entry.id}`);

  const lastPuzzle = useRef(puzzle);

  useEffect(() => {
    function navigate() { setRoute(window.location.hash); }
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  useEffect(() => {
    if (lastPuzzle.current !== puzzle) {
      document.getElementById("page-title")?.focus();
      lastPuzzle.current = puzzle;
    }
    document.title = `${puzzle?.title ?? "Puzzle library"} · Bugdle`;
  }, [puzzle]);

  function updateProgress(next: PuzzleProgress) {
    const saved = saveProgress(next);
    setProgress(previous => ({ ...previous, [next.puzzleId]: next }));
    setUnsaved(previous => ({ ...previous, [next.puzzleId]: !saved }));
  }

  return <>
    <header className="masthead"><div className="frame mast-inner">
      <h1><span aria-hidden="true" className="brand-mark">[!]</span> Bugdle</h1>
      <details key={route}><summary>How to play</summary><p>
        Select one line per bug, then submit your guess. Each guess tells you how many
        lines match. Find every bug within {puzzle?.maxAttempts ?? 5} guesses.
      </p></details>
    </div></header>
    {Object.values(unsaved).some(Boolean) && <p className="frame" role="alert">Some progress could not be saved. You can keep playing in this tab.</p>}
    {puzzle ? <PuzzleGame key={puzzle.id} puzzle={puzzle}
      progress={progress[puzzle.id] ?? resetPuzzleProgress(puzzle.id)}
      setProgress={updateProgress} />
    : <main className="frame">
      <section className="intro">
        <h2 id="page-title" tabIndex={-1}>Puzzle library</h2>
        <p>Choose an example puzzle and find the buggy lines in five guesses.</p>
      </section>
      <ul className="puzzle-grid">{puzzles.map(entry => <li key={entry.id}>
        <a className="puzzle-card panel" href={`#puzzles/${entry.id}`}>
          <div className="metadata"><span>{languages[entry.language][0]}</span><span>{entry.difficulty}</span></div>
          <h3>{entry.title}</h3>
          <div className="card-footer"><span>{entry.bugs.length} bugs</span>
            <span>{cardStatus(progress[entry.id])}</span></div>
        </a>
      </li>)}</ul>
    </main>}
  </>;
}
