import type { CharacterSheet } from "@/lib/types";
import {
  formatBulkUnits,
} from "@/lib/shim-sham/bulk";
import { getEquipmentGroups } from "@/lib/shim-sham/inventory";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";
import { InventoryEquipmentItem } from "../inventory/InventoryEquipmentItem";

export function InventoryPanel({
  data,
  runtime,
  level,
  inventoryBulk,
  inventoryBulkMax,
  bulkBarPct,
  bulkBarFillColor,
  save,
  onClose,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  level: CharacterSheet["level"];
  inventoryBulk: number;
  inventoryBulkMax: number;
  bulkBarPct: number;
  bulkBarFillColor: string;
  save: SaveFn;
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Inventory" onClose={onClose} fullScreen>
      <div className="inventory-layout">
        <div className="inventory-bulk">
          <div className="inventory-bulk__header">
            <span className="inventory-bulk__total">
              Bulk {formatBulkUnits(inventoryBulk)} / {inventoryBulkMax}
            </span>
            <span className="inventory-bulk__note">
              Encumbered at {5 + level.abilities.STR}+
            </span>
          </div>
          <div className="hp-bar bulk-bar">
            <div
              className="bulk-bar-fill"
              style={{ width: `${bulkBarPct}%`, background: bulkBarFillColor }}
            />
          </div>
        </div>

        <div className="inventory-column">
          <div className="action-group-title">Equipment</div>
          {getEquipmentGroups(data.inventory).map((group) => (
            <div key={group.id} className="inventory-equipment-group">
              <div className="inventory-subgroup-title">{group.label}</div>
              {group.items.map((item) => (
                <InventoryEquipmentItem key={item.id} item={item} />
              ))}
            </div>
          ))}
        </div>

        <div className="inventory-column">
          <div className="action-group-title">Consumables</div>
          {data.consumableCatalog.map((c) => {
            const used = runtime.consumables[c.id] ?? 0;
            const remaining = c.quantity - used;
            return (
              <div key={c.id} className="inventory-item inventory-item--controls">
                <AonLink href={c.url}>{c.name}</AonLink>
                <div className="inventory-item__controls">
                  <span className="inventory-item__qty">
                    {remaining}/{c.quantity}
                  </span>
                  <button
                    type="button"
                    className="btn btn-icon"
                    disabled={remaining <= 0}
                    onClick={() =>
                      void save({ consumables: { ...runtime.consumables, [c.id]: used + 1 } })
                    }
                  >
                    Use
                  </button>
                  {used > 0 && (
                    <button
                      type="button"
                      className="btn btn-icon"
                      onClick={() =>
                        void save({ consumables: { ...runtime.consumables, [c.id]: used - 1 } })
                      }
                    >
                      ↩
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="inventory-column">
          <div className="action-group-title">Ammunition</div>
          {runtime.batteries.map((b, i) => (
            <div key={b.id} className="inventory-item inventory-item--controls">
              <AonLink href="https://2e.aonsrd.com/equipment/ammunition/2-batteries">Battery</AonLink>
              <div className="inventory-item__controls">
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => {
                    const batteries = [...runtime.batteries];
                    batteries[i] = { ...b, charges: Math.max(0, b.charges - 1) };
                    void save({ batteries });
                  }}
                >
                  −
                </button>
                <span className="inventory-item__qty">
                  {b.charges}/{b.max}
                </span>
                <button
                  type="button"
                  className="btn btn-icon"
                  onClick={() => {
                    const batteries = [...runtime.batteries];
                    batteries[i] = { ...b, charges: Math.min(b.max, b.charges + 1) };
                    void save({ batteries });
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
          <div className="inventory-item inventory-item--controls">
            <AonLink href="https://2e.aonsrd.com/equipment/ammunition/3-chem-tanks">
              Chem Tank (pistol)
            </AonLink>
            <div className="inventory-item__controls">
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => void save({ chemTankCharges: Math.max(0, runtime.chemTankCharges - 1) })}
              >
                −
              </button>
              <span className="inventory-item__qty">{runtime.chemTankCharges}/8</span>
              <button
                type="button"
                className="btn btn-icon"
                onClick={() => void save({ chemTankCharges: Math.min(8, runtime.chemTankCharges + 1) })}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>
    </BottomPanel>
  );
}
