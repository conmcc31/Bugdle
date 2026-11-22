# Bugdle — Product Specification

**Status:** Draft for implementation  
**Version:** V1 — Playable Proof of Concept  
**Product type:** Single-player, Wordle-inspired code-review puzzle game  
**Primary goal:** Ship a polished, playable browser game where players identify buggy lines in short code snippets over a limited number of attempts.  
**Out of scope for V1:** User accounts, backend services, multiplayer, leaderboards, runtime AI generation or grading, and running/editing arbitrary code.

---

## 1. Product thesis

**Bugdle** is a quick code-review game inspired by Wordle. Players inspect a short snippet of code, select the lines they believe contain intentional bugs, and submit a guess. They have up to **five attempts** to find every buggy line. Feedback reports *how many* selected lines were correct, without revealing *which* ones, so subsequent guesses require reasoning rather than simply collecting individually confirmed answers.

The product should feel like a short daily brain teaser—not a lengthy coding interview or a replacement for a full IDE. The first release is a small public portfolio proof of concept containing a handful of hand-reviewed puzzles in **JavaScript, TypeScript, and Python**. It should be designed so a future daily-puzzle schedule and alternative gameplay modes can be added without replacing the core puzzle model.

### V1 success criteria

- A visitor can open the site, choose a puzzle, understand the rules, play five attempts, and reach a win or loss state without an account.
- At least **six curated example puzzles** are included: **two JavaScript, two TypeScript, and two Python**, with a mix of accessible bug patterns and short descriptions.
- Puzzles are presented as readable, syntax-highlighted code with line numbers and selectable lines.
- Each puzzle declares its known number of bugs, and each submitted guess selects **exactly that many unique lines**.
- After each guess, the player receives aggregate correctness feedback and a **green / yellow / red** status indicator, **never per-line correctness** during an active game.
- A completed game reveals the correct lines and concise bug explanations.
- The experience works on desktop and mobile, is keyboard accessible, and persists progress locally after refresh.
- The app can be built, tested, and deployed as a static site with no paid services.

---

## 2. Scope and game rules

### 2.1 Game selection

V1 is a **demo puzzle library**, not a genuine once-per-day release system. The home screen lists available puzzles with their title, language, difficulty, and number of bugs. Players can choose any puzzle and replay it. A future release can add a deterministic daily selection and streaks.

Use stable puzzle IDs so local progress remains tied to the correct challenge across sessions. An optional “Featured Puzzle” can point to one example, but do not represent it as an actual daily puzzle unless it rotates.

### 2.2 Puzzle presentation

Each game displays:

- Puzzle title, language label, difficulty label, and brief context explaining the code's intended behavior.
- A prominent instruction: **“There are X bugs. Select X lines.”**
- A read-only, syntax-highlighted code block with visible line numbers and click/tap/keyboard-selectable lines.
- Current selection count, attempts remaining (maximum five), Submit Guess, and Clear Selection.
- Guess history showing aggregate result for each submitted guess, in order.
- Win/loss panel and bug explanations only after the game finishes.

For V1, puzzles should contain **approximately 30–60 lines** of code, with **2–3 distinct, unambiguous bugs** each. The schema should not enforce these as hard limits, allowing later puzzles to reach 100 lines if useful. Avoid intentional syntax errors, ambiguous code quality concerns, or multi-line bugs that cannot be attributed to a single line.

### 2.3 Selecting lines

1. A player toggles a code line by clicking/tapping it or activating its keyboard control.
2. Selected lines receive a consistent visual treatment that indicates **selection only**, not correctness. Use an accessible blue or neutral selection treatment; **do not use green, yellow, or red to mark selected lines before the final reveal**.
3. A player can select no more than **X** lines, where X is the known bug count. If the selection is full, attempting to select another line leaves the selection unchanged and displays a small helpful message.
4. Only nonblank code lines are selectable. Every authored bug target must map to a selectable line.
5. Submit is disabled until **exactly X** lines are selected. Clear Selection resets only the current unsent selection.
6. After submission, the current selection clears, but the submitted guess is preserved in the attempt history. Players may reuse lines in future guesses.

### 2.4 Evaluating a guess

Let `expectedLines` be the set of canonical bug line numbers and `selectedLines` the submitted set. Calculate:

`correctCount = size(intersection(expectedLines, selectedLines))`

Because each guess contains exactly X lines, the maximum correct count is X.

