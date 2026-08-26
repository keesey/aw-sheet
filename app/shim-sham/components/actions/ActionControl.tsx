import type { CharacterAction, CoverLevel, RuntimeState } from "@/lib/types";
import { formatSignedBonus } from "@/lib/shim-sham/skills";
import type { StrikesOpenOptions } from "../../lib/strike-format";
import type { SaveFn } from "../../types";
import { ActionToggle } from "../ActionToggle";
import { RollBonusButton } from "../RollBonusButton";

function TakeCoverButtons({
  cover,
  disabled,
  onSelect,
}: {
  cover: CoverLevel;
  disabled: boolean;
  onSelect: (cover: CoverLevel) => void;
}) {
  return (
    <div className="action-cover-btns">
      <button
        type="button"
        className={`btn btn-icon action-cover-btn${cover === "standard" ? " action-cover-btn--active" : ""}`}
        disabled={disabled}
        aria-pressed={cover === "standard"}
        aria-label="Standard cover (+2 AC)"
        onClick={() => onSelect(cover === "standard" ? "none" : "standard")}
      >
        +2
      </button>
      <button
        type="button"
        className={`btn btn-icon action-cover-btn${cover === "greater" ? " action-cover-btn--active" : ""}`}
        disabled={disabled}
        aria-pressed={cover === "greater"}
        aria-label="Greater cover (+4 AC)"
        onClick={() => onSelect(cover === "greater" ? "none" : "greater")}
      >
        +4
      </button>
    </div>
  );
}

export function ActionControl({
  action,
  runtime,
  ffUsesLeft,
  disabled,
  save,
  onOpenStrikes,
  onOpenAreaWeapons,
  athleticsBonus,
}: {
  action: CharacterAction;
  runtime: RuntimeState;
  ffUsesLeft: number;
  disabled: boolean;
  save: SaveFn;
  onOpenStrikes: (options: StrikesOpenOptions) => void;
  onOpenAreaWeapons: () => void;
  athleticsBonus: number;
}) {
  if (!action.control) {
    return null;
  }

  const openStrikes = () => {
    if (action.id === "confident-finisher") {
      onOpenStrikes({ damageMode: "finisher", weaponFilter: "finisher" });
      return;
    }
    if (action.id === "opportune-riposte") {
      onOpenStrikes({ damageMode: "default", weaponFilter: "melee" });
      return;
    }
    onOpenStrikes({ damageMode: "default", weaponFilter: "all" });
  };

  switch (action.control) {
    case "accelerate":
      return (
        <ActionToggle
          label="Accelerate"
          checked={runtime.accelerate}
          disabled={disabled}
          onChange={(checked) => void save({ accelerate: checked })}
        />
      );
    case "meyel-reroll":
      return (
        <ActionToggle
          label="Meyel's Chosen reroll used"
          checked={runtime.meyelRerollUsed}
          disabled={disabled || runtime.meyelRerollUsed}
          onChange={(checked) => {
            if (checked) void save({ meyelRerollUsed: true });
          }}
        />
      );
    case "jetpack":
      return (
        <ActionToggle
          label="Jetpack"
          variant="jetpack"
          checked={runtime.jetpack}
          disabled={disabled}
          onChange={(checked) => void save({ jetpack: checked })}
        />
      );
    case "force-field":
      return (
        <ActionToggle
          label="Force Field active"
          variant="force-field"
          checked={runtime.forceFieldActive}
          disabled={disabled || (!runtime.forceFieldActive && ffUsesLeft <= 0)}
          onChange={(checked) => {
            if (checked) {
              void save({ action: "activate-force-field" });
            } else {
              void save({ action: "deactivate-force-field" });
            }
          }}
        />
      );
    case "dueling-parry":
      return (
        <ActionToggle
          label="Dueling Parry"
          checked={runtime.duelingParry}
          disabled={disabled}
          onChange={(checked) => void save({ duelingParry: checked })}
        />
      );
    case "baton-parry":
      return (
        <ActionToggle
          label="Baton Parry"
          checked={runtime.batonParry}
          disabled={disabled}
          onChange={(checked) => void save({ batonParry: checked })}
        />
      );
    case "take-cover":
      return (
        <TakeCoverButtons
          cover={runtime.cover}
          disabled={disabled}
          onSelect={(cover) => void save({ cover })}
        />
      );
    case "strikes":
      if (action.id === "opportune-riposte") {
        return (
          <div className="action-riposte-btns">
            <RollBonusButton
              label="Athletics"
              bonus={athleticsBonus}
              disabled={disabled}
              className="btn action-riposte-btn"
            >
              Disarm {formatSignedBonus(athleticsBonus)}
            </RollBonusButton>
            <button
              type="button"
              className="btn btn-icon action-row__icon-btn"
              disabled={disabled}
              onClick={openStrikes}
              aria-label="Open strikes"
            >
              ⚔
            </button>
          </div>
        );
      }
      return (
        <button
          type="button"
          className="btn btn-icon action-row__icon-btn"
          disabled={disabled}
          onClick={openStrikes}
          aria-label="Open strikes"
        >
          ⚔
        </button>
      );
    case "area-weapons":
      return (
        <button
          type="button"
          className="btn btn-icon action-row__icon-btn"
          disabled={disabled}
          onClick={onOpenAreaWeapons}
          aria-label="Open area weapons"
        >
          ◉
        </button>
      );
    default:
      return null;
  }
}
