/** CSS class for natural 1 / natural 20 on a d20 roll display. */
export function natClass(d20: number): string | undefined {
  if (d20 === 20) return "roll-result__nat20";
  if (d20 === 1) return "roll-result__nat1";
  return undefined;
}
