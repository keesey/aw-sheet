import { PROGRESSION, getNextLevelSnapshot } from "@/lib/shim-sham/progression";
import type { AttributeKey, CharacterSheet, ProgressionFeat } from "@/lib/types";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

const byName = (a: ProgressionFeat, b: ProgressionFeat) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" });

function formatAttributeBoosts(boosts: AttributeKey[]): string[] {
  const counts = new Map<AttributeKey, number>();
  for (const attribute of boosts) {
    counts.set(attribute, (counts.get(attribute) ?? 0) + 1);
  }
  const seen = new Set<AttributeKey>();
  const labels: string[] = [];
  for (const attribute of boosts) {
    if (seen.has(attribute)) continue;
    seen.add(attribute);
    const count = counts.get(attribute)!;
    labels.push(count > 1 ? `${attribute} ×${count}` : attribute);
  }
  return labels;
}

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

function LevelSection({
  level,
  feats,
  attributeBoosts,
  future = false,
  hideTitle = false,
}: {
  level: number;
  feats: ProgressionFeat[];
  attributeBoosts?: AttributeKey[];
  future?: boolean;
  hideTitle?: boolean;
}) {
  const featEntries = feats.filter((entry) => entry.kind === "feat");
  const classFeatures = feats.filter((entry) => entry.kind === "class-feature");
  const boostLabels = attributeBoosts ? formatAttributeBoosts(attributeBoosts) : [];

  return (
    <section className={`feat-level${future ? " feat-level--future" : ""}`}>
      {hideTitle ? null : <h3 className="feat-level-title">Level {level}</h3>}
      {boostLabels.length > 0 ? (
        <div className="feat-level-boosts">
          <span className="feat-column-title">Attribute Boosts</span>
          <span className="feat-level-boosts__items">{boostLabels.join(" · ")}</span>
        </div>
      ) : null}
      <div className="feat-level-columns">
        <div className="feat-level-column">
          <div className="feat-column-title">Feats</div>
          <FeatList entries={featEntries} />
        </div>
        <div className="feat-level-column">
          <div className="feat-column-title">Class Features</div>
          <FeatList entries={classFeatures} />
        </div>
      </div>
    </section>
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
  const nextEntry = nextLevel
    ? PROGRESSION.find((entry) => entry.level === nextLevel.level)
    : undefined;

  return (
    <BottomPanel title="Levels" onClose={onClose}>
      <div className="feats-panel">
        {PROGRESSION.map(({ level, feats, attributeBoosts }) => (
          <LevelSection
            key={level}
            level={level}
            feats={feats}
            attributeBoosts={attributeBoosts}
            future={level > runtime.level}
          />
        ))}
      </div>

      {nextLevel && nextEntry ? (
        <section style={{ marginTop: "1.5rem" }}>
          <div className="stat-label">Level Up to {nextLevel.level}</div>
          <ul style={{ fontSize: "0.85rem", color: "var(--muted)", paddingLeft: "1.25rem" }}>
            <li>Max HP → {nextLevel.maxHp}</li>
            <li>AC → {nextLevel.ac}</li>
            <li>
              Fort/Ref/Will → +{nextLevel.fort}/+{nextLevel.reflex}/+{nextLevel.will}
            </li>
          </ul>
          <LevelSection
            level={nextLevel.level}
            feats={nextEntry.feats}
            attributeBoosts={nextEntry.attributeBoosts}
            hideTitle
          />
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