| Result | Condition | Feedback | Outcome |
|---|---|---|---|
| **Green** | `correctCount === X` | “X of X correct” | Win; end game |
| **Yellow** | `0 < correctCount < X` | “Y of X correct” | Continue if attempts remain |
| **Red** | `correctCount === 0` | “0 of X correct” | Continue if attempts remain |

**Privacy of answers during gameplay:** Feedback applies to the **entire submitted guess**. Do **not** highlight which specific selected lines were correct, cross out wrong lines, provide per-line colors, or reveal explanations before the game ends. An attempt-history row can display a single colored status indicator and its aggregate score, e.g., `Guess 2 — 🟡 1/3 correct`. Storing the guessed line numbers internally is fine, and the player may view which lines they previously selected, but those lines must remain visually neutral in the history.

The final allowed attempt is evaluated normally. A correct fifth guess wins; an incorrect fifth guess loses. No sixth submission is possible.

### 2.5 End state

**On win:** Show success, total attempts used (e.g., “Solved in 3/5”), and the intended bug line numbers with explanations.

**On loss:** Show “Out of attempts,” reveal the correct lines and explanations, and allow replay.

**On either outcome:** The code viewer may now highlight correct bug lines in green (after the result has been finalized), and the explanations should identify the bug’s actual effect and the intended correction. The user can return to puzzle selection or start over.

**Replay behavior:** Replay explicitly clears the local result for **that one puzzle**, including its guesses and finished state, and starts a new game; it does not reset other puzzles. Display a confirmation if the user is about to discard unfinished progress.

### 2.6 Example interaction

For a puzzle with **3 known bugs**:

- Attempt 1 selects lines 5, 12, 27 → **🟡 1/3 correct**. No line-level answer is revealed.
- Attempt 2 selects lines 8, 12, 27 → **🟡 2/3 correct**. No line-level answer is revealed.
- Attempt 3 selects lines 8, 16, 27 → **🟢 3/3 correct**. Game ends; solutions are revealed.

The example is illustrative; line numbers and scores should be driven by puzzle data.

---

## 3. Information architecture and UX

### 3.1 Screens / states

**Puzzle selection screen**
- Product branding (`Bugdle`), a one-sentence premise, and concise How to Play instructions.
- A grid or list of six puzzle cards with language, difficulty, title, and bug count.
- Cards indicate **Not started / In progress / Solved / Not solved** using local data.
- Clicking a card opens that puzzle.

**Puzzle play screen**
- Compact header with Back to Puzzles, puzzle metadata, attempts count, and bug count.
- Code viewer as the visual centerpiece; horizontal scrolling for long code lines, without broken line-number alignment.
- Selection counter and Submit/Clear controls near the code viewer.
- Aggregate feedback area below the viewer, plus a chronological five-attempt history.
- A small persistent rules reminder or an accessible How to Play disclosure.

**Game completed state**
- Outcome, attempts count, correct bug lines, explanations, Replay, and Back to Puzzles.

### 3.2 UX principles

- Aim for a **3–5 minute session** for a typical puzzle.
- Default to a clean developer-tool aesthetic with readable typography and a restrained dark-mode palette; visually distinguish selection blue from evaluation colors.
- Do not depend on color alone: all green/yellow/red indicators include text, a score, and/or a recognizable icon.
- Maintain legible font sizes, line numbers, and tappable row targets on mobile; preserve indentation and horizontal scrolling rather than wrapping code unpredictably.
- Do not block the entire game on animation, sound, or confetti. Motion should be optional/minimal.
- Clearly label the experience as an example-puzzle POC; avoid fake daily streaks or placeholder statistics.

### 3.3 Accessibility requirements

- The code line picker must support keyboard focus and activation (Enter/Space) with visible focus indicators.
- Selected/unselected state must be conveyed programmatically (e.g., `aria-pressed` on line buttons).
- Feedback is announced via a polite live region after submission.
- Interaction must not rely only on hover or color.
- Respect reduced-motion preferences.

---

## 4. Technical decisions

### 4.1 Stack

| Area | Choice | V1 rationale |
|---|---|---|
| Frontend | **React + TypeScript** | Familiar typed component development |
| Build | **Vite** | Lightweight static SPA setup |
| Styling | **Tailwind CSS** | Rapid, responsive UI composition |
| Syntax highlighting | **Shiki** | Supports JavaScript, TypeScript, Python; lightweight read-only presentation relative to a full editor |
| State | **React hooks** | Small app; no external state-management library necessary |
| Persistence | **localStorage** | Store progress per puzzle with no account/backend |
| Unit tests | **Vitest** + React Testing Library | Cover pure evaluation logic and interactions |
| Hosting | **Cloudflare Pages** | Static deployment; no server component needed |

