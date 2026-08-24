export function formatStrikeDamage(damage: string, finisherDice: string, panache: boolean) {
  const hasFinisher = damage.includes(" precision");
  return (
    <>
      {damage}
      {panache && hasFinisher ? (
        <span className="speed-panache"> (+{finisherDice} finisher)</span>
      ) : null}
    </>
  );
}
