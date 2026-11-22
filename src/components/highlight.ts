import { createHighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";
import theme from "shiki/themes/github-dark.mjs";
import type { BugdlePuzzle } from "../game/types";

const grammars = {
  javascript: () => import("shiki/langs/javascript.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  python: () => import("shiki/langs/python.mjs"),
};

const highlighter = createHighlighterCore({
  themes: [theme],
  langs: [],
  engine: createJavaScriptRegexEngine(),
});

export async function highlight(puzzle: BugdlePuzzle) {
  const engine = await highlighter;
  await engine.loadLanguage(grammars[puzzle.language]);
  return engine.codeToTokensBase(puzzle.code, {
    lang: puzzle.language, theme: theme.name,
  });
}
