"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import type { StrikeDamageProfile } from "@/lib/types";
import { rollCheck, type RollResult } from "../lib/roll";
import type { StrikeDamageMode } from "../lib/strike-format";
import { rollStrikeAttack } from "../lib/strike-roll";
import { RollResultModal } from "../components/panels/RollResultModal";

type StrikeRollRequest = {
  label: string;
  bonus: number;
  mapIndex: number;
  damage: StrikeDamageProfile;
  damageMode: StrikeDamageMode;
};

type RollRequest =
  | { type: "check"; label: string; bonus: number }
  | ({ type: "strike" } & StrikeRollRequest);

type RollContextValue = {
  openRoll: (label: string, bonus: number) => void;
  openStrikeRoll: (request: StrikeRollRequest) => void;
};

const RollContext = createContext<RollContextValue | null>(null);

function executeRoll(request: RollRequest): RollResult {
  if (request.type === "check") {
    return rollCheck(request.label, request.bonus);
  }
  return rollStrikeAttack(
    request.label,
    request.bonus,
    request.mapIndex,
    request.damage,
    request.damageMode,
  );
}

export function RollProvider({
  children,
  onRollResult,
}: {
  children: ReactNode;
  onRollResult?: (result: RollResult) => void;
}) {
  const requestRef = useRef<RollRequest | null>(null);
  const [result, setResult] = useState<RollResult | null>(null);

  const storeRequest = useCallback(
    (request: RollRequest) => {
      requestRef.current = request;
      const next = executeRoll(request);
      setResult(next);
      onRollResult?.(next);
    },
    [onRollResult],
  );

  const openRoll = useCallback(
    (label: string, bonus: number) => {
      storeRequest({ type: "check", label, bonus });
    },
    [storeRequest],
  );

  const openStrikeRoll = useCallback(
    (strikeRequest: StrikeRollRequest) => {
      storeRequest({ type: "strike", ...strikeRequest });
    },
    [storeRequest],
  );

  const closeRoll = useCallback(() => {
    requestRef.current = null;
    setResult(null);
  }, []);

  const reroll = useCallback(() => {
    if (!requestRef.current) return;
    const next = executeRoll(requestRef.current);
    setResult(next);
    onRollResult?.(next);
  }, [onRollResult]);

  return (
    <RollContext.Provider value={{ openRoll, openStrikeRoll }}>
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
