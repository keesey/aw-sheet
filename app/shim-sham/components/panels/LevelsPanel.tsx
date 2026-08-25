import { FEATS_BY_LEVEL } from "@/lib/shim-sham/feats";
import type { ProgressionFeat } from "@/lib/shim-sham/feats";
import { getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { CharacterSheet } from "@/lib/types";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

const byName = (a: ProgressionFeat, b: ProgressionFeat) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function FeatList({ entries }: { entries: ProgressionFeat[] }) {
  const sorted = [...entries].sort(byName);
  if (sorted.length === 0) {
    return null;
  }

  return (
    <ul className="feat-list">
      {sorted.map((entry) => (
        <li key={entry.name}>
          <AonLink href={entry.url}>{entry.name}</AonLink>
        </li>
      ))}
    </ul>
  );
}

export function LevelsPanel({
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
    <BottomPanel title="Levels" onClose={onClose}>
      <div className="feats-panel">
        <div className="feat-level-columns feat-level-columns--header">
          <div className="feat-column-title">Feats</div>
          <div className="feat-column-title">Class Features</div>
        </div>
        {FEATS_BY_LEVEL.map(({ level, entries }) => {
          const feats = entries.filter((entry) => entry.kind === "feat");
          const classFeatures = entries.filter((entry) => entry.kind === "class-feature");

          return (
            <section
              key={level}
              className={`feat-level${level > runtime.level ? " feat-level--future" : ""}`}
            >
              <div className="action-group-title">Level {level}</div>
              <div className="feat-level-columns">
                <FeatList entries={feats} />
                <FeatList entries={classFeatures} />
              </div>
            </section>
          );
        })}
      </div>

      {nextLevel ? (
        <section style={{ marginTop: "1.5rem" }}>
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
            style={{ width: "100%", marginTop: "0.75rem" }}
            onClick={() => {
              if (confirm(`Level up to ${nextLevel.level}? HP will be set to ${nextLevel.maxHp}.`)) {
                void save({ action: "level-up" });
              }
            }}
          >
            Level Up to {nextLevel.level}
          </button>
        </section>
      ) : (
        <p style={{ marginTop: "1.5rem", color: "var(--muted)" }}>At max planned level (15).</p>
      )}

      <div style={{ marginTop: "1.5rem" }}>
        <AonLink href={data.planUrl}>View full progression plan</AonLink>
      </div>
    </BottomPanel>
  );
}
