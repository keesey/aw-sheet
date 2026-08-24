import type { CharacterSheet } from "@/lib/types";
import { formatStrikeDamage, type StrikeDamageMode } from "../../lib/strike-format";
import { statModClass } from "../../lib/format";
import { AonLink } from "../AonLink";

export function StrikesSection({
  weapons: unsortedWeapons,
  finisherDice,
  damageMode,
  attackDelta,
  damagePenalized,
  embedded = false,
}: {
  weapons: CharacterSheet["static"]["weapons"];
  finisherDice: string;
  damageMode: StrikeDamageMode;
  attackDelta: number;
  damagePenalized: boolean;
  embedded?: boolean;
}) {
  const weapons = [...unsortedWeapons].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  const content = weapons.map((w) => (
    <div key={w.id} className="strike-entry">
      <div className="strike-header">
        <AonLink href={w.weaponUrl ?? w.url}>{w.name}</AonLink>
        <span className={`strike-attack ${statModClass(attackDelta) ?? ""}`.trim()}>{w.attack}</span>
      </div>
      <div className="strike-damage-row">
        <div className={`strike-damage ${damagePenalized && !w.ranged ? "stat-penalized" : ""}`.trim()}>
          {formatStrikeDamage(w.damage, finisherDice, damageMode)}
        </div>
        {w.critNote ? <span className="strike-crit">({w.critNote})</span> : null}
      </div>
      <div className="strike-traits">{w.traits.join(" · ")}</div>
    </div>
  ));

  if (embedded) {
    return <div className="strikes-panel-content">{content}</div>;
  }

  return (
    <div className="stat-card sheet-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Strikes
      </div>
      {content}
    </div>
  );
}
