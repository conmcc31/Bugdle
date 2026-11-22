import { useEffect, useState } from "react";
import { puzzles } from "../data";
import { languages } from "../data/languages";
import { resetPuzzleProgress } from "../game/rules";
import type { PuzzleProgress } from "../game/types";
import { PuzzleGame } from "./PuzzleGame";

function cardStatus(progress?: PuzzleProgress) {
  if (progress?.state === "won") return "Solved";
  if (progress?.state === "lost") return "Not solved";
  return progress?.guesses.length ? "In progress" : "Not started";
}

export function App() {
  const [route, setRoute] = useState(() => window.location.hash);
  const [progress, setProgress] = useState<Record<string, PuzzleProgress>>({});
  const puzzle = puzzles.find(entry => route === `#puzzles/${entry.id}`);

  useEffect(() => {
    function navigate() { setRoute(window.location.hash); }
    window.addEventListener("hashchange", navigate);
    return () => window.removeEventListener("hashchange", navigate);
  }, []);

  useEffect(() => {
    document.title = `${puzzle?.title ?? "Puzzle library"} · Bugdle`;
  }, [puzzle]);

  return <>
    <header className="masthead"><div className="frame mast-inner">
      <h1><span aria-hidden="true" className="brand-mark">[!]</span> Bugdle</h1>
      <details key={route}><summary>How to play</summary><p>
        Select one line per bug, then submit your guess. Each guess tells you how many
        lines match. Find every bug within {puzzle?.maxAttempts ?? 5} guesses.
      </p></details>
    </div></header>
    {puzzle ? <PuzzleGame key={puzzle.id} puzzle={puzzle}
      progress={progress[puzzle.id] ?? resetPuzzleProgress(puzzle.id)}
      setProgress={next => setProgress(previous => ({ ...previous, [next.puzzleId]: next }))} />
    : <main className="frame">
      <section className="intro">
        <h2>Puzzle library</h2>
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
