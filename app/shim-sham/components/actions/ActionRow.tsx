import { actionEndsCover } from "@/lib/shim-sham/rules/cover";
import type { CharacterAction, LevelSnapshot, RuntimeState, WeaponStrike } from "@/lib/types";
import { SHIM_SHAM_CONSUMABLES } from "@/lib/shim-sham/data/inventory";
import {
  canDrawWeaponStrike,
  canDropWeaponStrike,
  canSheatheWeaponStrike,
  filterDrawnWeaponStrikes,
  filterQuickDrawWeaponStrikes,
} from "@/lib/shim-sham/data/weapon-carry";
import type { ConditionActionLocks } from "@/lib/shim-sham/rules/condition-effects";
import { crawlActionAvailable, escapeActionAvailable, modifiedSpeed } from "@/lib/shim-sham/rules/condition-effects";
import { getActiveCondition } from "@/lib/shim-sham/rules/conditions";
import { PAHTRA_LAND_SPEED } from "@/lib/shim-sham/data/ancestry";
import { hasFlySpeed } from "@/lib/shim-sham/rules/jetpack";
import {
  stylishCombatantApplies,
  stylishCombatantBonus,
} from "@/lib/shim-sham/rules/stylish-combatant";
import { canReloadAnyProjectileMagazine } from "@/lib/shim-sham/rules/projectile-ammo";
import { filterWeaponStrikes } from "@/lib/shim-sham/rules/strikes";
import { parseMapAttackValues, parseRollBonusString } from "@/lib/shim-sham/sheet/roll";
import type { StrikesOpenOptions } from "@/lib/shim-sham/rules/strike-open-options";
import type { SaveFn } from "../../types";
import { MapRollButtons } from "../MapRollButtons";
import { RollBonusButton } from "../RollBonusButton";
import { ActionCostIcon } from "../icons/ActionCostIcon";
import { AonLink } from "../AonLink";
import { ActionDescription } from "./ActionDescription";
import { ActionControl } from "./ActionControl";
import { ActionSpeedNote } from "./ActionSpeedNote";

const PANACHE_ACTION_IDS = new Set(["exemplary-finisher", "confident-finisher"]);
const EMPTY_LOCKS: ConditionActionLocks = {
  disableAllActions: false,
  disableMove: false,
  disableAttack: false,
  disableManipulate: false,
  disableConcentrate: false,
  disableReaction: false,
};

function isRollBonus(bonus?: string): bonus is string {
  return !!bonus && !bonus.includes("AC");
}

function ActionTitle({ action }: { action: CharacterAction }) {
  const name =
    action.id === "fly" || action.id === "maneuver-in-flight" ? (
      <span className="speed-fly-label">{action.name}</span>
    ) : action.id === "jetpack" || action.id === "dismiss-jetpack" ? (
      <span className="action-jetpack-label">{action.name}</span>
    ) : action.id === "cardiac-accelerator" ? (
      <span className="action-accelerate-label">{action.name}</span>
    ) : action.id === "force-field" ? (
      <span className="action-force-field-label">{action.name}</span>
    ) : PANACHE_ACTION_IDS.has(action.id) ? (
      <span className="speed-panache">{action.name}</span>
    ) : (
      action.name
    );

  return name;
}

function ActionRollBonus({
  action,
  inEncounter,
  level,
}: {
  action: CharacterAction;
  inEncounter: boolean;
  level: number;
}) {
  const rollBonus = isRollBonus(action.bonus) ? action.bonus : null;
  const combatBonus =
    action.combatBonus && stylishCombatantApplies(inEncounter, level)
      ? stylishCombatantBonus(level)
      : 0;

  if (!rollBonus && !combatBonus) {
    return null;
  }

  const endsCover = actionEndsCover(action);
  const mapValues = rollBonus ? parseMapAttackValues(rollBonus) : null;
  if (mapValues) {
    return (
      <MapRollButtons
        label={action.name}
        values={mapValues}
        className="action-name__bonus"
        combatBonus={combatBonus}
        endsCover={endsCover}
      />
    );
  }

  const numericBonus =
    (rollBonus ? parseRollBonusString(rollBonus) : 0) + combatBonus;

  return (
    <RollBonusButton
      label={action.name}
      bonus={numericBonus}
      className="action-name__bonus"
      endsCover={endsCover}
    >
      {rollBonus}
      {combatBonus > 0 ? (
        <span className="action-combat-bonus"> +{combatBonus}</span>
      ) : null}
    </RollBonusButton>
  );
}

