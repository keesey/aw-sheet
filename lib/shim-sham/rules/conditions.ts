import type { ActiveCondition } from "@/lib/types";

type ConditionEntry = {
  id: string;
  name: string;
  url: string;
  summary: string;
  /** AoN 2e: condition always or usually includes a numeric value (e.g. Frightened 2). */
  valued?: boolean;
  maxValue?: number;
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
    valued: true,
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
    summary: "Maximum dying value reduced by this value.",
    valued: true,
  },
  {
    id: "drained",
    name: "Drained",
    url: "https://2e.aonsrd.com/conditions/10-drained",
    summary: "Penalty to Con-based rolls; reduces max HP.",
    valued: true,
  },
  {
    id: "dying",
    name: "Dying",
    url: "https://2e.aonsrd.com/conditions/11-dying",
    summary: "Unconscious; recovery checks each round. Dying 4 = death.",
    valued: true,
    maxValue: 4,
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
    summary: "Penalty to Str-based rolls equal to value.",
    valued: true,
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
    url: "https://2e.aonsrd.com/conditions/28-off-guard",
    summary: "-2 circumstance penalty to AC.",
  },
  {
    id: "frightened",
    name: "Frightened",
    url: "https://2e.aonsrd.com/conditions/18-frightened",
    summary: "Penalty to all checks equal to value.",
    valued: true,
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
    url: "https://2e.aonsrd.com/conditions/30-persistent-damage",
    summary: "Take damage each round until removed.",
  },
  {
    id: "prone",
    name: "Prone",
    url: "https://2e.aonsrd.com/conditions/32-prone",
    summary: "Lying on the ground.",
  },
  {
    id: "quickened",
    name: "Quickened",
    url: "https://2e.aonsrd.com/conditions/33-quickened",
    summary: "Extra action each turn.",
  },
  {
    id: "restrained",
    name: "Restrained",
    url: "https://2e.aonsrd.com/conditions/34-restrained",
    summary: "Grabbed plus can't move.",
  },
  {
    id: "sickened",
    name: "Sickened",
    url: "https://2e.aonsrd.com/conditions/35-sickened",
    summary: "Penalty to all checks equal to value.",
    valued: true,
  },
  {
    id: "slowed",
    name: "Slowed",
    url: "https://2e.aonsrd.com/conditions/36-slowed",
    summary: "Lose actions equal to value when you regain actions.",
    valued: true,
  },
  {
    id: "stunned",
    name: "Stunned",
    url: "https://2e.aonsrd.com/conditions/37-stunned",
    summary: "Lose actions equal to value (possibly over multiple turns).",
    valued: true,
  },
  {
    id: "stupefied",
    name: "Stupefied",
    url: "https://2e.aonsrd.com/conditions/38-stupefied",
    summary: "Penalty to mental rolls equal to value.",
    valued: true,
  },
  {
    id: "unconscious",
    name: "Unconscious",
    url: "https://2e.aonsrd.com/conditions/40-unconscious",
    summary: "Can't act, off-guard.",
  },
  {
    id: "wounded",
    name: "Wounded",
    url: "https://2e.aonsrd.com/conditions/45-wounded",
    summary: "Increases dying value when you become dying again.",
    valued: true,
  },
];

export function findCondition(id: string) {
  return CONDITIONS.find((c) => c.id === id);
}

export function isValuedCondition(id: string) {
  return findCondition(id)?.valued ?? false;
}

export function getActiveCondition(conditions: ActiveCondition[], id: string) {
  return conditions.find((c) => c.id === id);
}

export function formatActiveCondition(active: ActiveCondition) {
  const entry = findCondition(active.id);
  if (!entry) return active.id;
  if (entry.valued && active.value != null) {
    return `${entry.name} ${active.value}`;
  }
  return entry.name;
}

export function normalizeConditions(raw: unknown): ActiveCondition[] {
  if (!Array.isArray(raw)) return [];

  const normalized: ActiveCondition[] = [];

  for (const item of raw) {
    if (typeof item === "string") {
      const entry = findCondition(item);
      if (!entry) continue;
      normalized.push(entry.valued ? { id: item, value: 1 } : { id: item });
      continue;
    }

    if (!item || typeof item !== "object" || typeof item.id !== "string") {
      continue;
    }

    const entry = findCondition(item.id);
    if (!entry) continue;

    if (entry.valued) {
      const value =
        typeof item.value === "number" && item.value > 0 ? Math.floor(item.value) : 1;
      normalized.push({
        id: item.id,
        value: entry.maxValue != null ? Math.min(value, entry.maxValue) : value,
      });
    } else {
      normalized.push({ id: item.id });
    }
  }

  return normalized;
}

export function toggleCondition(conditions: ActiveCondition[], id: string): ActiveCondition[] {
  const entry = findCondition(id);
  if (!entry) return conditions;

  if (getActiveCondition(conditions, id)) {
    return conditions.filter((c) => c.id !== id);
  }

  return entry.valued
    ? [...conditions, { id, value: 1 }]
    : [...conditions, { id }];
}

export function adjustConditionValue(
  conditions: ActiveCondition[],
  id: string,
  delta: number,
): ActiveCondition[] {
  const entry = findCondition(id);
  if (!entry?.valued || delta === 0) return conditions;

  const active = getActiveCondition(conditions, id);
  if (!active) {
    if (delta < 0) return conditions;
    const value = entry.maxValue != null ? Math.min(delta, entry.maxValue) : delta;
    return value > 0 ? [...conditions, { id, value }] : conditions;
  }

  const current = active.value ?? 1;
  const next = current + delta;
  if (next <= 0) {
    return conditions.filter((c) => c.id !== id);
  }

  const value = entry.maxValue != null ? Math.min(next, entry.maxValue) : next;
  return conditions.map((c) => (c.id === id ? { id, value } : c));
}

export function removeCondition(conditions: ActiveCondition[], id: string) {
  return conditions.filter((c) => c.id !== id);
}
