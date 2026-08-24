import type { AreaWeaponEntry } from "@/lib/shim-sham/area-weapons";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

export function AreaWeaponsPanel({
  weapons,
  onClose,
}: {
  weapons: AreaWeaponEntry[];
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Area Weapons" onClose={onClose}>
      <div className="strikes-panel-content">
        {weapons.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: 0 }}>No area weapons available.</p>
        ) : (
          weapons.map((weapon) => (
            <div key={weapon.id} className="strike-entry">
              <div className="strike-header">
                <AonLink href={weapon.url}>{weapon.name}</AonLink>
                {weapon.quantity ? (
                  <span className="strike-attack">{weapon.quantity}</span>
                ) : null}
              </div>
              <div className="strike-damage-row">
                <div className="strike-damage">Burst Radius: {weapon.burstRadius}</div>
              </div>
              <div className="strike-damage">{weapon.damage}</div>
              <div className="strike-traits">{weapon.traits.join(" · ")}</div>
            </div>
          ))
        )}
      </div>
    </BottomPanel>
  );
}