No Monaco, Python interpreter, arbitrary code execution, database, authentication, model SDK, or runtime API requests in V1.

### 4.2 Puzzle contract

Store approved puzzle definitions in source-controlled TypeScript modules or JSON. Use the following conceptual contract:

```ts
export type SupportedLanguage = "javascript" | "typescript" | "python";
export type Difficulty = "easy" | "medium" | "hard";

export interface BugdleBug {
  /** 1-based line number in `code`; exactly one canonical target line per bug. */
  line: number;
  /** Human-readable description shown only after finishing. */
  explanation: string;
  /** Optional descriptive taxonomy for later filtering / insights. */
  category?: string;
}

export interface BugdlePuzzle {
  /** Stable unique ID; must not depend on array index. */
  id: string;
  title: string;
  language: SupportedLanguage;
  difficulty: Difficulty;
  /** What the code is supposed to do; avoid giving away the bug. */
  description: string;
  /** A full source snippet, with stable newlines for line-number mapping. */
  code: string;
  /** Every bug targets exactly one distinct, nonblank code line. */
  bugs: BugdleBug[];
  /** Default 5; provided per puzzle for future flexibility. */
  maxAttempts: number;
}
```

**Line-number convention:** `code.split("\n")` defines line numbering, starting at **1**. Keep newlines stable; normalize carriage returns when loading content if needed. Line highlighting must not shift numbering. The UI derives the displayed bug count from `puzzle.bugs.length`, never from a separately hardcoded value.

**Puzzle validation (development time):** Add a validation helper or test to ensure unique IDs; nonempty source code; supported language; two or more unique target lines in V1 fixtures; each target is an integer in range and nonblank; every bug has a nonempty explanation; `maxAttempts` is positive; and no duplicated bug target lines. Authored code should be manually checked for unintended bugs and ambiguous answers. Do not assume AI-generated code is correct simply because its metadata claims it is.

### 4.3 Game-state contract

```ts
export type GuessStatus = "red" | "yellow" | "green";

export interface Guess {
  /** Sorted, unique, 1-based code line numbers. */
  selectedLines: number[];
  correctCount: number;
  status: GuessStatus;
}

export interface PuzzleProgress {
  puzzleId: string;
  guesses: Guess[];
  state: "in-progress" | "won" | "lost";
}
```

Keep unsent line selections in component state; persist **submitted guesses and game status** under a versioned localStorage key such as `bugdle:v1:progress`. Consider storing a puzzle content revision or version with saved progress if challenge content may later change without changing its ID.

### 4.4 Pure game logic

Isolate game rules in small, testable functions, independent from React:

- `validatePuzzle(puzzle)`
- `evaluateGuess(puzzle, selectedLines)` → `correctCount`, status
- `canSubmit(puzzle, selectedLines, progress)` → whether selection count and game state permit a guess
- `submitGuess(puzzle, selectedLines, progress)` → updated progress, including win/loss after up to five guesses
- `resetPuzzleProgress(puzzleId)` (or an equivalent controlled state transition)

Use sets to compare unique selected lines and expected bug lines. Reject invalid line numbers, duplicate selections, and submissions after completion. React components should display derived state rather than recomputing or mutating the score logic.

### 4.5 Suggested project structure

```text
src/
  app/
    App.tsx
  components/
    PuzzleCard.tsx
    CodeViewer.tsx
    GuessHistory.tsx
    GameControls.tsx
    ResultPanel.tsx
    HowToPlay.tsx
  data/
    puzzles/
      javascript-*.ts
      typescript-*.ts
      python-*.ts
    index.ts
  game/
    types.ts
    rules.ts
    storage.ts
    validation.ts
  hooks/
    usePuzzleGame.ts
  styles/
    index.css
  test/
    rules.test.ts
    puzzle-fixtures.test.ts
    gameplay.test.tsx
```

This structure is guidance, not a requirement to create every file before it is needed. Keep the architecture practical for a short code jam.

---

## 5. Initial puzzle content

Ship **six hand-reviewed fixtures**; make them beginner- to intermediate-friendly. Each should have 30–60 lines of readable, self-contained code, and 2–3 identifiable single-line logic errors. Include intended behavior and explanatory solutions in puzzle metadata. Prefer examples from ordinary application logic (not trivia about obscure language features).

