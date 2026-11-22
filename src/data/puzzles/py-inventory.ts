import type { BugdlePuzzle } from "../../game/types";

export const pyInventory: BugdlePuzzle = {
  id: "py-inventory",
  title: "Stockroom orders",
  language: "python",
  difficulty: "easy",
  description: "Process requests in arrival order against a copy of the stock counts. Fill a whole request whenever enough units remain. Reject unknown items and invalid quantities. Quantities are integers.",
  maxAttempts: 5,
  code: `def can_fill(stock, item, quantity):
    if quantity <= 0:
        return False

    if item not in stock:
        return False

    return stock[item] > quantity


def fulfill(initial_stock, requests):
    stock = initial_stock.copy()
    filled = []
    rejected = []

    for item, quantity in requests:
        request = (item, quantity)

        if not can_fill(stock, item, quantity):
            rejected.append(request)
            continue

        stock[item] += quantity
        filled.append(request)

    return {
        "stock": stock,
        "filled": filled,
        "rejected": rejected,
    }`,
  bugs: [
    {
      line: 8,
      explanation: "A request for the exact remaining stock gets rejected. Use >= so it can empty the shelf.",
    },
    {
      line: 23,
      explanation: "Filling a request adds units back to stock. Subtract the requested quantity so the next request sees the remaining count.",
    },
  ],
};
