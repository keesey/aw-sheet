"use client";

import type { CharacterSheet } from "@/lib/types";
import type { SaveFn } from "../../types";
import { useRoll } from "../../context/RollContext";
import { D20Icon } from "../icons/D20Icon";
import { FeatherIcon } from "../icons/FeatherIcon";
import { SleepingCatIcon } from "../icons/SleepingCatIcon";
import { AonLink } from "../AonLink";

export function SheetHeader({
  data,
  runtime,
  save,
  onRest,
}: {
  data: CharacterSheet["static"];
  runtime: CharacterSheet["runtime"];
  save: SaveFn;
  onRest: () => void;
}) {
  const { openRoll } = useRoll();

  return (
    <header className="sheet-header">
      <div className="sheet-header-row">
        <div>
          <h1 className="sheet-title">
            <span className="sheet-title-full">{data.name}</span>
            <span className="sheet-title-nickname"> “{data.nickname}”</span>
            <span className="sheet-title-mobile">{data.nickname}</span>
            <span className="sheet-title-meta">
              {" · "}
              <AonLink href={data.ancestry.url}>{data.ancestry.name}</AonLink>
              {" ("}
              <AonLink href={data.heritage.url}>{data.heritage.name}</AonLink>
              {") · "}
              <AonLink href={data.background.url}>{data.background.name}</AonLink>
              {" · "}
              <AonLink href={data.class.url}>
                {data.class.name.replace(/\d+/, "").trim()}
              </AonLink>
              {" "}
              {runtime.level}
              {" ("}
              <AonLink href={data.style.url}>{data.style.name}</AonLink>
              {")"}
            </span>
          </h1>
          <p className="sheet-flavor__line">
            <AonLink href={data.deity.url}>{data.deity.name}</AonLink>
            {" · "}
            {data.languages.map((language, index) => (
              <span key={language.url}>
                {index > 0 ? ", " : null}
                <AonLink href={language.url}>{language.name}</AonLink>
              </span>
            ))}
            {" · "}
            <AonLink href={data.homeWorld.url}>{data.homeWorld.name}</AonLink>
            {" → "}
            <AonLink href={data.portOfCall.url}>{data.portOfCall.name}</AonLink>
            {data.anathema.length > 0 ? (
              <>
                {" · "}
                <span className="sheet-flavor__label">Anathema:</span> {data.anathema.join(" ")}
              </>
            ) : null}
          </p>
        </div>
        <div className="sheet-header-actions">
          <button
            type="button"
            className={`btn btn-icon ${runtime.panache ? "panache-on" : ""}`}
            onClick={() => void save({ panache: !runtime.panache })}
            aria-pressed={runtime.panache}
            aria-label="Panache"
            disabled={!runtime.encounter}
          >
            <FeatherIcon className="feather-icon" />
          </button>
          <button
            type="button"
            className={`btn ${runtime.encounter ? "combat-on" : ""}`}
            onClick={() => {
              const nextEncounter = !runtime.encounter;
              void save(
                nextEncounter
                  ? { encounter: true }
                  : {
                      encounter: false,
                      panache: false,
                      accelerate: false,
                      duelingParry: false,
                      batonParry: false,
                      cover: "none",
                      preparedToAid: false,
                      delayed: false,
                      forceFieldActive: false,
                      forceFieldHp: 0,
                    },
              );
            }}
            aria-pressed={runtime.encounter}
          >
            Encounter
          </button>
          <button
            type="button"
            className="btn btn-icon"
            onClick={() => openRoll("Flat check", 0)}
            aria-label="Roll flat d20 check"
          >
            <D20Icon className="d20-icon" />
          </button>
          <button type="button" className="btn btn-icon" onClick={onRest} aria-label="Rest">
            <SleepingCatIcon className="sleeping-cat-icon" />
          </button>
        </div>
      </div>
    </header>
  );
}
