import type { CharacterSheet } from "@/lib/types";
import type { ConditionEffects } from "@/lib/shim-sham/condition-effects";
import { runtimeDerivedStats } from "@/lib/shim-sham/condition-effects";
import { hasJetpackInstalled } from "@/lib/shim-sham/jetpack";
import { formatSigned, statModClass } from "../../lib/format";
import { getSpeedClassName, getSpeedDisplayValue } from "../../lib/speed";
import type { SaveFn, SpeedEntry } from "../../types";
import { ActionToggle } from "../ActionToggle";
import { RollBonusButton } from "../RollBonusButton";
import { AonLink } from "../AonLink";

export function StatsGrid({
  data,
  level,
  runtime,
  displayAc,
  acDelta,
  effects,
  showCredits = true,
  showSpeed = false,
  speedEntries = [],
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
  showCredits?: boolean;
  showSpeed?: boolean;
  speedEntries?: SpeedEntry[];
  creditInput: string;
  onCreditInputChange: (value: string) => void;
  save: SaveFn;
}) {
  const derived = runtimeDerivedStats(level, effects);
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
        <div className={`stat-value ${statModClass(acDelta) ?? ""}`.trim()}>{displayAc}</div>
        <div className="stat-card__note">
          <AonLink href={data.armor.url}>{data.armor.name}</AonLink>
        </div>
      </div>

      <div className="stat-card">
        <div className="stat-label">Perception</div>
        <RollBonusButton
          label="Perception"
          bonus={derived.perception}
          className={`stat-value roll-bonus-btn--stat ${statModClass(derived.perception - level.perception) ?? ""}`.trim()}
        >
          {formatSigned(derived.perception)}
        </RollBonusButton>
        <div className="stat-card__note">
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
        <div className={`stat-value ${statModClass(derived.classDc - level.classDc) ?? ""}`.trim()}>
          {derived.classDc}
        </div>
      </div>

      <div className="stat-card">
        <div className="saves-grid">
          <span className="stat-label">Fort</span>
          <span className="stat-label">Ref</span>
          <span className="stat-label">Will</span>
          <RollBonusButton
            label="Fortitude"
            bonus={derived.fort}
            className={`stat-value ${statModClass(derived.fort - level.fort) ?? ""}`.trim()}
          >
            {formatSigned(derived.fort)}
          </RollBonusButton>
          <RollBonusButton
            label="Reflex"
            bonus={derived.reflex}
            className={`stat-value ${statModClass(derived.reflex - level.reflex) ?? ""}`.trim()}
          >
            {formatSigned(derived.reflex)}
          </RollBonusButton>
          <RollBonusButton
            label="Will"
            bonus={derived.will}
            className={`stat-value ${statModClass(derived.will - level.will) ?? ""}`.trim()}
          >
            {formatSigned(derived.will)}
          </RollBonusButton>
        </div>
      </div>

      {showSpeed ? (
        <div className="stat-card stat-card--wide">
          <div className="stat-card__header-row">
            <div className="stat-label">Speed</div>
            {hasJetpackInstalled(level.level) ? (
              <div className="speed-jetpack-control">
                <span className="speed-jetpack-label">Jetpack</span>
                <ActionToggle
                  label="Jetpack"
                  variant="jetpack"
                  checked={runtime.jetpack}
                  onChange={(checked) => void save({ jetpack: checked })}
                />
              </div>
            ) : null}
          </div>
          <div style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.35rem", lineHeight: 1.5 }}>
            {speedEntries.map((speed, index) => {
              const speedClass = getSpeedClassName(speed, runtime.panache, runtime.accelerate);
              const displayValue = getSpeedDisplayValue(
                speed,
                level.level,
                runtime.panache,
                runtime.accelerate,
                effects.speedDelta,
              );
              const valueClass =
                effects.speedDelta < 0 ? "stat-penalized" : speedClass;
              return (
                <span key={speed.label}>
                  {index > 0 && " · "}
                  {speed.label === "Fly" ? (
                    <span className="speed-fly-label">{speed.label}</span>
                  ) : (
                    speed.label
                  )}{" "}
                  <span className={valueClass}>{displayValue}′</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}

      {showCredits ? (
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
      ) : null}
    </div>
  );
}
