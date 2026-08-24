import type { CharacterSheet } from "@/lib/types";
import type { ConditionEffects } from "@/lib/shim-sham/condition-effects";
import { formatSigned, statModClass } from "../../lib/format";
import type { SaveFn } from "../../types";
import { RollBonusButton } from "../RollBonusButton";
import { AonLink } from "../AonLink";

export function StatsGrid({
  data,
  level,
  runtime,
  displayAc,
  acDelta,
  effects,
  creditInput,
  onCreditInputChange,
  save,
}: {
  data: CharacterSheet["static"];
  level: CharacterSheet["level"];
  runtime: CharacterSheet["runtime"];
  displayAc: number;
  acDelta: number;
  effects: ConditionEffects;
  creditInput: string;
  onCreditInputChange: (value: string) => void;
  save: SaveFn;
}) {
  const creditsAmount = (() => {
    const parsed = parseInt(creditInput.trim(), 10);
    return creditInput.trim() === "" || Number.isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  })();

  const applyCredits = (sign: -1 | 1) => {
    if (!creditsAmount) return;
    void save({ credits: Math.max(0, runtime.credits + sign * creditsAmount) });
    onCreditInputChange("");
  };

  return (
    <div className="sheet-grid">
      <div className="stat-card">
        <div className="stat-label">Armor Class</div>
        <div className="ac-row">
          <div className={`stat-value ${statModClass(acDelta) ?? ""}`.trim()}>{displayAc}</div>
        </div>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
          <AonLink href={data.armor.url}>{data.armor.name}</AonLink>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Perception</div>
        <RollBonusButton
          label="Perception"
          bonus={level.perception + effects.perception}
          className={`stat-value roll-bonus-btn--stat ${statModClass(effects.perception) ?? ""}`.trim()}
        >
          {formatSigned(level.perception + effects.perception)}
        </RollBonusButton>
        <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.35rem", lineHeight: 1.4 }}>
          {data.senses.map((s, i) => (
            <span key={s.name} className={effects.sensesDisabled ? "stat-penalized" : undefined} style={effects.sensesDisabled ? { textDecoration: "line-through" } : undefined}>
              {i > 0 && " · "}
              <AonLink href={s.url}>{s.name}</AonLink>
            </span>
          ))}
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Class DC</div>
        <div className={`stat-value ${statModClass(effects.classDc) ?? ""}`.trim()}>
          {level.classDc + effects.classDc}
        </div>
      </div>

      <div className="stat-card">
        <div className="saves-grid">
          <span className="stat-label">Fort</span>
          <span className="stat-label">Ref</span>
          <span className="stat-label">Will</span>
          <RollBonusButton
            label="Fortitude"
            bonus={level.fort + effects.fort}
            className={`stat-value ${statModClass(effects.fort) ?? ""}`.trim()}
          >
            {formatSigned(level.fort + effects.fort)}
          </RollBonusButton>
          <RollBonusButton
            label="Reflex"
            bonus={level.reflex + effects.reflex}
            className={`stat-value ${statModClass(effects.reflex) ?? ""}`.trim()}
          >
            {formatSigned(level.reflex + effects.reflex)}
          </RollBonusButton>
          <RollBonusButton
            label="Will"
            bonus={level.will + effects.will}
            className={`stat-value ${statModClass(effects.will) ?? ""}`.trim()}
          >
            {formatSigned(level.will + effects.will)}
          </RollBonusButton>
        </div>
      </div>

      <div className="stat-card stat-card--wide">
        <div className="stat-label">Credits</div>
        <div className="credits-row">
          <div className="stat-value credits-amount">
            {runtime.credits.toLocaleString()}
          </div>
          <div className="credits-controls">
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => applyCredits(-1)}
              disabled={!creditsAmount}
              aria-label="Subtract credits"
            >
              −
            </button>
            <input
              type="number"
              inputMode="numeric"
              min={1}
              placeholder="Amount"
              value={creditInput}
              onChange={(e) => onCreditInputChange(e.target.value)}
              aria-label="Credit change amount"
              className="amount-input credits-input"
            />
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => applyCredits(1)}
              disabled={!creditsAmount}
              aria-label="Add credits"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
