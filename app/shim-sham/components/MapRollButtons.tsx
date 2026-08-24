"use client";

import { formatSigned } from "../lib/format";
import { RollBonusButton } from "./RollBonusButton";

const MAP_ATTACK_SUFFIXES = ["", " (2nd)", " (3rd)"] as const;

export function MapRollButtons({
  label,
  values,
  className,
  combatBonus = 0,
}: {
  label: string;
  values: [number, number, number];
  className?: string;
  combatBonus?: number;
}) {
  return (
    <span className={`map-roll-btns${className ? ` ${className}` : ""}`}>
      {values.map((value, index) => {
        const bonus = value + combatBonus;
        return (
          <RollBonusButton
            key={index}
            label={`${label}${MAP_ATTACK_SUFFIXES[index]}`}
            bonus={bonus}
            className="map-roll-btn"
          >
            {formatSigned(bonus)}
          </RollBonusButton>
        );
      })}
    </span>
  );
}
