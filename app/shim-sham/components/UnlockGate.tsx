"use client";

import { useState, type FormEvent } from "react";
import { unlockSheetAction } from "../actions";

export function UnlockGate({ onUnlocked }: { onUnlocked: () => void }) {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await unlockSheetAction(token);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onUnlocked();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unlock failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="unlock-gate">
      <div className="unlock-gate__card">
        <h1 className="unlock-gate__title">Shim Sham</h1>
        <p className="unlock-gate__copy">
          Enter the sheet access token to load and save this character.
        </p>
        <form className="unlock-gate__form" onSubmit={(event) => void submit(event)}>
          <label className="unlock-gate__field">
            <span className="unlock-gate__label">Access token</span>
            <input
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              className="unlock-gate__input"
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="unlock-gate__error">{error}</p> : null}
          <button type="submit" className="btn unlock-gate__submit" disabled={submitting}>
            {submitting ? "Unlocking…" : "Unlock sheet"}
          </button>
        </form>
      </div>
    </main>
  );
}
