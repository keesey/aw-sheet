import type { CharacterSheet } from "@/lib/types";
import { getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

export function ManagePanel({
  data,
  runtime,
  save,
  onClose,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  save: SaveFn;
  onClose: () => void;
}) {
  const nextLevel = getNextLevelSnapshot(runtime.level);

  return (
    <BottomPanel title="Rest & Level Up" onClose={onClose}>
      <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
        <AonLink href="https://2e.aonsrd.com/rules/492-rest-and-daily-preparations">
          Rest and Daily Preparations
        </AonLink>
      </p>
      <button
        type="button"
        className="btn btn-primary"
        style={{ width: "100%", marginBottom: "1rem" }}
        onClick={() => {
          if (
            !confirm(
              "Rest for 8 hours? Heals CON×level HP, resets daily abilities, and clears panache.",
            )
          ) {
            return;
          }
          void save({
            action: "rest",
            currentHp: runtime.currentHp,
            conditions: runtime.conditions,
            forceFieldUsesUsed: 0,
            forceFieldHp: 0,
            forceFieldActive: false,
            meyelRerollUsed: false,
            panache: false,
            accelerate: false,
            jetpack: false,
            combat: false,
          }).then(() => onClose());
        }}
      >
        Rest (8 hours)
      </button>

      {nextLevel ? (
        <>
          <div className="stat-label">Level Up to {nextLevel.level}</div>
          <ul style={{ fontSize: "0.85rem", color: "var(--muted)", paddingLeft: "1.25rem" }}>
            <li>Max HP → {nextLevel.maxHp}</li>
            <li>AC → {nextLevel.ac}</li>
            <li>
              Fort/Ref/Will → +{nextLevel.fort}/+{nextLevel.reflex}/+{nextLevel.will}
            </li>
            {nextLevel.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
          <button
            type="button"
            className="btn btn-success"
            style={{ width: "100%" }}
            onClick={() => {
              if (confirm(`Level up to ${nextLevel.level}? HP will be set to ${nextLevel.maxHp}.`)) {
                void save({ action: "level-up" });
              }
            }}
          >
            Level Up to {nextLevel.level}
          </button>
        </>
      ) : (
        <p>At max planned level (15).</p>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <AonLink href={data.planUrl}>View full progression plan</AonLink>
      </div>
    </BottomPanel>
  );
}
