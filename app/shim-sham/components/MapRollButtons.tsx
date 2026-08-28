"use client";

import { Fragment } from "react";
import type { StrikeDamageProfile } from "@/lib/types";
import { formatSigned } from "../ui/format";
import type { StrikeDamageMode } from "@/lib/shim-sham/rules/strike-open-options";
import { useRoll } from "../context/RollContext";
import { RollBonusButton } from "./RollBonusButton";

const MAP_ATTACK_SUFFIXES = ["", " (2nd)", " (3rd)"] as const;

export function MapRollButtons({
  label,
  values,
  className,
  combatBonus = 0,
  strikeRoll,
  rangePenalty = 0,
  endsCover = false,
}: {
  label: string;
  values: [number, number, number];
  className?: string;
  combatBonus?: number;
  strikeRoll?: {
    damage: StrikeDamageProfile;
    damageMode: StrikeDamageMode;
  };
  rangePenalty?: number;
  endsCover?: boolean;
}) {
  const { openStrikeRoll, openRoll } = useRoll();

  return (
    <span className={`map-roll-btns${className ? ` ${className}` : ""}`}>
      {values.map((value, index) => {
        const bonus = value + combatBonus + (rangePenalty ?? 0);
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
              endsCover={endsCover || !!strikeRoll}
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
                  : () => openRoll(rollLabel, bonus, { endsCover })
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
