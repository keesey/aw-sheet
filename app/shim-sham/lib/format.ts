export function formatAbilityMod(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}
