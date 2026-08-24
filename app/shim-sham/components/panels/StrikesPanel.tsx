import type { CharacterSheet } from "@/lib/types";
import { StrikesSection } from "../sheet/StrikesSection";
import { BottomPanel } from "../BottomPanel";

export function StrikesPanel({
  weapons,
  finisherDice,
  panache,
  attackDelta,
  damagePenalized,
  onClose,
}: {
  weapons: CharacterSheet["static"]["weapons"];
  finisherDice: string;
  panache: boolean;
  attackDelta: number;
  damagePenalized: boolean;
  onClose: () => void;
}) {
  return (
    <BottomPanel title="Strikes" onClose={onClose}>
      <StrikesSection
        weapons={weapons}
        finisherDice={finisherDice}
        panache={panache}
        attackDelta={attackDelta}
        damagePenalized={damagePenalized}
        embedded
      />
    </BottomPanel>
  );
}
