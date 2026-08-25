const AON = "https://2e.aonsrd.com";

/** Advanced Tempweave (level 3+) includes an installed jetpack. */
export const JETPACK_ARMOR_LEVEL = 3;

/** Base commercial jetpack fly Speed (Vivacious Speed applied at runtime). @see https://2e.aonsrd.com/treasure/59-jetpack */
export const COMMERCIAL_JETPACK_FLY_SPEED = 20;

export const COMMERCIAL_JETPACK = {
  name: "Jetpack (Commercial)",
  url: `${AON}/treasure/59-jetpack`,
  flySpeed: COMMERCIAL_JETPACK_FLY_SPEED,
} as const;

export function hasJetpackInstalled(level: number): boolean {
  return level >= JETPACK_ARMOR_LEVEL;
}
