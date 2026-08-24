import type { CharacterAction } from "@/lib/types";
import type { ConditionActionLocks } from "@/lib/shim-sham/condition-effects";
import { AonLink } from "../AonLink";

const PANACHE_ACTION_IDS = new Set(["exemplary-finisher", "confident-finisher"]);
const EMPTY_LOCKS: ConditionActionLocks = {
  disableAllActions: false,
  disableMove: false,
  disableAttack: false,
  disableManipulate: false,
  disableConcentrate: false,
  disableReaction: false,
};

function ActionTitle({ action, combat }: { action: CharacterAction; combat: boolean }) {
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

  return (
    <>
      {name}
      {action.bonus ? ` ${action.bonus}` : ""}
      {combat && action.combatBonus ? (
        <span className="action-combat-bonus"> {action.combatBonus}</span>
      ) : null}
    </>
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
        <ActionTitle action={action} combat={combat} />
      </div>
      <div className="action-summary">{action.summary}</div>
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

export function MinuteActionRow({
  action,
  locks = EMPTY_LOCKS,
}: {
  action: CharacterAction;
  locks?: ConditionActionLocks;
}) {
  const disabled = locks.disableAllActions;
  const content = (
    <>
      <div className="action-name">{action.name}</div>
      <div className="action-summary">{action.summary}</div>
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
