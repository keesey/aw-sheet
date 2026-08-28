import type { InventoryItem } from "@/lib/types";
import { formatBulkLabel } from "@/lib/shim-sham/data/bulk";
import { AonLink } from "../AonLink";

export function InventoryEquipmentItem({ item }: { item: InventoryItem }) {
  return (
    <div className={`inventory-item ${item.indented ? "inventory-item--indented" : ""}`}>
      <div className="inventory-item__details">
        <span className="inventory-item__name">
          {item.url ? <AonLink href={item.url}>{item.name}</AonLink> : item.name}
          {item.notes && <span className="inventory-item__notes"> — {item.notes}</span>}
        </span>
        {item.traits && item.traits.length > 0 && (
          <div className="strike-traits">{item.traits.join(" · ")}</div>
        )}
      </div>
      <span className="inventory-item__bulk">{formatBulkLabel(item.bulk)}</span>
    </div>
  );
}
