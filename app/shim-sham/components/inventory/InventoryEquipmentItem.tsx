import type { InventoryItem } from "@/lib/types";
import { formatBulkLabel } from "@/lib/shim-sham/data/bulk";
import { AonLink } from "../AonLink";
import { InventoryActionButton } from "./InventoryActionButton";

export function InventoryEquipmentItem({
  item,
  inCloudStorage,
  carryLabel,
  onToggleCloudStorage,
}: {
  item: InventoryItem;
  inCloudStorage?: boolean;
  carryLabel?: string | null;
  onToggleCloudStorage?: () => void;
}) {
  return (
    <div className={`inventory-item ${item.indented ? "inventory-item--indented" : ""}`}>
      <div className="inventory-item__details">
        <span className="inventory-item__name">
          {item.url ? <AonLink href={item.url}>{item.name}</AonLink> : item.name}
          {inCloudStorage ? (
            <span className="inventory-item__tag inventory-item__tag--cloud"> · Cloud</span>
          ) : carryLabel ? (
            <span className="inventory-item__tag inventory-item__tag--carry"> · {carryLabel}</span>
          ) : null}
          {item.notes && <span className="inventory-item__notes"> — {item.notes}</span>}
        </span>
        {item.traits && item.traits.length > 0 && (
          <div className="strike-traits">{item.traits.join(" · ")}</div>
        )}
      </div>
      <span className="inventory-item__bulk">
        {inCloudStorage ? "—" : formatBulkLabel(item.bulk)}
      </span>
      {onToggleCloudStorage ? (
        <div className="inventory-item__controls">
          <InventoryActionButton
            kind={inCloudStorage ? "double" : "single"}
            label={inCloudStorage ? "Get" : "Stow"}
            title={
              inCloudStorage
                ? "Retrieve from Cloud Storage (2 Interact actions in play)"
                : "Stow in Cloud Storage (Interact)"
            }
            onClick={onToggleCloudStorage}
          />
        </div>
      ) : null}
    </div>
  );
}
