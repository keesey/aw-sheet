/** One-sentence AoN rule summaries — see each action link for full text. */
const ACTION_DESCRIPTIONS: Record<string, string> = {
  "cardiac-accelerator":
    "Once per 10 minutes when you Climb, Stride, or Swim, increase your Speed by 20 feet for that action.",
  "exemplary-finisher": "Step as a free action immediately after a finisher.",
  "meyel-reroll":
    "The first time each day that you critically fail a saving throw, reroll it as a free action.",
  "opportune-riposte":
    "When an enemy within reach critically fails a Strike against you, Strike them or attempt to Disarm them.",
  "force-field":
    "Three times per day, activate your force field for 1 minute or until it is reduced to 0 Hit Points.",
  jetpack: "Gain a fly Speed of 20 feet for 1 minute or until you Dismiss the effect.",
  "area-fire-grenade":
    "Hit creatures in the area with a basic Reflex save against your class DC plus the weapon's tracking value.",
  "confident-finisher":
    "Make a Strike that deals half your precise strike damage to the target on a failure.",
  "dirty-trick": "Attempt a Thievery check against the target's Reflex DC.",
  "dueling-parry":
    "Gain a +2 circumstance bonus to AC until the start of your next turn while you meet the requirements.",
  fly: "Move up to your fly Speed through the air.",
  grapple: "Attempt an Athletics check against the target's Fortitude DC to grab them.",
  "leading-dance": "Attempt a Performance check against an adjacent enemy's Will DC.",
  "baton-parry": "Gain a +1 circumstance bonus to AC until the start of your next turn.",
  perform: "Attempt a Performance check to fascinate observers.",
  stride: "Move up to your Speed.",
  strike:
    "Attack with a weapon you're wielding or an unarmed attack, rolling against the target's AC.",
  "take-cover":
    "Gain standard cover (+2 AC) or greater cover (+4 AC) until you move, attack, become unconscious, or end the effect.",
  "tumble-through":
    "Stride up to your Speed and attempt an Acrobatics check to move through an enemy's space.",
};

export function actionDescription(id: string): string {
  return ACTION_DESCRIPTIONS[id] ?? "";
}
