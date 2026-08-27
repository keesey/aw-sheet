/** Case-insensitive name sort for sheet lists. */
export function compareByName(
  a: { name: string },
  b: { name: string },
): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
}
