import { useEffect, useState } from "react";
import type { ThemedToken } from "shiki/core";
import type { BugdlePuzzle } from "../game/types";

interface Props {
  puzzle: BugdlePuzzle;
  selection: readonly number[];
  finished: boolean;
  onToggle: (line: number) => void;
}

export function CodeViewer({ puzzle, selection, finished, onToggle }: Props) {
  const [tokens, setTokens] = useState<ThemedToken[][]>();
  useEffect(() => {
    let active = true;
    setTokens(undefined);
    import("./highlight").then(module => module.highlight(puzzle)).then(lines => {
      if (active) setTokens(lines);
    }).catch(() => { /* Plain source remains playable if highlighting is unavailable. */ });
    return () => { active = false; };
  }, [puzzle]);

  return <div className="code-scroll" role="region" aria-label="Puzzle source code" tabIndex={0}>
    <div className="code-lines">
      {puzzle.code.split("\n").map((source, index) => {
        const line = index + 1;
        const revealed = finished && puzzle.bugs.some(bug => bug.line === line);
        const content = <>
          <span className="line-number" aria-hidden="true">{line}</span>
          {finished && source.trim() && <span className="sr-only">Line {line}{revealed ? ", bug" : ""}. </span>}
          <code>{tokens?.[index]?.map((token, i) =>
            <span key={i} style={{ color: token.color }}>{token.content}</span>
          ) ?? source}</code>
        </>;
        return source.trim() && !finished
          ? <button key={line} className="code-row" aria-label={`Line ${line}: ${source.trim()}`}
              aria-pressed={selection.includes(line)} onClick={() => onToggle(line)}>{content}</button>
          : <div key={line} className={`code-row${revealed ? " revealed" : ""}`}>{content}</div>;
      })}
    </div>
  </div>;
}