function isActionHidden(
  action: CharacterAction,
  jetpack: boolean,
  panache: boolean,
  meyelRerollUsed: boolean,
  locks: ConditionActionLocks,
  characterLevel?: number,
  preparedToAid = false,
  conditions: RuntimeState["conditions"] = [],
  speedDelta = 0,
  delayed = false,
  encounter = false,
  runtime?: RuntimeState,
  weapons: WeaponStrike[] = [],
) {
  if (delayed) {
    return action.id !== "return-to-initiative";
  }

  if (action.id === "return-to-initiative") return true;
  if (action.id === "delay" && !encounter) return true;
  if (action.id === "fly" && (characterLevel == null || !hasFlySpeed(characterLevel, jetpack))) return true;
  if (
    action.id === "maneuver-in-flight" &&
    (characterLevel == null || !hasFlySpeed(characterLevel, jetpack))
  ) {
    return true;
  }
  if (action.id === "arrest-a-fall" && (characterLevel == null || !hasFlySpeed(characterLevel, jetpack))) {
    return true;
  }
  if (action.id === "aid" && !preparedToAid) return true;
  if (action.id === "jetpack" && jetpack) return true;
  if (action.id === "dismiss-jetpack" && !jetpack) return true;
  if (action.id === "drop-prone" && getActiveCondition(conditions, "prone")) return true;
  if (
    (action.id === "stand" || action.id === "kip-up") &&
    !getActiveCondition(conditions, "prone")
  ) {
    return true;
  }
  if (action.id === "step" && modifiedSpeed(PAHTRA_LAND_SPEED, speedDelta) < 10) return true;
  if (
    action.id === "crawl" &&
    !crawlActionAvailable(conditions, modifiedSpeed(PAHTRA_LAND_SPEED, speedDelta))
  ) {
    return true;
  }
  if (action.id === "escape" && !escapeActionAvailable(conditions)) return true;
  if (action.id === "retch" && !getActiveCondition(conditions, "sickened")) return true;
  if (PANACHE_ACTION_IDS.has(action.id) && !panache) return true;
  if (action.id === "meyel-reroll" && meyelRerollUsed) return true;
  if (
    action.id === "reload" &&
    (!runtime || !canReloadAnyProjectileMagazine(runtime))
  ) {
    return true;
  }
  if (action.id === "draw-weapon" && runtime) {
    if (!weapons.some((w) => canDrawWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, w.id))) {
      return true;
    }
  }
  if (action.id === "sheathe" && runtime) {
    if (!weapons.some((w) => canSheatheWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, w.id))) {
      return true;
    }
  }
  if (action.id === "drop-weapon" && runtime) {
    if (!weapons.some((w) => canDropWeaponStrike(runtime, SHIM_SHAM_CONSUMABLES, w.id))) {
      return true;
    }
  }
  if (action.id === "quick-draw" && runtime) {
    if (filterQuickDrawWeaponStrikes(weapons, runtime, SHIM_SHAM_CONSUMABLES).length === 0) {
      return true;
    }
  }
  if (
    (action.id === "strike" || action.id === "confident-finisher" || action.id === "opportune-riposte") &&
    runtime
  ) {
    const pool =
      action.id === "confident-finisher"
        ? filterWeaponStrikes(weapons, "finisher")
        : action.id === "opportune-riposte"
          ? filterWeaponStrikes(weapons, "melee")
          : weapons;
    if (filterDrawnWeaponStrikes(pool, runtime, SHIM_SHAM_CONSUMABLES).length === 0) {
      return true;
    }
  }
  const recallWhileParalyzed =
    action.id === "recall-knowledge" && getActiveCondition(conditions, "paralyzed") != null;
  if (locks.disableAllActions && !recallWhileParalyzed) return true;
  if (locks.disableReaction && action.cost === "reaction") return true;
  const traits = action.traits ?? [];
  if (locks.disableMove && traits.includes("Move") && action.id !== "crawl" && action.id !== "stand" && action.id !== "kip-up") return true;
  if (locks.disableAttack && (traits.includes("Attack") || traits.includes("Finisher")) && action.id !== "escape") {
    return true;
  }
  if (locks.disableManipulate && traits.includes("Manipulate")) return true;
  if (locks.disableConcentrate && traits.includes("Concentrate") && !recallWhileParalyzed) return true;
  return false;
}

