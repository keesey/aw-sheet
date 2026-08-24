import type { CharacterSheet } from "@/lib/types";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

export function HpBlock({
  level,
  runtime,
  maxHp,
  hpPct,
  ffPct,
  hpDeltaInput,
  onHpDeltaInputChange,
  onApplyHpDelta,
  save,
}: {
  level: CharacterSheet["level"];
  runtime: CharacterSheet["runtime"];
  maxHp: number;
  hpPct: number;
  ffPct: number;
  hpDeltaInput: string;
  onHpDeltaInputChange: (value: string) => void;
  onApplyHpDelta: (sign: -1 | 1) => void;
  save: SaveFn;
}) {
  return (
    <div className="stat-card sheet-hp-block">
      <span className="stat-label">Hit Points</span>
      <div className="stat-value stat-value--hp" style={{ fontSize: "2.5rem" }}>
        {runtime.currentHp}
        <span
          style={{ fontSize: "1.25rem", fontWeight: 500 }}
          className={maxHp < level.maxHp ? "stat-penalized" : undefined}
        >
          {" "}/ {maxHp}
        </span>
      </div>
      <div className="hp-bar">
        <div className={`hp-bar-fill ${hpPct <= 25 ? "low" : ""}`} style={{ width: `${hpPct}%` }} />
      </div>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          className="btn btn-danger btn-icon"
          onClick={() => onApplyHpDelta(-1)}
          aria-label="Apply damage"
        >
          −
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          placeholder="Amount"
          value={hpDeltaInput}
          onChange={(e) => onHpDeltaInputChange(e.target.value)}
          aria-label="HP change amount"
          className="amount-input hp-amount-input"
        />
        <button
          type="button"
          className="btn btn-success btn-icon"
          onClick={() => onApplyHpDelta(1)}
          aria-label="Apply healing"
        >
          +
        </button>
        <button type="button" className="btn" onClick={() => void save({ currentHp: maxHp })}>
          Full
        </button>
      </div>

      <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="stat-label">
            <AonLink href="https://2e.aonsrd.com/treasure/57">Force Field</AonLink> Temp HP
          </span>
          <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
            {runtime.forceFieldUsesUsed}/{FORCE_FIELD_DAILY_USES} raises used
          </span>
        </div>
        <div className="stat-value stat-value--ff" style={{ fontSize: "1.75rem", color: "var(--accent)" }}>
          {runtime.forceFieldHp}
          <span style={{ fontSize: "1rem", color: "var(--muted)", fontWeight: 500 }}>
            {" "}/ {FORCE_FIELD_MAX_HP}
          </span>
        </div>
        <div className="force-field-bar-row">
          <div className="hp-bar">
            <div className="force-field-bar-fill" style={{ width: `${ffPct}%` }} />
          </div>
          <button
            type="button"
            className="btn"
            onClick={() => void save({ action: "force-field-regen" })}
            disabled={
              !runtime.forceFieldActive ||
              runtime.forceFieldHp >= FORCE_FIELD_MAX_HP
            }
          >
            +2 (turn)
          </button>
        </div>
      </div>
    </div>
  );
}
