import type { BugdlePuzzle } from "../../game/types";

export const tsOrderSummary: BugdlePuzzle = {
  id: "ts-order-summary",
  title: "Packing slip",
  language: "typescript",
  difficulty: "medium",
  description: "Summarize paid orders only. Count orders, count individual units across their lines, and report revenue in cents including quantities.",
  maxAttempts: 5,
  code: `type OrderLine = {
  units: number;
  unitCents: number;
};

type Order = {
  status: "paid" | "pending";
  lines: OrderLine[];
};

function summarize(orders: Order[]) {
  let orderCount = 0;
  let unitCount = 0;
  let revenueCents = 0;

  for (const order of orders) {
    if (order.status === "paid") {
      continue;
    }

    orderCount += 1;
    for (const line of order.lines) {
      unitCount += 1;
      revenueCents += line.units * line.unitCents;
    }
  }

  return {
    orderCount,
    unitCount,
    revenueCents,
  };
}`,
  bugs: [
    {
      line: 17,
      explanation: "The continue skips paid orders and lets pending ones through. Skip the order when its status differs from paid.",
    },
    {
      line: 23,
      explanation: "This counts product lines regardless of quantity. Add line.units to count individual units.",
    },
  ],
};
