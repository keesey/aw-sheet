import type { CharacterAction } from "@/lib/types";

const AON = "https://2e.aonsrd.com";

export function buildStrikeAction(): CharacterAction {
  return {
    id: "strike",
    name: "Strike",
    cost: "single",
    description: "",
    traits: ["Attack"],
    url: `${AON}/actions/15-strike`,
    control: "strikes",
  };
}
