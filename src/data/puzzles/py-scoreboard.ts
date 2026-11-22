import type { BugdlePuzzle } from "../../game/types";

export const pyScoreboard: BugdlePuzzle = {
  id: "py-scoreboard",
  title: "League table",
  language: "python",
  difficulty: "medium",
  description: "Sum each player's round scores and list players from highest total to lowest. Break ties alphabetically by name and number the resulting rows starting at one.",
  maxAttempts: 5,
  code: `def collect_totals(rounds):
    totals = {}

    for name, score in rounds:
        if name not in totals:
            totals[name] = 0

        totals[name] = score

    return totals


def ranking_key(entry):
    name, total = entry
    return (total, name)


def scoreboard(rounds):
    totals = collect_totals(rounds)
    entries = sorted(totals.items(), key=ranking_key)
    rows = []

    for place, (name, total) in enumerate(entries, start=1):
        rows.append({
            "place": place,
            "name": name,
            "total": total,
        })

    return rows`,
  bugs: [
    {
      line: 8,
      explanation: "Assignment discards earlier rounds. Use totals[name] += score so every round contributes.",
    },
    {
      line: 15,
      explanation: "Sorting this tuple puts the lowest total first. Return (-total, name) to reverse the score order while keeping names alphabetical.",
    },
  ],
};