| ID suggestion | Language | Concept | Target bug themes |
|---|---|---|---|
| `js-cart-total` | JavaScript | Calculate a shopping-cart total | Off-by-one loop, wrong discount operator |
| `js-user-filter` | JavaScript | Filter active users by criteria | Boolean logic, incorrect default |
| `ts-order-summary` | TypeScript | Build typed order summaries | Incorrect comparison, wrong aggregation |
| `ts-access-control` | TypeScript | Determine whether an action is permitted | Reversed condition, boundary check |
| `py-scoreboard` | Python | Compute leaderboard rankings | Incorrect sort direction, bad accumulator |
| `py-inventory` | Python | Update inventory after purchases | Wrong stock comparison, mistaken quantity update |

These are **content briefs**, not a requirement to include exactly those bug patterns. During implementation, create the actual complete code snippets and validate their target line numbers. Avoid overlapping bug lines, bugs that depend on hidden environmental assumptions, and obvious syntax errors. A player should be able to infer the problem from the snippet and its stated intended behavior.

**No automatic AI generation in the deployed application.** AI-assisted puzzle authoring is permitted in the development workflow, but content must be reviewed before committing it. In particular, verify that each canonical line is actually faulty and that all other lines are acceptable given the puzzle's stated assumptions.

---

## 6. Persistence and failure handling

- Persist progress for each puzzle under its stable ID, including status and completed guesses.
- Restore progress after refresh and when navigating between puzzles.
- If localStorage is unavailable (privacy mode or quota), the game should still be playable in memory; storage failures must not crash it.
- Validate saved data before applying it. On malformed or incompatible data, recover to an empty game for the affected puzzle rather than breaking the page.
- Clearly distinguish replay/reset from resume; never silently reset a user's work upon navigation.
- No gameplay network calls should be necessary after the static app assets have loaded.

---

## 7. Testing and acceptance criteria

### Required automated tests

1. **Scoring:** zero, partial, and complete matches return red, yellow, and green respectively.
2. **Selection:** only unique valid nonblank lines can be selected; cannot exceed bug count; Submit requires exactly X selections.
3. **Attempts:** a correct fifth attempt wins; an incorrect fifth attempt loses; finished games reject additional guesses.
4. **Feedback secrecy:** in-progress results do not expose which individual selected lines were correct or bug explanations.
5. **Persistence:** submitted guesses survive refresh/reload; replay only resets the chosen puzzle; malformed storage fails gracefully.
6. **Puzzle integrity:** all six fixtures have valid IDs, supported languages, correct target lines, and nonempty explanations.
7. **Interaction:** clicking a line toggles selection; Clear Selection works; Submit creates a new history entry; keyboard interactions work.

### Manual acceptance checklist

- [ ] Landing screen lists six JavaScript/TypeScript/Python puzzles with accurate metadata.
- [ ] Player can open any puzzle, see the code clearly, and identify X from the instructions.
- [ ] Code formatting, indentation, syntax highlighting, and line numbering stay aligned on desktop and mobile.
- [ ] Exactly X unique code lines can be selected; blank lines are not selectable.
- [ ] Five-guess flow behaves correctly for zero, partial, and complete matches.
- [ ] Colored status feedback appears at the bottom of the code viewer / in guess history with aggregate counts, not per-line answers.
- [ ] Correct lines and explanations remain hidden until win/loss.
- [ ] Results reveal intended bugs with an explanation of why each is problematic.
- [ ] Returning to the list and refreshing retains progress.
- [ ] Replay works independently for each puzzle.
- [ ] Screen reader, keyboard, and mobile/touch interactions are usable.
- [ ] App builds cleanly and deploys as a static site with no secrets or paid APIs.

### Definition of done

V1 is done when all six fixtures are playable end-to-end, scoring is correct, answer secrecy is maintained during play, progress survives a reload, keyboard/mobile usability is acceptable, unit tests pass, and the built app is deployed to a public static URL.

---

## 8. Explicit V1 non-goals

- True daily publishing cadence, calendar unlocks, streaks, and share cards.
- User accounts, cross-device sync, server-side score validation, competitive rankings.
- Editable source code, running tests, executing JavaScript or Python.
- AI-powered grading, feedback, or puzzle generation at runtime.
- BYO model keys, payments, or billing.
- Monaco/VS Code functionality, linting, autocomplete, code completions.
- Complex analytics, multiplayer, social features, and a backend database.

