import type { CharacterSheet } from "@/lib/types";
import { formatStrikeDamage } from "../../lib/strike-format";
import { AonLink } from "../AonLink";

export function StrikesSection({
  weapons: unsortedWeapons,
  finisherDice,
  panache,
}: {
  weapons: CharacterSheet["static"]["weapons"];
  finisherDice: string;
  panache: boolean;
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
            <span className="strike-attack">{w.attack}</span>
          </div>
          <div className="strike-damage">
            {formatStrikeDamage(w.damage, finisherDice, panache)}
          </div>
          <div className="strike-traits">{w.traits.join(" · ")}</div>
        </div>
      ))}
    </div>
  );
}
