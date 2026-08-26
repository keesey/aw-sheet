/** One-sentence AoN rule summaries — see each action link for full text. */
const ACTION_DESCRIPTIONS: Record<string, string> = {
  aid: "After preparing during your turn, grant an ally a circumstance bonus on their triggering check (or penalty on a critical failure).",
  "prepare-to-aid":
    "Use an action during your turn to prepare helping an ally; you can then Aid as a reaction when they act.",
  "cardiac-accelerator":
    "Once per 10 minutes when you Climb, Stride, or Swim, increase your Speed by 20 feet for that action.",
  delay:
    "Wait for the right moment to act; you're removed from initiative until you return at the end of another creature's turn.",
  "return-to-initiative":
    "Return to the initiative order as a free action at the end of another creature's turn.",
  "exemplary-finisher": "Step as a free action immediately after a finisher.",
  "meyel-reroll":
    "The first time each day that you critically fail a saving throw, reroll it as a free action.",
  "opportune-riposte":
    "When an enemy within reach critically fails a Strike against you, Strike them or attempt to Disarm them.",
  "arrest-a-fall":
    "When you fall, attempt an Acrobatics check or Reflex save (DC typically 15) to take no damage.",
  "force-field":
    "Three times per day, activate your force field for 1 minute or until it is reduced to 0 Hit Points.",
  jetpack: "Gain a fly Speed of 20 feet for 1 minute or until you Dismiss the effect.",
  "dismiss-jetpack": "End the jetpack fly Speed effect.",
  "area-fire-grenade":
    "Hit creatures in the area with a basic Reflex save against your class DC plus the weapon's tracking value.",
  "avert-gaze":
    "Gain a +2 circumstance bonus to saves against visual abilities until the start of your next turn.",
  "confident-finisher":
    "Make a Strike that deals half your precise strike damage to the target on a failure.",
  crawl:
    "Move 5 feet by crawling and remain prone (requires you to be prone with a Speed of at least 10 feet).",
  "dirty-trick": "Attempt a Thievery check against the target's Reflex DC.",
  "drop-prone": "Fall prone.",
  "dueling-parry":
    "Gain a +2 circumstance bonus to AC until the start of your next turn while you meet the requirements.",
  escape:
    "Attempt an Acrobatics check or unarmed attack roll against an effect's Escape DC to end grabbed, immobilized, or restrained on you.",
  fly: "Move up to your fly Speed through the air.",
  grapple: "Attempt an Athletics check against the target's Fortitude DC to grab them.",
  interact:
    "Use your hands to manipulate an object or the terrain, such as drawing a weapon or opening a door.",
  "grab-an-edge":
    "When you fall past an edge, attempt an Acrobatics check or Reflex save to grab it and stop your fall.",
  "leading-dance": "Attempt a Performance check against an adjacent enemy's Will DC.",
  leap:
    "Make a short horizontal or vertical jump (requires Speed 15+ for horizontal leaps; greater distances use Athletics).",
  "baton-parry": "Gain a +1 circumstance bonus to AC until the start of your next turn.",
  perform: "Attempt a Performance check to fascinate observers.",
  "point-out":
    "Indicate an undetected creature to allies so it becomes hidden to them instead of undetected.",
  ready:
    "Prepare a single action or free action with a trigger; your turn ends, and you can use it as a reaction if the trigger occurs before your next turn.",
  "recall-knowledge":
    "Attempt a skill check to remember knowledge about a topic; ask the GM one question (DC set by the GM).",
  release:
    "Release something you're holding; unlike most Manipulate actions, this doesn't trigger reactions such as Reactive Strike.",
  retch:
    "Attempt a Fortitude save against the DC of the effect that sickened you; on a success reduce Sickened by 1 (by 2 on a critical success).",
  seek:
    "Scan an area for hidden creatures or objects; the GM rolls a secret Perception check against Stealth or detection DCs.",
  "sense-motive":
    "Assess one creature for deception; the GM rolls a secret Perception check against its Deception DC or another appropriate DC.",
  stand: "Stand up from being prone.",
  step:
    "Carefully move 5 feet using your land Speed (requires Speed 10+; doesn't trigger move reactions or work in difficult terrain).",
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
