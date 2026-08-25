export function formatAttributeMod(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function formatSigned(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

export function statModClass(delta: number): string | undefined {
  if (delta < 0) return "stat-penalized";
  if (delta > 0) return "stat-boosted";
  return undefined;
}
