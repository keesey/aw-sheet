/** Format a numeric modifier with an explicit sign (e.g. +3, -1). */
export function formatSigned(value: number): string {
  return value >= 0 ? `+${value}` : `${value}`;
}
