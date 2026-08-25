"use client";

import { Fragment, useEffect, useState } from "react";
import { rollDiceNotation, type DamageRollLine, type RollResult } from "../../lib/roll";

function natClass(d20: number): string | undefined {
  if (d20 === 20) return "roll-result__nat20";
  if (d20 === 1) return "roll-result__nat1";
  return undefined;
}

function AttackRollBreakdown({ d20, bonus }: { d20: number; bonus: number }) {
  if (bonus === 0) return null;

  const nat = natClass(d20);
  const operatorText = bonus < 0 ? ` - ${Math.abs(bonus)}` : ` + ${bonus}`;
  return (
    <div className="roll-result__breakdown">
      <span className={`roll-result__die${nat ? ` ${nat}` : ""}`}>{d20}</span>
      <span className="roll-result__operator">{operatorText}</span>
    </div>
  );
}

function CheckRollBody({ result }: { result: Extract<RollResult, { kind: "check" }> }) {
  const nat = natClass(result.d20);
  return (
    <>
      <div className={`roll-result__total${nat ? ` ${nat}` : ""}`}>{result.total}</div>
      <AttackRollBreakdown d20={result.d20} bonus={result.bonus} />
    </>
  );
}

function DamageRollCell({ line }: { line: DamageRollLine }) {
  const hasRolls = line.rolls.length > 0;
  const hasModifier = line.modifier !== 0;
  if (!hasRolls && !hasModifier) return null;

  const terms = (
    <>
      {line.rolls.map((value, index) => (
        <Fragment key={`d${index}`}>
          {index > 0 ? " + " : null}
          <span className="roll-result__die">{value}</span>
        </Fragment>
      ))}
      {hasModifier ? (
        <>
          {hasRolls ? " + " : null}
          <span>{line.modifier < 0 ? line.modifier : Math.abs(line.modifier)}</span>
        </>
      ) : null}
    </>
  );

  if (line.critMultiplier != null && line.critMultiplier > 1) {
    return (
      <>
        ({terms}) × {line.critMultiplier}
      </>
    );
  }

  return terms;
}

function CritEffectControl({
  critNote,
  critDice,
  isCrit,
  resetKey,
}: {
  critNote: string;
  critDice: string;
  isCrit: boolean;
  resetKey: string;
}) {
  const [critRoll, setCritRoll] = useState<number | null>(null);

  useEffect(() => {
    setCritRoll(null);
  }, [resetKey]);

  return (
    <div
      className={`roll-result__crit-note${isCrit ? " roll-result__crit-note--active" : ""}`}
    >
      <button
        type="button"
        className="roll-result__crit-btn"
        onClick={() => setCritRoll(rollDiceNotation(critDice).total)}
        aria-label={`Roll ${critDice} for ${critNote}`}
      >
        {critNote}
      </button>
      {critRoll != null ? (
        <div className="roll-result__crit-roll">{critRoll}</div>
      ) : null}
    </div>
  );
}

function StrikeRollBody({ result }: { result: Extract<RollResult, { kind: "strike" }> }) {
  const nat = natClass(result.d20);
  const deadlyRolled = result.damageLines.some((line) => line.label.includes("deadly"));

  return (
    <>
      <div className="roll-result__section-label">Attack</div>
      <div className={`roll-result__total${nat ? ` ${nat}` : ""}`}>{result.total}</div>
      <AttackRollBreakdown d20={result.d20} bonus={result.bonus} />

      <div className="roll-result__section-label">Damage</div>
      <table className="roll-damage-table">
        <thead>
          <tr>
            <th scope="col">Type</th>
            <th scope="col">Roll</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {result.damageLines.map((line) => (
            <tr key={line.label}>
              <td>{line.label}</td>
              <td className="roll-damage-table__roll-cell">
                <DamageRollCell line={line} />
              </td>
              <td>{line.subtotal}</td>
            </tr>
          ))}
          <tr className="roll-damage-table__total-row">
            <td colSpan={2}>Total</td>
            <td>{result.damageTotal}</td>
          </tr>
        </tbody>
      </table>

      {result.critNote && result.critDice && !deadlyRolled ? (
        <CritEffectControl
          critNote={result.critNote}
          critDice={result.critDice}
          isCrit={result.isCrit}
          resetKey={`${result.d20}-${result.damageTotal}`}
        />
      ) : result.critNote ? (
        <div
          className={`roll-result__crit-note${result.isCrit ? " roll-result__crit-note--active" : ""}`}
        >
          {result.critNote}
          {result.isCrit ? " (on critical hit)" : null}
        </div>
      ) : null}
    </>
  );
}

export function RollResultModal({
  result,
  onClose,
  onReroll,
}: {
  result: RollResult;
  onClose: () => void;
  onReroll: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden />
      <div className="panel-sheet roll-result-modal" role="dialog" aria-label={result.label}>
        <div className="panel-header">
          <strong>{result.label}</strong>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-body roll-result-body">
          {result.kind === "strike" ? (
            <StrikeRollBody result={result} />
          ) : (
            <CheckRollBody result={result} />
          )}
          <button type="button" className="btn roll-result__reroll" onClick={onReroll}>
            Roll again
          </button>
        </div>
      </div>
    </>
  );
}
