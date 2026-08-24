import type { CharacterSheet } from "@/lib/types";
import { formatStrikeDamage } from "../../lib/strike-format";
import { statModClass } from "../../lib/format";
import { AonLink } from "../AonLink";

export function StrikesSection({
  weapons: unsortedWeapons,
  finisherDice,
  panache,
  attackDelta,
  damagePenalized,
}: {
  weapons: CharacterSheet["static"]["weapons"];
  finisherDice: string;
  panache: boolean;
  attackDelta: number;
  damagePenalized: boolean;
}) {
  const weapons = [...unsortedWeapons].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  return (
    <div className="stat-card sheet-section">
      <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
        Strikes
      </div>
      {weapons.map((w) => (
        <div key={w.id} className="strike-entry">
          <div className="strike-header">
            <AonLink href={w.weaponUrl ?? w.url}>{w.name}</AonLink>
            <span className={`strike-attack ${statModClass(attackDelta) ?? ""}`.trim()}>{w.attack}</span>
          </div>
          <div className={`strike-damage ${damagePenalized && !w.ranged ? "stat-penalized" : ""}`.trim()}>
            {formatStrikeDamage(w.damage, finisherDice, panache, w.critNote)}
          </div>
          <div className="strike-traits">{w.traits.join(" · ")}</div>
        </div>
      ))}
    </div>
  );
}
