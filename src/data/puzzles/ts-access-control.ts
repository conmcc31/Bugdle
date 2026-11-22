import type { BugdlePuzzle } from "../../game/types";

export const tsAccessControl: BugdlePuzzle = {
  id: "ts-access-control",
  title: "Workshop admission",
  language: "typescript",
  difficulty: "medium",
  description: "Admit an active pass holder to their assigned workshop from its opening minute up to, but excluding, its closing minute. All times are minutes on the same day.",
  maxAttempts: 5,
  code: `type Pass = {
  active: boolean;
  workshop: string;
};

type Session = {
  workshop: string;
  opens: number;
  closes: number;
};

function duringSession(session: Session, minute: number) {
  if (minute < session.opens) {
    return false;
  }

  return minute <= session.closes;
}

function admit(pass: Pass, session: Session, minute: number) {
  if (pass.active) {
    return false;
  }

  if (pass.workshop !== session.workshop) {
    return false;
  }

  return duringSession(session, minute);
}`,
  bugs: [
    {
      line: 17,
      explanation: "The closing minute still qualifies with <=. Use minute < session.closes to end admission at closing time.",
    },
    {
      line: 21,
      explanation: "This guard rejects active passes and lets inactive passes proceed. Check !pass.active before returning false.",
    },
  ],
};
