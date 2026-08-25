import type { CharacterAction, LevelSnapshot, RuntimeState } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import {
  stylishCombatantApplies,
  stylishCombatantBonus,
} from "@/lib/shim-sham/stylish-combatant";
import { parseMapAttackValues, parseRollBonusString } from "../../lib/roll";
import type { StrikeDamageMode } from "../../lib/strike-format";
import type { SaveFn } from "../../types";
import { MapRollButtons } from "../MapRollButtons";
import { RollBonusButton } from "../RollBonusButton";
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
    action.id === "fly" ? (
      <span className="speed-fly-label">{action.name}</span>
    ) : action.id === "jetpack" ? (
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

  const mapValues = rollBonus ? parseMapAttackValues(rollBonus) : null;
  if (mapValues) {
    return (
      <MapRollButtons
        label={action.name}
        values={mapValues}
        className="action-name__bonus"
        combatBonus={combatBonus}
      />
    );
  }

  const numericBonus =
    (rollBonus ? parseRollBonusString(rollBonus) : 0) + combatBonus;

  return (
    <RollBonusButton label={action.name} bonus={numericBonus} className="action-name__bonus">
      {rollBonus}
      {combatBonus > 0 ? (
        <span className="action-combat-bonus"> +{combatBonus}</span>
      ) : null}
    </RollBonusButton>
  );
}

function isActionDisabled(
  action: CharacterAction,
  jetpack: boolean,
  panache: boolean,
  meyelRerollUsed: boolean,
  locks: ConditionActionLocks,
) {
  if (action.id === "fly" && !jetpack) return true;
  if (PANACHE_ACTION_IDS.has(action.id) && !panache) return true;
  if (action.id === "meyel-reroll" && meyelRerollUsed) return true;
  if (locks.disableAllActions) return true;
  if (locks.disableReaction && action.cost === "reaction") return true;
  const traits = action.traits ?? [];
  if (locks.disableMove && traits.includes("Move")) return true;
  if (locks.disableAttack && (traits.includes("Attack") || traits.includes("Finisher"))) return true;
  if (locks.disableManipulate && traits.includes("Manipulate")) return true;
  if (locks.disableConcentrate && traits.includes("Concentrate")) return true;
  return false;
}

export function ActionRow({
  action,
  combat,
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
  level,
  speedDelta = 0,
}: {
  action: CharacterAction;
  combat: boolean;
  jetpack: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks?: ConditionActionLocks;
  compact?: boolean;
  runtime?: RuntimeState;
  ffUsesLeft?: number;
  save?: SaveFn;
  onOpenStrikes?: (mode: StrikeDamageMode) => void;
  onOpenAreaWeapons?: () => void;
  level?: LevelSnapshot;
  speedDelta?: number;
}) {
  const disabled = isActionDisabled(action, jetpack, panache, meyelRerollUsed, locks);
  const rollBonus =
    compact && level ? (
      <ActionRollBonus action={action} inEncounter={combat} level={level.level} />
    ) : null;
  const control =
    compact && runtime && save && onOpenStrikes && onOpenAreaWeapons && ffUsesLeft != null ? (
      <ActionControl
        action={action}
        runtime={runtime}
        ffUsesLeft={ffUsesLeft}
        disabled={disabled}
        save={save}
        onOpenStrikes={onOpenStrikes}
        onOpenAreaWeapons={onOpenAreaWeapons}
      />
    ) : null;

  if (compact) {
    const className = `action-row action-row--compact action-row--split${disabled ? " action-row--disabled" : ""}`;
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
      <div className={className} aria-disabled={disabled || undefined}>
        <div className="action-row__main">
          {disabled ? (
            <span className="action-row__link action-row__link--disabled">{title}</span>
          ) : (
            <AonLink href={action.url} className="action-row__link">
              {title}
            </AonLink>
          )}
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
          inEncounter={combat}
          level={level?.level ?? 1}
        />
      </div>
      <ActionDescription text={action.description} />
      {action.traits && <div className="action-traits">{action.traits.join(" · ")}</div>}
    </>
  );

  const className = `action-row${disabled ? " action-row--disabled" : ""}`;

  if (disabled) {
    return (
      <div className={className} aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <AonLink href={action.url} className={className}>
      {content}
    </AonLink>
  );
}
