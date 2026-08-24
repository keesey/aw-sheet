export function formatStrikeDamage(
  damage: string,
  finisherDice: string,
  panache: boolean,
  critNote?: string,
) {
  const hasFinisher = damage.includes(" precision");
  const damageLine = (
    <>
      {damage}
      {panache && hasFinisher ? (
        <span className="speed-panache"> (+{finisherDice} finisher)</span>
      ) : null}
    </>
  );

  if (!critNote) {
    return damageLine;
  }

  return (
    <>
      {damageLine}
      <span className="strike-crit">({critNote})</span>
    </>
  );
}
