"use client";

import { Fragment } from "react";
import type { StrikeDamageProfile } from "@/lib/types";
import { formatSigned } from "../lib/format";
import type { StrikeDamageMode } from "../lib/strike-format";
import { useRoll } from "../context/RollContext";
import { RollBonusButton } from "./RollBonusButton";

const MAP_ATTACK_SUFFIXES = ["", " (2nd)", " (3rd)"] as const;

export function MapRollButtons({
  label,
  values,
  className,
  combatBonus = 0,
  strikeRoll,
}: {
  label: string;
  values: [number, number, number];
  className?: string;
  combatBonus?: number;
  strikeRoll?: {
    damage: StrikeDamageProfile;
    damageMode: StrikeDamageMode;
  };
}) {
  const { openStrikeRoll } = useRoll();

  return (
    <span className={`map-roll-btns${className ? ` ${className}` : ""}`}>
      {values.map((value, index) => {
        const bonus = value + combatBonus;
        const rollLabel = `${label}${MAP_ATTACK_SUFFIXES[index]}`;
        return (
          <Fragment key={index}>
            {index > 0 ? (
              <span className="map-roll-sep" aria-hidden="true">
                /
              </span>
            ) : null}
            <RollBonusButton
              label={rollLabel}
              bonus={bonus}
              className="map-roll-btn"
              onRoll={
                strikeRoll
                  ? () =>
                      openStrikeRoll({
                        label: rollLabel,
                        bonus,
                        mapIndex: index,
                        damage: strikeRoll.damage,
                        damageMode: strikeRoll.damageMode,
                      })
                  : undefined
              }
            >
              {formatSigned(bonus)}
            </RollBonusButton>
          </Fragment>
        );
      })}
    </span>
  );
}
