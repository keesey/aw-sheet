"use client";

import { useState } from "react";
import type { CharacterSheet } from "@/lib/types";
import { rangeAttackPenalty } from "@/lib/shim-sham/strikes";
import { formatStrikeDamage, type StrikeDamageMode } from "../../lib/strike-format";
import { statModClass } from "../../lib/format";
import { MapRollButtons } from "../MapRollButtons";
import { AonLink } from "../AonLink";

function RangePenaltyControl({
  rangeIncrement,
  incrementsBeyondFirst,
  onChange,
}: {
  rangeIncrement: number;
  incrementsBeyondFirst: number;
  onChange: (value: number) => void;
}) {
  const penalty = rangeAttackPenalty(incrementsBeyondFirst);
  return (
    <div className="strike-range-control">
      <span className="strike-range-label">Range ({rangeIncrement}′)</span>
      <button
        type="button"
        className="btn btn-icon"
        disabled={incrementsBeyondFirst <= 0}
        onClick={() => onChange(Math.max(0, incrementsBeyondFirst - 1))}
        aria-label="Decrease range penalty"
      >
        −
      </button>
      <span className="strike-range-value">
        {incrementsBeyondFirst === 0 ? "1st" : `+${incrementsBeyondFirst} inc (${penalty})`}
      </span>
      <button
        type="button"
        className="btn btn-icon"
        disabled={incrementsBeyondFirst >= 5}
        onClick={() => onChange(Math.min(5, incrementsBeyondFirst + 1))}
        aria-label="Increase range penalty"
      >
        +
      </button>
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

  const weapons = [...unsortedWeapons].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

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
        {w.rangeIncrement != null ? (
          <RangePenaltyControl
            rangeIncrement={w.rangeIncrement}
            incrementsBeyondFirst={incrementsBeyondFirst}
            onChange={(value) =>
              setRangeIncrements((previous) => ({ ...previous, [w.id]: value }))
            }
          />
        ) : null}
        <div className="strike-damage-row">
          <div className={`strike-damage ${damagePenalized && !w.ranged ? "stat-penalized" : ""}`.trim()}>
            {formatStrikeDamage(w.damage, finisherDice, damageMode)}
          </div>
          {w.critNote ? <span className="strike-crit">({w.critNote})</span> : null}
        </div>
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
