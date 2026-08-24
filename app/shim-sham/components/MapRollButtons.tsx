"use client";

import { Fragment } from "react";
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
          <Fragment key={index}>
            {index > 0 ? (
              <span className="map-roll-sep" aria-hidden="true">
                /
              </span>
            ) : null}
            <RollBonusButton
              label={`${label}${MAP_ATTACK_SUFFIXES[index]}`}
              bonus={bonus}
              className="map-roll-btn"
            >
              {formatSigned(bonus)}
            </RollBonusButton>
          </Fragment>
        );
      })}
    </span>
  );
}
