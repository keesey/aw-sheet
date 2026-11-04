import type { ReactNode } from "react";
import type { CharacterSheet } from "@/lib/types";
import {
  formatBulkLabel,
  formatBulkUnits,
  isOverburdenedByBulk,
} from "@/lib/shim-sham/data/bulk";
import { compareByName } from "@/lib/shim-sham/sort";
import {
  getEquipmentGroups,
  inventoryCloudStorageBulk,
  SHIM_SHAM_AMMUNITION,
} from "@/lib/shim-sham/data/inventory";
import {
  adjustStowedConsumable,
  carriedConsumableCount,
  CLOUD_STORAGE_BOND_LEVEL,
  cloudStorageCapacity,
  CLOUD_STORAGE_FEAT_URL,
  CLOUD_STORAGE_PARTNER,
  isBreachingGunInCloudStorage,
  isEquipmentInCloudStorage,
  normalizeCloudStorage,
  stowedConsumableCount,
  toggleEquipmentInCloudStorage,
} from "@/lib/shim-sham/data/cloud-storage";
import {
  carryStateLabel,
  drawStrikesForInventoryItemPatch,
  primaryStrikeIdForInventoryItem,
} from "@/lib/shim-sham/data/weapon-carry";
import { adjustProjectileMagazine } from "@/lib/shim-sham/rules/projectile-ammo";
import { AON, aonAmmunition } from "@/lib/shim-sham/aon";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";
import { BottomPanel } from "../BottomPanel";
import { InventoryActionButton } from "../inventory/InventoryActionButton";
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
  const cloudStorage = normalizeCloudStorage(runtime, data.consumableCatalog);
  const breachingGunInCloud = isBreachingGunInCloudStorage(runtime, data.consumableCatalog);
  const cloudBulk = inventoryCloudStorageBulk(data.inventory, data.consumableCatalog, runtime);
  const cloudBulkMax = cloudStorageCapacity(CLOUD_STORAGE_BOND_LEVEL);

  const consumablesContent = [...data.consumableCatalog]
    .sort(compareByName)
    .map((c) => {
      const used = runtime.consumables[c.id] ?? 0;
      const stowed = stowedConsumableCount(cloudStorage, c.id);
      const carried = carriedConsumableCount(c, runtime, cloudStorage);
      return (
        <div key={c.id} className="inventory-item inventory-item--controls">
          <div className="inventory-item__details">
            <AonLink href={c.url}>{c.name}</AonLink>
            {stowed > 0 ? (
              <div className="strike-traits">
                {carried} on you · {stowed} in Cloud
              </div>
            ) : null}
          </div>
          <span className="inventory-item__bulk">{formatBulkLabel(c.bulk)}</span>
          <div className="inventory-item__controls">
            <span className="inventory-item__qty">
              {carried + stowed}/{c.quantity}
            </span>
            <InventoryActionButton
              kind="single"
              label="Stow"
              title="Stow in Cloud Storage (Interact)"
              disabled={carried <= 0}
              onClick={() =>
                void save((runtime) => {
                  const cloud = normalizeCloudStorage(runtime, data.consumableCatalog);
                  const usedNow = runtime.consumables[c.id] ?? 0;
                  return {
                    cloudStorage: adjustStowedConsumable(cloud, c, usedNow, 1),
                  };
                })
              }
            />
            <InventoryActionButton
              kind="double"
              label="Get"
              title="Retrieve from Cloud Storage (2 Interact actions in play)"
              disabled={stowed <= 0}
              onClick={() =>
                void save((runtime) => {
                  const cloud = normalizeCloudStorage(runtime, data.consumableCatalog);
                  const usedNow = runtime.consumables[c.id] ?? 0;
                  return {
                    cloudStorage: adjustStowedConsumable(cloud, c, usedNow, -1),
                  };
                })
              }
            />
            <InventoryActionButton
              kind="single"
              label="Use"
              title="Use item (Interact)"
              disabled={carried <= 0}
              onClick={() =>
                void save((runtime) => {
                  const usedNow = runtime.consumables[c.id] ?? 0;
                  return {
                    consumables: { ...runtime.consumables, [c.id]: usedNow + 1 },
                  };
                })
              }
            />
            {used > 0 && (
              <button
                type="button"
                className="btn btn-icon"
                onClick={() =>
                  void save((runtime) => {
                    const currentUsed = runtime.consumables[c.id] ?? 0;
                    return {
                      consumables: {
                        ...runtime.consumables,
                        [c.id]: currentUsed - 1,
                      },
                    };
                  })
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
            <AonLink href={aonAmmunition("2-batteries")}>Battery</AonLink>
          </div>
          <span className="inventory-item__bulk">
            {formatBulkLabel(SHIM_SHAM_AMMUNITION.battery.bulk)}
          </span>
          <div className="inventory-item__controls">
            <button
              type="button"
              className="btn btn-icon"
              onClick={() => {
                void save((runtime) => {
                  const batteries = [...runtime.batteries];
                  const current = batteries[i];
                  if (!current) return {};
                  batteries[i] = { ...current, charges: Math.max(0, current.charges - 1) };
                  return { batteries };
                });
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
                void save((runtime) => {
                  const batteries = [...runtime.batteries];
                  const current = batteries[i];
                  if (!current) return {};
                  batteries[i] = {
                    ...current,
                    charges: Math.min(current.max, current.charges + 1),
                  };
                  return { batteries };
                });
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}
      <div className="inventory-item inventory-item--controls">
        <div className="inventory-item__details">
          <AonLink href={aonAmmunition("3-chem-tanks")}>
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
            onClick={() =>
              void save((runtime) => ({
                chemTankCharges: Math.max(0, runtime.chemTankCharges - 1),
              }))
            }
          >
            −
          </button>
          <span className="inventory-item__qty">{runtime.chemTankCharges}/8</span>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() =>
              void save((runtime) => ({
                chemTankCharges: Math.min(8, runtime.chemTankCharges + 1),
              }))
            }
          >
            +
          </button>
        </div>
      </div>
      <div className="inventory-item inventory-item--controls">
        <div className="inventory-item__details">
          <AonLink href={aonAmmunition("1-projectile-ammo")}>
            Projectile Ammo (spare)
          </AonLink>
        </div>
        <span className="inventory-item__bulk">
          {formatBulkLabel(SHIM_SHAM_AMMUNITION.projectile.bulk)}
        </span>
        <div className="inventory-item__controls">
          <button
            type="button"
            className="btn btn-icon"
            onClick={() =>
              void save((runtime) => ({
                projectileRounds: Math.max(0, runtime.projectileRounds - 1),
              }))
            }
          >
            −
          </button>
          <span className="inventory-item__qty">{runtime.projectileRounds}</span>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() =>
              void save((runtime) => ({
                projectileRounds: runtime.projectileRounds + 1,
              }))
            }
          >
            +
          </button>
        </div>
      </div>
      {!breachingGunInCloud ? (
        <div className="inventory-item inventory-item--controls">
          <div className="inventory-item__details">
            <AonLink href={`${AON}/equipment/weapons/52-breaching-gun`}>
              Breaching Gun magazine
            </AonLink>
          </div>
          <span className="inventory-item__bulk">
            {formatBulkLabel(SHIM_SHAM_AMMUNITION.breachingGun.bulk)}
          </span>
          <div className="inventory-item__controls">
            <button
              type="button"
              className="btn btn-icon"
              onClick={() =>
                void save((runtime) => {
                  const patch = adjustProjectileMagazine(runtime, "breachingGunMagazine", -1);
                  return patch ?? {};
                })
              }
            >
              −
            </button>
            <span className="inventory-item__qty">
              {runtime.breachingGunMagazine}/{SHIM_SHAM_AMMUNITION.breachingGun.magazineMax}
            </span>
            <button
              type="button"
              className="btn btn-icon"
              onClick={() =>
                void save((runtime) => {
                  const patch = adjustProjectileMagazine(runtime, "breachingGunMagazine", 1);
                  return patch ?? {};
                })
              }
            >
              +
            </button>
          </div>
        </div>
      ) : null}
      <div className="inventory-item inventory-item--controls">
        <div className="inventory-item__details">
          <AonLink href={`${AON}/equipment/weapons/39-crossbolter`}>
            Crossbolter magazine
          </AonLink>
        </div>
        <span className="inventory-item__bulk">
          {formatBulkLabel(SHIM_SHAM_AMMUNITION.crossbolter.bulk)}
        </span>
        <div className="inventory-item__controls">
          <button
            type="button"
            className="btn btn-icon"
            onClick={() =>
              void save((runtime) => {
                const patch = adjustProjectileMagazine(runtime, "crossbolterMagazine", -1);
                return patch ?? {};
              })
            }
          >
            −
          </button>
          <span className="inventory-item__qty">
            {runtime.crossbolterMagazine}/{SHIM_SHAM_AMMUNITION.crossbolter.magazineMax}
          </span>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() =>
              void save((runtime) => {
                const patch = adjustProjectileMagazine(runtime, "crossbolterMagazine", 1);
                return patch ?? {};
              })
            }
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
        <InventoryEquipmentItem
          key={item.id}
          item={item}
          inCloudStorage={isEquipmentInCloudStorage(cloudStorage, item.id)}
          carryLabel={
            primaryStrikeIdForInventoryItem(item.id)
              ? carryStateLabel(runtime, data.consumableCatalog, primaryStrikeIdForInventoryItem(item.id)!)
              : null
          }
          onToggleCloudStorage={() =>
            void save((runtime) => {
              const cloud = normalizeCloudStorage(runtime, data.consumableCatalog);
              const wasInCloud = isEquipmentInCloudStorage(cloud, item.id);
              const cloudStorage = toggleEquipmentInCloudStorage(cloud, item.id);
              const retrieved = wasInCloud && !isEquipmentInCloudStorage(cloudStorage, item.id);
              if (retrieved) {
                return {
                  cloudStorage,
                  ...drawStrikesForInventoryItemPatch(
                    { ...runtime, cloudStorage },
                    data.consumableCatalog,
                    item.id,
                  ),
                };
              }
              return { cloudStorage };
            })
          }
        />
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
  ].sort((a, b) => compareByName({ name: a.title }, { name: b.title }));

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
          <p className="inventory-cloud__summary">
            <AonLink href={CLOUD_STORAGE_FEAT_URL}>Cloud Storage</AonLink> ({CLOUD_STORAGE_PARTNER}
            ):{" "}
            <span className="inventory-cloud__bulk">
              {formatBulkUnits(cloudBulk)} bulk stowed
              {cloudBulkMax > 0 ? ` · ${cloudBulkMax} max` : null}
            </span>
          </p>
          <p className="inventory-cloud__note">
            Stowed gear doesn&apos;t count toward your bulk. Retrieve in play costs 2 Interact actions.
          </p>
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
          currentBulk={inventoryBulk}
          maxBulk={inventoryBulkMax}
          save={save}
        />
      </div>
    </BottomPanel>
  );
}
