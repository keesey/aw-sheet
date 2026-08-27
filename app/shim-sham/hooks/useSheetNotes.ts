"use client";

import { useEffect, useRef, useState } from "react";

/** Keeps session log draft in sync with server notes without clobbering in-progress edits. */
export function useSheetNotes(runtimeNotes: string | undefined) {
  const [notesDraft, setNotesDraft] = useState("");
  const notesFocused = useRef(false);
  const notesDraftRef = useRef(notesDraft);
  const runtimeNotesRef = useRef("");

  useEffect(() => {
    notesDraftRef.current = notesDraft;
  }, [notesDraft]);

  useEffect(() => {
    const nextRuntimeNotes = runtimeNotes ?? "";
    const previousRuntimeNotes = runtimeNotesRef.current;
    runtimeNotesRef.current = nextRuntimeNotes;

    if (!notesFocused.current && notesDraftRef.current === previousRuntimeNotes) {
      setNotesDraft(nextRuntimeNotes);
    }
  }, [runtimeNotes]);

  return {
    notesDraft,
    setNotesDraft,
    notesFocused,
    notesDraftRef,
    runtimeNotesRef,
  };
}
