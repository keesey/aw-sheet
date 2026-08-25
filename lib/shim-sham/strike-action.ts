import type { CharacterAction } from "@/lib/types";
import { actionDescription } from "@/lib/shim-sham/action-descriptions";

const AON = "https://2e.aonsrd.com";

export function buildStrikeAction(): CharacterAction {
  return {
    id: "strike",
    name: "Strike",
    cost: "single",
    description: actionDescription("strike"),
    traits: ["Attack"],
    url: `${AON}/actions/15-strike`,
    control: "strikes",
  };
}
