import type { Panel } from "../types";

export function BottomNav({ onSelect }: { onSelect: (panel: Panel) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Sheet panels">
      <button type="button" className="btn" onClick={() => onSelect("conditions")}>
        Conditions
      </button>
      <button type="button" className="btn" onClick={() => onSelect("feats")}>
        Feats
      </button>
      <button type="button" className="btn" onClick={() => onSelect("inventory")}>
        Inventory
      </button>
      <button type="button" className="btn" onClick={() => onSelect("manage")}>
        Rest / Level
      </button>
    </nav>
  );
}
