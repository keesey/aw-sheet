"use client";

import { useEffect } from "react";
import type { RuntimeState, WeaponStrike } from "@/lib/types";
import { SHIM_SHAM_CONSUMABLES } from "@/lib/shim-sham/data/inventory";
import {
  canDrawWeaponStrike,
  canDropWeaponStrike,
  canSheatheWeaponStrike,
  drawWeaponStrikePatch,
  dropWeaponStrikePatch,
  getWeaponCarryState,
  sheatheWeaponStrikePatch,
} from "@/lib/shim-sham/data/weapon-carry";
import type { SaveFn } from "../../types";

export type WeaponCarryModalMode = "draw" | "sheathe" | "drop";

export function WeaponCarryModal({
  mode,
  weapons,
  runtime,
  disabled,
  save,
  onClose,
}: {
  mode: WeaponCarryModalMode;
  weapons: WeaponStrike[];
  runtime: RuntimeState;
  disabled: boolean;
  save: SaveFn;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const title =
    mode === "draw" ? "Draw weapon" : mode === "sheathe" ? "Sheathe weapon" : "Drop weapon";

  const eligible = weapons.filter((weapon) => {
    switch (mode) {
      case "draw":
        return canDrawWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, weapon.id);
      case "sheathe":
        return canSheatheWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, weapon.id);
      case "drop":
        return canDropWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, weapon.id);
    }
  });

  const apply = (strikeId: string) => {
    if (disabled) return;
    void save((current) => {
      const patch =
        mode === "draw"
          ? drawWeaponStrikePatch(current, SHIM_SHAM_CONSUMABLES, strikeId)
          : mode === "sheathe"
            ? sheatheWeaponStrikePatch(current, SHIM_SHAM_CONSUMABLES, strikeId)
            : dropWeaponStrikePatch(current, SHIM_SHAM_CONSUMABLES, strikeId);
      return patch ?? {};
    });
    onClose();
  };

  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden />
      <div className="panel-sheet reload-weapon-modal" role="dialog" aria-label={title}>
        <div className="panel-header">
          <strong>{title}</strong>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-body reload-weapon-modal__body">
          {eligible.length === 0 ? (
            <p className="reload-weapon-modal__hint">No weapons available.</p>
          ) : (
            <ul className="reload-weapon-list">
              {eligible.map((weapon) => {
                const state = getWeaponCarryState(runtime, SHIM_SHAM_CONSUMABLES, weapon.id);
                return (
                  <li key={weapon.id}>
                    <button
                      type="button"
                      className="reload-weapon-list__item"
                      disabled={disabled}
                      onClick={() => apply(weapon.id)}
                    >
                      <span className="reload-weapon-list__name">{weapon.name}</span>
                      <span className="reload-weapon-list__mag">
                        {state === "cloud" ? "Cloud" : state}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
