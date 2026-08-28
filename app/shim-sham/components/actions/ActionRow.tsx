import { actionEndsCover } from "@/lib/shim-sham/cover";
import type { CharacterAction, LevelSnapshot, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { crawlActionAvailable, escapeActionAvailable, modifiedSpeed } from "@/lib/shim-sham/condition-effects";
import { getActiveCondition } from "@/lib/shim-sham/conditions";
import { PAHTRA_LAND_SPEED } from "@/lib/shim-sham/ancestry";
import { hasFlySpeed } from "@/lib/shim-sham/jetpack";
import {
  stylishCombatantApplies,
  stylishCombatantBonus,
} from "@/lib/shim-sham/stylish-combatant";
import { parseMapAttackValues, parseRollBonusString } from "@/lib/shim-sham/roll";
import type { StrikesOpenOptions } from "@/lib/shim-sham/strike-open-options";
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
  if (action.id === "stand" && !getActiveCondition(conditions, "prone")) return true;
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
  const recallWhileParalyzed =
    action.id === "recall-knowledge" && getActiveCondition(conditions, "paralyzed") != null;
  if (locks.disableAllActions && !recallWhileParalyzed) return true;
  if (locks.disableReaction && action.cost === "reaction") return true;
  const traits = action.traits ?? [];
  if (locks.disableMove && traits.includes("Move") && action.id !== "crawl" && action.id !== "stand") return true;
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
