import type { AttributeKey } from "@/lib/types";

type AttributeState = {
  modifiers: Record<AttributeKey, number>;
  partial: Set<AttributeKey>;
};

function zeroModifiers(): Record<AttributeKey, number> {
  return { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
}

function createState(): AttributeState {
  return { modifiers: zeroModifiers(), partial: new Set() };
}

/**
 * Apply one attribute boost.
 * @see https://2e.aonsrd.com/rules/69-step-2-start-building-attribute-modifiers
 * At +4 or higher, mark a partial boost; a later boost completes it (+1).
 */
function applyBoost(state: AttributeState, attribute: AttributeKey): void {
  const value = state.modifiers[attribute];
  if (value >= 4 && !state.partial.has(attribute)) {
    state.partial.add(attribute);
    return;
  }
  if (state.partial.has(attribute)) {
    state.modifiers[attribute] += 1;
    state.partial.delete(attribute);
    return;
  }
  state.modifiers[attribute] += 1;
}

function applyFlaw(state: AttributeState, attribute: AttributeKey): void {
  state.modifiers[attribute] -= 1;
}

/** Boosts gained at the same time — each must target a different attribute. */
function applyBoostBatch(state: AttributeState, attributes: AttributeKey[]): void {
  const unique = new Set(attributes);
  if (unique.size !== attributes.length) {
    throw new Error("Attribute boosts at the same time must target different attributes");
  }
  for (const attribute of attributes) {
    applyBoost(state, attribute);
  }
}

/** Ancestry, background, and class attribute adjustments at 1st level. */
function applyBaseBuild(state: AttributeState): void {
  // Pahtra: CHA, DEX, free (WIS), flaw CON
  applyBoost(state, "CHA");
  applyBoost(state, "DEX");
  applyBoost(state, "WIS");
  applyFlaw(state, "CON");
  // Space Pirate: STR/DEX (DEX), free (CON)
  applyBoost(state, "DEX");
  applyBoost(state, "CON");
  // Swashbuckler: key attribute DEX
  applyBoost(state, "DEX");
}

type AttributeBoostEntry = {
  level: number;
  attributeBoosts?: AttributeKey[];
};

export function attributesFromProgression(
  level: number,
  entries: AttributeBoostEntry[],
): Record<AttributeKey, number> {
  const state = createState();
  if (level >= 1) {
    applyBaseBuild(state);
  }
  for (const entry of entries) {
    if (entry.level > level || !entry.attributeBoosts) continue;
    if (entry.level === 1) {
      for (const attribute of entry.attributeBoosts) applyBoost(state, attribute);
    } else {
      applyBoostBatch(state, entry.attributeBoosts);
    }
  }
  return { ...state.modifiers };
}