export function ActionRow({
  action,
  encounter,
  jetpack,
  panache,
  meyelRerollUsed,
  locks = EMPTY_LOCKS,
  compact = false,
  runtime,
  ffUsesLeft,
  save,
  onOpenStrikes,
  onOpenAreaWeapons,
  athleticsBonus,
  level,
  speedDelta = 0,
  weapons = [],
}: {
  action: CharacterAction;
  encounter: boolean;
  jetpack: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks?: ConditionActionLocks;
  compact?: boolean;
  runtime?: RuntimeState;
  ffUsesLeft?: number;
  save?: SaveFn;
  onOpenStrikes?: (options: StrikesOpenOptions) => void;
  onOpenAreaWeapons?: () => void;
  athleticsBonus: number;
  level?: LevelSnapshot;
  speedDelta?: number;
  weapons?: WeaponStrike[];
}) {
  if (isActionHidden(
    action,
    jetpack,
    panache,
    meyelRerollUsed,
    locks,
    level?.level,
    runtime?.preparedToAid,
    runtime?.conditions,
    speedDelta,
    runtime?.delayed,
    encounter,
    runtime,
    weapons,
  )) {
    return null;
  }

  const rollBonus =
    compact && level ? (
      <ActionRollBonus action={action} inEncounter={encounter} level={level.level} />
    ) : null;
  const control =
    compact && runtime && save && onOpenStrikes && onOpenAreaWeapons && ffUsesLeft != null ? (
      <ActionControl
        action={action}
        runtime={runtime}
        weapons={weapons}
        ffUsesLeft={ffUsesLeft}
        disabled={false}
        save={save}
        onOpenStrikes={onOpenStrikes}
        onOpenAreaWeapons={onOpenAreaWeapons}
        athleticsBonus={athleticsBonus}
      />
    ) : null;

  if (compact) {
    const className = "action-row action-row--compact action-row--split";
    const title = <ActionTitle action={action} />;
    const speedNote =
      level && runtime ? (
        <ActionSpeedNote
          actionId={action.id}
          level={level}
          runtime={runtime}
          speedDelta={speedDelta}
        />
      ) : null;
    const aside =
      speedNote || rollBonus || control ? (
        <div className="action-row__aside">
          {speedNote}
          {rollBonus}
          {control}
        </div>
      ) : null;

    return (
      <div className={className}>
        <div className="action-row__main">
          <ActionCostIcon cost={action.cost} className="action-row__cost-icon" />
          <AonLink href={action.url} className="action-row__link">
            {title}
          </AonLink>
        </div>
        {aside}
      </div>
    );
  }

  const content = (
    <>
      <div className="action-name">
        <span className="action-name__title">
          <ActionTitle action={action} />
        </span>
        <ActionRollBonus
          action={action}
          inEncounter={encounter}
          level={level?.level ?? 1}
        />
      </div>
      <ActionDescription text={action.description} />
      {action.traits && <div className="action-traits">{action.traits.join(" · ")}</div>}
    </>
  );

  return (
    <AonLink href={action.url} className="action-row">
      {content}
    </AonLink>
  );
}
