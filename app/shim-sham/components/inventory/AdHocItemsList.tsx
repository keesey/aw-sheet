import type { AdHocInventoryItem } from "@/lib/types";
import { formatBulkLabel } from "@/lib/shim-sham/bulk";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

export function AdHocItemsList({
  items,
  save,
}: {
  items: AdHocInventoryItem[];
  save: SaveFn;
}) {
  const sortedItems = [...items].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );

  const removeItem = (id: string) => {
    void save({ adHocItems: items.filter((item) => item.id !== id) });
  };

  return (
    <>
      {sortedItems.map((item) => (
        <div key={item.id} className="inventory-item inventory-item--controls">
          <div className="inventory-item__details">
            {item.url ? <AonLink href={item.url}>{item.name}</AonLink> : item.name}
          </div>
          <span className="inventory-item__bulk">{formatBulkLabel(item.bulk)}</span>
          <div className="inventory-item__controls">
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
