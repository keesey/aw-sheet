"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRoll } from "../context/RollContext";

export function RollBonusButton({
  label,
  bonus,
  className,
  style,
  children,
  onRoll,
}: {
  label: string;
  bonus: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onRoll?: () => void;
}) {
  const { openRoll } = useRoll();

  return (
    <button
      type="button"
      className={`roll-bonus-btn${className ? ` ${className}` : ""}`}
      style={style}
      aria-label={`Roll ${label}`}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (onRoll) {
          onRoll();
        } else {
          openRoll(label, bonus);
        }
      }}
    >
      {children}
    </button>
  );
}
