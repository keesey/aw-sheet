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
  disabled = false,
}: {
  label: string;
  bonus: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  onRoll?: () => void;
  disabled?: boolean;
}) {
  const { openRoll } = useRoll();

  return (
    <button
      type="button"
      className={`roll-bonus-btn${className ? ` ${className}` : ""}`}
      style={style}
      aria-label={`Roll ${label}`}
      disabled={disabled}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        if (disabled) return;
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
