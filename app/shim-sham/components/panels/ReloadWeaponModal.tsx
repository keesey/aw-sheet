"use client";

import { useEffect } from "react";
import type { RuntimeState } from "@/lib/types";
import { SHIM_SHAM_CONSUMABLES } from "@/lib/shim-sham/data/inventory";
import { isBreachingGunInCloudStorage } from "@/lib/shim-sham/data/cloud-storage";
import {
  PROJECTILE_MAGAZINE_WEAPONS,
  projectileMagazineMax,
  reloadProjectileMagazine,
  type ProjectileMagazineKey,
} from "@/lib/shim-sham/rules/projectile-ammo";
import type { SaveFn } from "../../types";

export function ReloadWeaponModal({
  runtime,
  disabled,
  save,
  onClose,
}: {
  runtime: RuntimeState;
  disabled: boolean;
  save: SaveFn;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const reloadWeapon = (key: ProjectileMagazineKey) => {
    if (disabled || reloadProjectileMagazine(runtime, key) === null) return;
    void save((current) => {
      const patch = reloadProjectileMagazine(current, key);
      return patch ?? {};
    });
    onClose();
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden />
      <div className="panel-sheet reload-weapon-modal" role="dialog" aria-label="Reload weapon">
        <div className="panel-header">
          <strong>Reload</strong>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-body reload-weapon-modal__body">
          <p className="reload-weapon-modal__hint">
            Spare projectile ammo: {runtime.projectileRounds}
          </p>
          <ul className="reload-weapon-list">
            {PROJECTILE_MAGAZINE_WEAPONS.filter((weapon) => {
              if (weapon.key !== "breachingGunMagazine") return true;
              return !isBreachingGunInCloudStorage(runtime, SHIM_SHAM_CONSUMABLES);
            }).map((weapon) => {
              const max = projectileMagazineMax(weapon.key);
              const loaded = runtime[weapon.key];
              const canReload = !disabled && reloadProjectileMagazine(runtime, weapon.key) !== null;
              return (
                <li key={weapon.key}>
                  <button
                    type="button"
                    className="reload-weapon-list__item"
                    disabled={!canReload}
                    onClick={() => reloadWeapon(weapon.key)}
                  >
                    <span className="reload-weapon-list__name">{weapon.label}</span>
                    <span className="reload-weapon-list__mag">
                      {loaded}/{max}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
}
