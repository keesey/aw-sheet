"use client";

import { useMemo, useState } from "react";
import type { AdHocInventoryItem } from "@/lib/types";
import { bulkSelectOptions } from "@/lib/shim-sham/bulk";
import type { SaveFn } from "../../types";
import { AonLink } from "../AonLink";

export function AdHocItemForm({
  items,
  maxBulk,
  save,
}: {
  items: AdHocInventoryItem[];
  maxBulk: number;
  save: SaveFn;
}) {
  const bulkOptions = useMemo(() => bulkSelectOptions(maxBulk), [maxBulk]);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [bulk, setBulk] = useState("—");
  const [error, setError] = useState<string | null>(null);

  const addItem = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Name is required.");
      return;
    }
    const trimmedLink = link.trim();
    void save({
      adHocItems: [
        ...items,
        {
          id: crypto.randomUUID(),
          name: trimmedName,
          bulk,
          ...(trimmedLink ? { url: trimmedLink } : {}),
        },
      ],
    });
    setName("");
    setLink("");
    setBulk("—");
    setError(null);
  };

  return (
    <div className="inventory-ad-hoc-footer">
      <div className="action-group-title">Add Ad Hoc Item</div>
      <form
        className="ad-hoc-form"
        onSubmit={(event) => {
          event.preventDefault();
          addItem();
        }}
      >
        <label className="ad-hoc-form__field">
          <span className="ad-hoc-form__label">Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Item name"
            className="ad-hoc-form__input"
            required
          />
        </label>
        <label className="ad-hoc-form__field">
          <span className="ad-hoc-form__label">Link</span>
          <input
            type="url"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="Optional AoN URL"
            className="ad-hoc-form__input"
          />
        </label>
        <label className="ad-hoc-form__field ad-hoc-form__field--bulk">
          <span className="ad-hoc-form__label">Bulk</span>
          <select
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            className="ad-hoc-form__input ad-hoc-form__select"
            aria-describedby="ad-hoc-bulk-help"
          >
            {bulkOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn ad-hoc-form__submit">
          Add
        </button>
        <p id="ad-hoc-bulk-help" className="ad-hoc-form__help">
          <AonLink href="https://2e.aonsrd.com/rules/179-bulk-values">Bulk values</AonLink>
          {" "}up to {maxBulk} for this character.
        </p>
        {error ? <p className="ad-hoc-form__error">{error}</p> : null}
      </form>
    </div>
  );
}
