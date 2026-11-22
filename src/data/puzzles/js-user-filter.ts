import type { BugdlePuzzle } from "../../game/types";

export const jsUserFilter: BugdlePuzzle = {
  id: "js-user-filter",
  title: "Team directory",
  language: "javascript",
  difficulty: "easy",
  description: "List active users whose names contain the search text, ignoring case and surrounding spaces. An empty search matches every name. Return at most the requested limit, defaulting to ten when omitted. Zero is a valid limit.",
  maxAttempts: 5,
  code: `function normalize(text) {
  return text.trim().toLowerCase();
}

function matches(user, query) {
  const name = normalize(user.name);
  const containsQuery = name.includes(query);

  return user.active || containsQuery;
}

function directory(users, search, options = {}) {
  const query = normalize(search);
  const limit = options.limit || 10;
  const results = [];

  for (const user of users) {
    if (results.length >= limit) {
      break;
    }

    if (matches(user, query)) {
      results.push({
        id: user.id,
        name: user.name,
      });
    }
  }

  return results;
}`,
  bugs: [
    {
      line: 9,
      explanation: "Either condition admits the user, so an inactive match or an unrelated active user can appear. Require both conditions with &&.",
    },
    {
      line: 14,
      explanation: "A limit of zero is falsy and gets replaced by ten. Use options.limit ?? 10 to preserve zero.",
    },
  ],
};
