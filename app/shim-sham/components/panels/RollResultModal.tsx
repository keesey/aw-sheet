"use client";

import { useEffect } from "react";
import { formatSigned } from "../../lib/format";
import type { RollResult } from "../../lib/roll";

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

  const natClass =
    result.d20 === 20 ? "roll-result__nat20" :
    result.d20 === 1 ? "roll-result__nat1" :
    undefined;

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
          <div className={`roll-result__total${natClass ? ` ${natClass}` : ""}`}>{result.total}</div>
          <div className="roll-result__breakdown">
            <span className={`roll-result__die${natClass ? ` ${natClass}` : ""}`}>{result.d20}</span>
            {result.bonus !== 0 ? (
              <>
                <span className="roll-result__operator">{formatSigned(result.bonus)}</span>
              </>
            ) : (
              <span className="roll-result__label">d20</span>
            )}
          </div>
          <button type="button" className="btn roll-result__reroll" onClick={onReroll}>
            Roll again
          </button>
        </div>
      </div>
    </>
  );
}
