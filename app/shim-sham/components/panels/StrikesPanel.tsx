import type { CharacterSheet } from "@/lib/types";
import type { StrikeDamageMode } from "../../lib/strike-format";
import { StrikesSection } from "../sheet/StrikesSection";
import { BottomPanel } from "../BottomPanel";

export function StrikesPanel({
  weapons,
  finisherDice,
  damageMode,
  attackDelta,
  damagePenalized,
  onClose,
}: {
  weapons: CharacterSheet["static"]["weapons"];
  finisherDice: string;
  damageMode: StrikeDamageMode;
  attackDelta: number;
  damagePenalized: boolean;
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Strikes" onClose={onClose}>
      <StrikesSection
        weapons={weapons}
        finisherDice={finisherDice}
        damageMode={damageMode}
        attackDelta={attackDelta}
        damagePenalized={damagePenalized}
        embedded
      />
    </BottomPanel>
  );
}
