export type ConditionEntry = {
  id: string;
  name: string;
  url: string;
  summary: string;
};

/** Common conditions — full list at https://2e.aonsrd.com/conditions */
export const CONDITIONS: ConditionEntry[] = [
  {
    id: "blinded",
    name: "Blinded",
    url: "https://2e.aonsrd.com/conditions/1-blinded",
    summary: "Can't see. Immune to visual effects.",
  },
  {
    id: "clumsy",
    name: "Clumsy",
    url: "https://2e.aonsrd.com/conditions/3-clumsy",
    summary: "Penalty to Dex-based rolls equal to value.",
  },
  {
    id: "concealed",
    name: "Concealed",
    url: "https://2e.aonsrd.com/conditions/4-concealed",
    summary: "Harder to target (DC 5 flat check).",
  },
  {
    id: "confused",
    name: "Confused",
    url: "https://2e.aonsrd.com/conditions/5-confused",
    summary: "Act randomly.",
  },
  {
    id: "dazzled",
    name: "Dazzled",
    url: "https://2e.aonsrd.com/conditions/7-dazzled",
    summary: "Visual impairment.",
  },
  {
    id: "deafened",
    name: "Deafened",
    url: "https://2e.aonsrd.com/conditions/8-deafened",
    summary: "Can't hear.",
  },
  {
    id: "doomed",
    name: "Doomed",
    url: "https://2e.aonsrd.com/conditions/9-doomed",
    summary: "Closer to death.",
  },
  {
    id: "drained",
    name: "Drained",
    url: "https://2e.aonsrd.com/conditions/10-drained",
    summary: "Weakened life force.",
  },
  {
    id: "dying",
    name: "Dying",
    url: "https://2e.aonsrd.com/conditions/11-dying",
    summary: "Near death.",
  },
  {
    id: "encumbered",
    name: "Encumbered",
    url: "https://2e.aonsrd.com/conditions/12-encumbered",
    summary: "Reduced Speed, -1 to attacks and saves.",
  },
  {
    id: "enfeebled",
    name: "Enfeebled",
    url: "https://2e.aonsrd.com/conditions/13-enfeebled",
    summary: "Penalty to Str-based rolls.",
  },
  {
    id: "fascinated",
    name: "Fascinated",
    url: "https://2e.aonsrd.com/conditions/14-fascinated",
    summary: "Compelled to pay attention.",
  },
  {
    id: "fatigued",
    name: "Fatigued",
    url: "https://2e.aonsrd.com/conditions/15-fatigued",
    summary: "Can't use exploration activities requiring rest.",
  },
  {
    id: "flat-footed",
    name: "Flat-Footed",
    url: "https://2e.aonsrd.com/conditions/16-flat-footed",
    summary: "-2 AC, no Dex bonus to AC.",
  },
  {
    id: "frightened",
    name: "Frightened",
    url: "https://2e.aonsrd.com/conditions/19-frightened",
    summary: "Penalty to all checks equal to value.",
  },
  {
    id: "grabbed",
    name: "Grabbed",
    url: "https://2e.aonsrd.com/conditions/20-grabbed",
    summary: "Immobilized, flat-footed.",
  },
  {
    id: "hidden",
    name: "Hidden",
    url: "https://2e.aonsrd.com/conditions/22-hidden",
    summary: "Undetected but location known.",
  },
  {
    id: "immobilized",
    name: "Immobilized",
    url: "https://2e.aonsrd.com/conditions/24-immobilized",
    summary: "Can't move.",
  },
  {
    id: "off-guard",
    name: "Off-Guard",
    url: "https://2e.aonsrd.com/conditions/28-off-guard",
    summary: "-2 circumstance penalty to AC.",
  },
  {
    id: "paralyzed",
    name: "Paralyzed",
    url: "https://2e.aonsrd.com/conditions/29-paralyzed",
    summary: "Can't act.",
  },
  {
    id: "persistent-damage",
    name: "Persistent Damage",
    url: "https://2e.aonsrd.com/conditions/29-persistent-damage",
    summary: "Take damage each round until removed.",
  },
  {
    id: "prone",
    name: "Prone",
    url: "https://2e.aonsrd.com/conditions/31-prone",
    summary: "Lying on the ground.",
  },
  {
    id: "quickened",
    name: "Quickened",
    url: "https://2e.aonsrd.com/conditions/32-quickened",
    summary: "Extra action each turn.",
  },
  {
    id: "restrained",
    name: "Restrained",
    url: "https://2e.aonsrd.com/conditions/33-restrained",
    summary: "Grabbed plus can't move.",
  },
  {
    id: "sickened",
    name: "Sickened",
    url: "https://2e.aonsrd.com/conditions/34-sickened",
    summary: "Penalty to all checks equal to value.",
  },
  {
    id: "slowed",
    name: "Slowed",
    url: "https://2e.aonsrd.com/conditions/35-slowed",
    summary: "Fewer actions on your turn.",
  },
  {
    id: "stunned",
    name: "Stunned",
    url: "https://2e.aonsrd.com/conditions/36-stunned",
    summary: "Lose actions.",
  },
  {
    id: "stupefied",
    name: "Stupefied",
    url: "https://2e.aonsrd.com/conditions/37-stupefied",
    summary: "Penalty to mental checks.",
  },
  {
    id: "unconscious",
    name: "Unconscious",
    url: "https://2e.aonsrd.com/conditions/38-unconscious",
    summary: "Can't act, off-guard.",
  },
  {
    id: "wounded",
    name: "Wounded",
    url: "https://2e.aonsrd.com/conditions/40-wounded",
    summary: "Harder to recover from dying.",
  },
];

export function findCondition(id: string) {
  return CONDITIONS.find((c) => c.id === id);
}
