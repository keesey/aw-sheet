const STRIKE_FINISHER_RE = /\s*\(\+\d+d\d+ finisher(?:,\s*([^)]+)|;\s*([^)]+))?\)/;

export function formatStrikeDamage(damage: string, finisherDice: string, panache: boolean) {
  const match = damage.match(STRIKE_FINISHER_RE);
  if (!match) {
    return damage;
  }

  const base = damage.replace(STRIKE_FINISHER_RE, "").trimEnd();
  const extra = match[1] ? `, ${match[1]}` : match[2] ? `; ${match[2]}` : "";

  if (!panache) {
    return `${base}${extra}`;
  }

  return (
    <>
      {base}
      <span className="speed-panache"> (+{finisherDice} finisher)</span>
      {extra}
    </>
  );
}
