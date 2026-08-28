"use client";

import { useState } from "react";
import type { ActiveCondition } from "@/lib/types";
import {
  applyRecoveryCheck,
  evaluateRecoveryFlatCheck,
  recoveryCheckContext,
  recoveryOutcomeLabel,
} from "@/lib/shim-sham/recovery-check";
import { rollD20 } from "@/lib/shim-sham/roll";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

import { natClass } from "../../ui/nat-class";
export function RecoverySection({
  conditions,
  currentHp,
  level,
  save,
}: {
  conditions: ActiveCondition[];
  currentHp: number;
  level: number;
  save: SaveFn;
}) {
  const context = recoveryCheckContext(conditions, level);
  const [pendingRoll, setPendingRoll] = useState<number | null>(null);
  const [accepting, setAccepting] = useState(false);

  const pendingOutcome =
    pendingRoll != null ? evaluateRecoveryFlatCheck(pendingRoll, context.dc) : null;

  const preview =
    pendingRoll != null
      ? applyRecoveryCheck(conditions, currentHp, pendingRoll, level)
      : null;

  const handleRoll = () => {
    setPendingRoll(rollD20());
  };

  const handleAccept = async () => {
    if (pendingRoll == null) return;
    setAccepting(true);
    try {
      await save({ action: "recovery-check", d20: pendingRoll });
      setPendingRoll(null);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="stat-card sheet-section recovery-section">
      <div className="stat-label recovery-section__title">Recovery</div>

      <p className="recovery-section__intro">
        Attempt a{" "}
        <AonLink href="https://2e.aonsrd.com/rules/374-recovery-checks">
          recovery check
        </AonLink>{" "}
        at the start of your turn while{" "}
        <AonLink href="https://2e.aonsrd.com/conditions/11-dying">dying</AonLink>.
      </p>

      <dl className="recovery-section__stats">
        <div>
          <dt>Dying</dt>
          <dd>{context.dyingValue}</dd>
        </div>
        <div>
          <dt>DC</dt>
          <dd>
            {context.dc}
            {context.toughness ? (
              <span className="recovery-section__note"> (Toughness −1)</span>
            ) : null}
          </dd>
        </div>
        <div>
          <dt>Death at</dt>
          <dd>
            Dying {context.dyingMax}
            {context.doomedValue > 0 ? (
              <span className="recovery-section__note"> (Doomed {context.doomedValue})</span>
            ) : null}
          </dd>
        </div>
        {context.woundedValue > 0 ? (
          <div>
            <dt>Wounded</dt>
            <dd>{context.woundedValue}</dd>
          </div>
        ) : null}
      </dl>

      {pendingRoll == null ? (
        <button type="button" className="btn recovery-section__roll-btn" onClick={handleRoll}>
          Roll Recovery Check
        </button>
      ) : (
        <div className="recovery-section__result">
          <div className="recovery-section__roll-display">
            <span className="recovery-section__roll-label">d20</span>
            <span
              className={`recovery-section__roll-value${natClass(pendingRoll) ? ` ${natClass(pendingRoll)}` : ""}`}
            >
              {pendingRoll}
            </span>
            <span className="recovery-section__roll-vs">vs DC {context.dc}</span>
          </div>

          <div className={`recovery-section__outcome recovery-section__outcome--${pendingOutcome}`}>
            {pendingOutcome ? recoveryOutcomeLabel(pendingOutcome) : null}
          </div>

          {preview ? (
            <p className="recovery-section__preview">
              {preview.died
                ? "You die."
                : preview.nextDying === 0
                  ? "Lose Dying; gain or increase Wounded by 1. Remain unconscious at 0 HP."
                  : `Dying ${preview.previousDying} → ${preview.nextDying}`}
            </p>
          ) : null}

          <div className="recovery-section__actions">
            <button
              type="button"
              className="btn recovery-section__accept-btn"
              disabled={accepting}
              onClick={() => void handleAccept()}
            >
              Accept Roll
            </button>
            <button type="button" className="btn" disabled={accepting} onClick={handleRoll}>
              Roll again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
