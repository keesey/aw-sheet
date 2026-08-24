import type { ReactNode } from "react";
import type { CharacterSheet } from "@/lib/types";
import {
  formatBulkLabel,
  formatBulkUnits,
} from "@/lib/shim-sham/bulk";
import { getEquipmentGroups, SHIM_SHAM_AMMUNITION } from "@/lib/shim-sham/inventory";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";
import { InventoryEquipmentItem } from "../inventory/InventoryEquipmentItem";

function InventorySection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="inventory-section stat-card">
      <div className="action-group-title">{title}</div>
      {children}
    </section>
  );
}

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
  const consumablesContent = [...data.consumableCatalog]
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    .map((c) => {
      const used = runtime.consumables[c.id] ?? 0;
      const remaining = c.quantity - used;
      return (
        <div key={c.id} className="inventory-item inventory-item--controls">
          <div className="inventory-item__details">
            <AonLink href={c.url}>{c.name}</AonLink>
          </div>
          <span className="inventory-item__bulk">{formatBulkLabel(c.bulk)}</span>
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
    });

  const ammunitionContent = (
    <>
      {runtime.batteries.map((b, i) => (
        <div key={b.id} className="inventory-item inventory-item--controls">
          <div className="inventory-item__details">
            <AonLink href="https://2e.aonsrd.com/equipment/ammunition/2-batteries">Battery</AonLink>
          </div>
          <span className="inventory-item__bulk">
            {formatBulkLabel(SHIM_SHAM_AMMUNITION.battery.bulk)}
          </span>
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
        <div className="inventory-item__details">
          <AonLink href="https://2e.aonsrd.com/equipment/ammunition/3-chem-tanks">
            Chem Tank (pistol)
          </AonLink>
        </div>
        <span className="inventory-item__bulk">
          {formatBulkLabel(SHIM_SHAM_AMMUNITION.chemTank.bulk)}
        </span>
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
    </>
  );

  const sections = [
    ...getEquipmentGroups(data.inventory).map((group) => ({
      id: group.id,
      title: group.label,
      content: group.items.map((item) => (
        <InventoryEquipmentItem key={item.id} item={item} />
      )),
    })),
    {
      id: "consumables",
      title: "Consumables",
      content: consumablesContent,
    },
    {
      id: "ammunition",
      title: "Ammunition",
      content: ammunitionContent,
    },
  ].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" }));

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

        <div className="inventory-sections">
          {sections.map((section) => (
            <InventorySection key={section.id} title={section.title}>
              {section.content}
            </InventorySection>
          ))}
        </div>
      </div>
    </BottomPanel>
  );
}
