"use client";

import { useState } from "react";
import type { CharacterSheet } from "@/lib/types";
import { compareByName } from "@/lib/shim-sham/sort";
import {
  MAX_RANGE_INCREMENT_COUNT,
  rangeAttackPenalty,
  rangeIncrementMaxFeet,
} from "@/lib/shim-sham/strikes";
import { formatSigned, statModClass } from "../../ui/format";
import { formatStrikeDamage } from "../../ui/format-strike-damage";
import type { StrikeDamageMode } from "@/lib/shim-sham/strike-open-options";
import { MapRollButtons } from "../MapRollButtons";
import { AonLink } from "../AonLink";

function RangeIncrementButtons({
  rangeIncrement,
  selected,
  onChange,
}: {
  rangeIncrement: number;
  selected: number;
  onChange: (incrementsBeyondFirst: number) => void;
}) {
  return (
    <div className="strike-range-row">
      <span className="strike-range-label">Range</span>
      <div className="strike-range-btns" role="group" aria-label="Range increment">
        {Array.from({ length: MAX_RANGE_INCREMENT_COUNT }, (_, index) => {
          const penalty = rangeAttackPenalty(index);
          const maxFeet = rangeIncrementMaxFeet(rangeIncrement, index);
          const active = selected === index;
          const penaltyLabel = penalty === 0 ? "no penalty" : formatSigned(penalty);

          return (
            <button
              key={index}
              type="button"
              className={`strike-range-btn${active ? " strike-range-btn--active" : ""}`}
              aria-pressed={active}
              aria-label={`Increment ${index + 1}, up to ${maxFeet} feet, ${penaltyLabel}`}
              onClick={() => onChange(index)}
            >
              {maxFeet}′
            </button>
          );
        })}
      </div>
    </div>
  );
}

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
  const [rangeIncrements, setRangeIncrements] = useState<Record<string, number>>({});

  const weapons = [...unsortedWeapons].sort(compareByName);

  const content = weapons.map((w) => {
    const incrementsBeyondFirst = rangeIncrements[w.id] ?? 0;
    const rangePenalty = w.rangeIncrement != null ? rangeAttackPenalty(incrementsBeyondFirst) : 0;

    return (
      <div key={w.id} className="strike-entry">
        <div className="strike-header">
          <AonLink href={w.weaponUrl ?? w.url}>{w.name}</AonLink>
          <MapRollButtons
            label={w.name}
            values={w.mapAttacks}
            className={statModClass(attackDelta) ?? undefined}
            rangePenalty={rangePenalty}
            strikeRoll={{ damage: w.damageProfile, damageMode }}
          />
        </div>
        <div className="strike-damage-row">
          <div className={`strike-damage ${damagePenalized && !w.ranged ? "stat-penalized" : ""}`.trim()}>
            {formatStrikeDamage(w.damage, finisherDice, damageMode)}
          </div>
        </div>
        {w.critNote || w.critSpecialization ? (
          <div className="strike-crit-notes">
            {w.critNote ? (
              <div className="strike-crit">
                <strong>Crit:</strong> {w.critNote}
              </div>
            ) : null}
            {w.critSpecialization ? (
              <div className="strike-crit">
                <strong>Crit:</strong> {w.critSpecialization}
              </div>
            ) : null}
          </div>
        ) : null}
        {w.rangeIncrement != null ? (
          <RangeIncrementButtons
            rangeIncrement={w.rangeIncrement}
            selected={incrementsBeyondFirst}
            onChange={(value) =>
              setRangeIncrements((previous) => ({ ...previous, [w.id]: value }))
            }
          />
        ) : null}
        <div className="strike-traits">{w.traits.join(" · ")}</div>
      </div>
    );
  });

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
