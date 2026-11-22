import type { BugdlePuzzle } from "../../game/types";

export const jsCartTotal: BugdlePuzzle = {
  id: "js-cart-total",
  title: "Cart receipt",
  language: "javascript",
  difficulty: "easy",
  description: "Price every item in cents using its quantity. A member gets 10% off the subtotal, with the discount rounded down to whole cents.",
  maxAttempts: 5,
  code: `function priceItem(item) {
  return item.unitCents * item.quantity;
}

function cartSubtotal(items) {
  let subtotal = 0;

  for (let i = 0; i < items.length - 1; i++) {
    subtotal += priceItem(items[i]);
  }

  return subtotal;
}

function memberDiscount(subtotal, isMember) {
  if (!isMember) {
    return 0;
  }

  return Math.floor(subtotal / 10);
}

function receipt(items, isMember) {
  const subtotal = cartSubtotal(items);
  const discount = memberDiscount(subtotal, isMember);

  return {
    subtotal,
    discount,
    total: subtotal + discount,
  };
}`,
  bugs: [
    {
      line: 8,
      explanation: "The loop skips the final item, so even a one-item cart has a zero subtotal. Use i < items.length to visit every item.",
    },
    {
      line: 30,
      explanation: "Adding the discount increases the amount due. Subtract it from the subtotal.",
    },
  ],
};