Note: Since all puzzle definitions ship to the browser, technically inclined users can inspect the assets and discover answers. This is acceptable for a noncompetitive demo. Server-side answer validation is needed before claiming cheat resistance in a public leaderboard or ranked daily competition.

---

## 9. Roadmap

### V1 — Playable POC (current)

**Objective:** Validate the core game loop with six curated puzzles and a clean UI.

- Puzzle library and language/difficulty labels.
- Static puzzle metadata and a read-only code viewer.
- Selecting X lines, five attempts, aggregate colored feedback.
- Win/loss explanations, local progress, replay.
- Unit tests, basic accessibility, static deployment.

**Release gate:** People can play repeatedly without guidance, and the scoring / feedback cannot be misinterpreted as revealing individual lines.

### V1.5 — Daily Bugdle

**Objective:** Turn the demo into a shareable short daily ritual.

- One featured puzzle per date, assigned deterministically by a specified timezone / UTC date policy.
- Larger vetted puzzle catalog and a publication schedule.
- Streaks, win distribution, played-history statistics, and spoiler-free results sharing.
- Clear rules for missed days, replaying prior puzzles, and local vs. cross-device progress.
- Optional language preference / difficulty rotation.
- Consider a lightweight backend only if reliable anti-cheat or synchronized progress becomes necessary.

**Release gate:** The same daily puzzle is consistently served to all users under the chosen policy; share results avoid leaking answers.

### V2 — Bugdle Fix

**Objective:** Add an optional interactive debugging mode alongside Classic.

- Editable code surface (evaluate CodeMirror or Monaco).
- Tests with clear expectations and a Run Tests workflow.
- Compare behavior against tests, **not exact source-string matches**, to accept multiple valid fixes.
- Carefully isolate untrusted execution, with strict runtime, resource, and network limits. Do not run arbitrary user code directly in the server process or main app window.
- Support language-specific execution constraints; JavaScript/TypeScript first may be simpler than securely supporting Python.
- Extend puzzle content metadata with test suites, expected behavior, and mode eligibility.

**Release gate:** Multiple valid fixes pass the same test suite; hostile or infinite-loop submissions cannot impair the service.

### V3 — Bugdle Review

**Objective:** Let players describe bugs in plain language and receive AI-assisted review feedback.

- Free-form response box, with an explicit rubric derived from the vetted answer key.
- AI evaluation of correctness, coverage, and reasoning rather than keyword matching.
- Structured model output and consistent scoring rules; handle uncertainty / ambiguous user answers.
- Server-side API boundary, rate limits, input limits, moderation / misuse protections, usage monitoring, and a budget cap.
- Evaluate hosted AI first; consider BYO API keys only if cost or product goals justify the extra security and UX burden.
- Never expose the operator's model key in client-side code or persist user keys insecurely.

**Release gate:** Grading is sufficiently consistent across paraphrases and alternate valid explanations, with bounded costs and clear user feedback.

### Architectural evolution principle

Keep three concepts distinct as modes expand:

1. **Puzzle data:** Source code, context, intended bugs, and optional mode-specific assets.
2. **Interaction mode:** Select lines (Classic), edit code (Fix), or explain issues (Review).
3. **Evaluation strategy:** Set matching, isolated tests, or rubric-driven AI evaluation.

Do **not** build a formal plugin framework in V1. Preserve these boundaries through ordinary modules and components, and introduce stronger abstractions when a second mode actually exists.

---

## 10. Suggested implementation sequence

1. **Scaffold:** Vite, React, TypeScript, Tailwind, test harness, deployment configuration.
2. **Data contract and fixtures:** Implement puzzle types, six puzzles, fixture validation tests.
3. **Core engine:** Pure line-selection, guess evaluation, attempt termination, and unit tests.
4. **Game UI:** Syntax-highlighted read-only code viewer, selection state, controls, attempt history, win/loss panels.
5. **Puzzle library:** Selection screen, navigation, puzzle metadata and completion status.
6. **Persistence:** Save/restore independent progress; replay/reset and storage error handling.
7. **Polish and release:** Mobile layout, accessibility, tests, README, and Cloudflare Pages deployment.

### Handoff guidance for coding agents

Implement **only V1** unless asked otherwise. Treat the roadmap as context, not permission to create future-mode features. Before modifying game rules, preserve these invariants: the player knows X, submits exactly X unique lines, has five attempts, receives only **aggregate** correctness during active play, and sees line-level solutions only upon completion. Favor small, testable functions and curated source-controlled fixtures over unnecessary infrastructure.

