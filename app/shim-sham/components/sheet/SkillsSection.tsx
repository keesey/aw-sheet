"use client";

import type { MutableRefObject } from "react";
import type { CharacterSheet } from "@/lib/types";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

export function SkillsSection({
  skills,
  notesDraft,
  onNotesDraftChange,
  runtimeNotes,
  notesFocused,
  save,
}: {
  skills: CharacterSheet["static"]["skills"];
  notesDraft: string;
  onNotesDraftChange: (value: string) => void;
  runtimeNotes: string;
  notesFocused: MutableRefObject<boolean>;
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
              <strong>+{s.bonus}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="stat-card sheet-section sheet-notes-card">
        <label className="stat-label" htmlFor="sheet-notes">
          Notes
        </label>
        <textarea
          id="sheet-notes"
          className="sheet-notes"
          value={notesDraft}
          placeholder="Session notes, reminders…"
          onFocus={() => {
            notesFocused.current = true;
          }}
          onChange={(e) => onNotesDraftChange(e.target.value)}
          onBlur={() => {
            notesFocused.current = false;
            if (notesDraft !== (runtimeNotes ?? "")) {
              void save({ notes: notesDraft });
            }
          }}
        />
      </div>
    </>
  );
}
