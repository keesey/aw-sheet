import type { ReactNode } from "react";
import type { CharacterSheet } from "@/lib/types";
import {
  formatBulkLabel,
  formatBulkUnits,
  isOverburdenedByBulk,
} from "@/lib/shim-sham/bulk";
import { getEquipmentGroups, SHIM_SHAM_AMMUNITION } from "@/lib/shim-sham/inventory";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";
import { InventoryEquipmentItem } from "../inventory/InventoryEquipmentItem";
import { AdHocItemForm } from "../inventory/AdHocItemForm";
import { AdHocItemsList } from "../inventory/AdHocItemsList";

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
  strModifier,
  inventoryBulk,
  inventoryBulkMax,
  bulkBarPct,
  bulkBarFillColor,
  save,
  onClose,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  strModifier: number;
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

  const overburdened = isOverburdenedByBulk(inventoryBulk, strModifier);

  const sections = [
    ...(runtime.adHocItems.length > 0
      ? [
          {
            id: "ad-hoc",
            title: "Ad Hoc",
            content: <AdHocItemsList items={runtime.adHocItems} save={save} />,
          },
        ]
      : []),
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
              Encumbered at {5 + strModifier}+ · Max {inventoryBulkMax}
            </span>
          </div>
          {overburdened ? (
            <p className="inventory-bulk__warning">
              Over max bulk — drop items before you can carry more.
            </p>
          ) : null}
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

        <AdHocItemForm
          items={runtime.adHocItems}
          currentBulk={inventoryBulk}
          maxBulk={inventoryBulkMax}
          save={save}
        />
      </div>
    </BottomPanel>
  );
}
