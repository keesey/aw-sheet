"use client";

import type { MutableRefObject } from "react";
import type { CharacterSheet } from "@/lib/types";
import { formatSignedBonus } from "@/lib/shim-sham/skills";
import { statModClass } from "../../lib/format";
import type { SaveFn } from "../../types";
import { RollBonusButton } from "../RollBonusButton";
import { AonLink } from "../AonLink";

export function SkillsSection({
  skills,
  skillDelta,
  notesDraft,
  onNotesDraftChange,
  runtimeNotes,
  notesFocusedRef,
  save,
}: {
  skills: CharacterSheet["static"]["skills"];
  skillDelta: Record<string, number>;
  notesDraft: string;
  onNotesDraftChange: (value: string) => void;
  runtimeNotes: string;
  notesFocusedRef: MutableRefObject<boolean>;
  save: SaveFn;
}) {
  return (
    <>
      <div className="stat-card sheet-section">
        <div className="stat-label" style={{ marginBottom: "0.5rem" }}>
          Skills
        </div>
        <div className="sheet-skills-grid">
          {skills.map((s) => (
            <div key={s.name} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <AonLink href={s.url}>{s.name}</AonLink>
              <RollBonusButton
                label={s.name}
                bonus={s.bonus}
                className={statModClass(skillDelta[s.name] ?? 0)}
              >
                {formatSignedBonus(s.bonus)}
              </RollBonusButton>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card sheet-section sheet-notes-card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <label className="stat-label" htmlFor="sheet-session-log">
            Session Log
          </label>
          <button
            type="button"
            className="btn"
            disabled={!notesDraft}
            onClick={() => {
              if (!confirm("Clear the session log?")) {
                return;
              }
              notesFocusedRef.current = false;
              onNotesDraftChange("");
              void save({ notes: "" });
            }}
          >
            Clear
          </button>
        </div>
        <textarea
          id="sheet-session-log"
          className="sheet-notes"
          value={notesDraft}
          placeholder="Roll and event log…"
          onFocus={() => {
            notesFocusedRef.current = true;
          }}
          onChange={(e) => onNotesDraftChange(e.target.value)}
          onBlur={() => {
            notesFocusedRef.current = false;
            if (notesDraft !== (runtimeNotes ?? "")) {
              void save({ notes: notesDraft });
            }
          }}
        />
      </div>
    </>
  );
}
