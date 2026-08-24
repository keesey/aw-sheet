import { FEATS_BY_LEVEL } from "@/lib/shim-sham/feats";
import type { ProgressionFeat } from "@/lib/shim-sham/feats";
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

export function FeatsPanel({
  currentLevel,
  onClose,
}: {
  currentLevel: number;
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Feats & Class Features" onClose={onClose}>
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
              className={`feat-level${level > currentLevel ? " feat-level--future" : ""}`}
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
    </BottomPanel>
  );
}
