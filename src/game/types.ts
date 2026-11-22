export const supportedLanguages = ["javascript", "typescript", "python"] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];
export const difficulties = ["easy", "medium", "hard"] as const;
export type Difficulty = (typeof difficulties)[number];

export interface BugdleBug {
  /** One-based index into code.split("\n"). */
  line: number;
  explanation: string;
  category?: string;
}

export interface BugdlePuzzle {
  id: string;
  title: string;
  language: SupportedLanguage;
  difficulty: Difficulty;
  description: string;
  code: string;
  bugs: BugdleBug[];
  maxAttempts: number;
}
