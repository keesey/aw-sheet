"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { rollCheck, type RollResult } from "../lib/roll";
import { RollResultModal } from "../components/panels/RollResultModal";

type RollContextValue = {
  openRoll: (label: string, bonus: number) => void;
};

const RollContext = createContext<RollContextValue | null>(null);

export function RollProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<RollResult | null>(null);

  const openRoll = useCallback((label: string, bonus: number) => {
    setResult(rollCheck(label, bonus));
  }, []);

  const closeRoll = useCallback(() => setResult(null), []);

  const reroll = useCallback(() => {
    setResult((current) => (current ? rollCheck(current.label, current.bonus) : null));
  }, []);

  return (
    <RollContext.Provider value={{ openRoll }}>
      {children}
      {result ? <RollResultModal result={result} onClose={closeRoll} onReroll={reroll} /> : null}
    </RollContext.Provider>
  );
}

export function useRoll(): RollContextValue {
  const context = useContext(RollContext);
  if (!context) {
    throw new Error("useRoll must be used within RollProvider");
  }
  return context;
}
