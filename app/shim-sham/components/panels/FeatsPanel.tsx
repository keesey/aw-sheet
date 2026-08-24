import { FEATS_BY_LEVEL } from "@/lib/shim-sham/feats";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";

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
        {FEATS_BY_LEVEL.map(({ level, entries }) => (
          <section
            key={level}
            className={`feat-level${level > currentLevel ? " feat-level--future" : ""}`}
          >
            <div className="action-group-title">Level {level}</div>
            <ul className="feat-list">
              {entries.map((entry) => (
                <li key={`${level}-${entry.name}`}>
                  <AonLink href={entry.url}>{entry.name}</AonLink>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </BottomPanel>
  );
}
