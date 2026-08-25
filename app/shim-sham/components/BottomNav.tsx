import type { Panel } from "../types";

export function BottomNav({
  onSelect,
  onRest,
}: {
  onSelect: (panel: Panel) => void;
  onRest: () => void;
}) {
  return (
    <nav className="bottom-nav" aria-label="Sheet panels">
      <button type="button" className="btn" onClick={() => onSelect("conditions")}>
        Conditions
      </button>
      <button type="button" className="btn" onClick={() => onSelect("inventory")}>
        Inventory
      </button>
      <button type="button" className="btn" onClick={() => onSelect("levels")}>
        Levels
      </button>
      <button type="button" className="btn" onClick={onRest}>
        Rest
      </button>
    </nav>
  );
}
