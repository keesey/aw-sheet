import type { CharacterAction } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { AonLink } from "../AonLink";
import { ActionDescription } from "./ActionDescription";

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
    ) : PANACHE_ACTION_IDS.has(action.id) ? (
      <span className="speed-panache">{action.name}</span>
    ) : (
      action.name
    );

  return name;
}

function ActionRollBonus({ action, combat }: { action: CharacterAction; combat: boolean }) {
  const rollBonus = isRollBonus(action.bonus) ? action.bonus : null;
  const combatBonus = combat && action.combatBonus ? action.combatBonus : null;

  if (!rollBonus && !combatBonus) {
    return null;
  }

  return (
    <span className="action-name__bonus">
      {rollBonus}
      {combatBonus ? <span className="action-combat-bonus"> {combatBonus}</span> : null}
    </span>
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
}: {
  action: CharacterAction;
  combat: boolean;
  jetpack: boolean;
  panache: boolean;
  meyelRerollUsed: boolean;
  locks?: ConditionActionLocks;
}) {
  const disabled = isActionDisabled(action, jetpack, panache, meyelRerollUsed, locks);
  const content = (
    <>
      <div className="action-name">
        <span className="action-name__title">
          <ActionTitle action={action} />
        </span>
        <ActionRollBonus action={action} combat={combat} />
      </div>
      <ActionDescription text={action.description} />
      {action.traits && <div className="action-traits">{action.traits.join(" · ")}</div>}
    </>
  );

  if (disabled) {
    return (
      <div className="action-row action-row--disabled" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <AonLink href={action.url} className="action-row">
      {content}
    </AonLink>
  );
}
