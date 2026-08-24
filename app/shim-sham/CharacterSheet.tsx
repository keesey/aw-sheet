"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CharacterAction, CharacterSheet } from "@/lib/types";
import { CONDITIONS, findCondition } from "@/lib/shim-sham/conditions";
import {
  FORCE_FIELD_DAILY_USES,
  FORCE_FIELD_MAX_HP,
} from "@/lib/shim-sham/static";
import { getNextLevelSnapshot } from "@/lib/shim-sham/progression";

const LOCAL_KEY = "shim-sham-runtime";
const PANACHE_SPEED_BONUS = 5;
const ACCELERATE_SPEED_BONUS = 20;

type SpeedEntry = {
  label: string;
  value: number;
  panacheBoost: boolean;
  accelerateBoost: boolean;
};

function getSpeedDisplayValue(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  let total = speed.value;
  if (panache && speed.panacheBoost) total += PANACHE_SPEED_BONUS;
  if (accelerate && speed.accelerateBoost) total += ACCELERATE_SPEED_BONUS;
  return total;
}

function getSpeedClassName(speed: SpeedEntry, panache: boolean, accelerate: boolean) {
  const panacheActive = panache && speed.panacheBoost;
  const accelerateActive = accelerate && speed.accelerateBoost;
  if (panacheActive && accelerateActive) return "speed-accelerate-panache";
  if (accelerateActive) return "speed-accelerate";
  if (panacheActive) return "speed-panache";
  return undefined;
}

type Panel = "actions" | "abilities" | "inventory" | "conditions" | "manage" | null;

const PHYSICAL_ABILITIES = ["STR", "DEX", "CON"] as const;
const MENTAL_ABILITIES = ["INT", "WIS", "CHA"] as const;

function formatAbilityMod(value: number) {
  return value >= 0 ? `+${value}` : `${value}`;
}

const STRIKE_FINISHER_RE = /\s*\(\+\d+d\d+ finisher(?:,\s*([^)]+)|;\s*([^)]+))?\)/;

function formatStrikeDamage(damage: string, finisherDice: string, panache: boolean) {
  const match = damage.match(STRIKE_FINISHER_RE);
  if (!match) {
    return damage;
  }

  const base = damage.replace(STRIKE_FINISHER_RE, "").trimEnd();
  const extra = match[1] ? `, ${match[1]}` : match[2] ? `; ${match[2]}` : "";

  if (!panache) {
    return `${base}${extra}`;
  }

  return (
    <>
      {base}
      <span className="speed-panache"> (+{finisherDice} finisher)</span>
      {extra}
    </>
  );
}

async function patchSheet(body: Record<string, unknown>) {
  const res = await fetch("/api/shim-sham", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error ?? "Save failed");
  }
  return res.json() as Promise<{ sheet: CharacterSheet; kvConfigured: boolean }>;
}

function ActionTitle({ action, combat }: { action: CharacterAction; combat: boolean }) {
  const name =
    action.id === "fly" ? <span className="speed-fly-label">{action.name}</span> : action.name;

  return (
    <>
      {name}
      {action.bonus ? ` ${action.bonus}` : ""}
      {combat && action.combatBonus ? (
        <span className="action-combat-bonus"> {action.combatBonus}</span>
      ) : null}
    </>
  );
}

function SingleActionRow({
  action,
  combat,
  jetpack,
}: {
  action: CharacterAction;
  combat: boolean;
  jetpack: boolean;
}) {
  const disabled = action.id === "fly" && !jetpack;
  const content = (
    <>
      <div className="action-name">
        <ActionTitle action={action} combat={combat} />
      </div>
      <div className="action-summary">{action.summary}</div>
      {action.traits && <div className="action-summary">{action.traits.join(" · ")}</div>}
    </>
  );

  if (disabled) {
    return (
      <div className="action-row action-row--disabled" aria-disabled="true">
        {content}
      </div>
    );
  }

  return (
    <AonLink href={action.url} className="action-row">
      {content}
    </AonLink>
  );
}

function AonLink({
  href,
  children,
  className,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function BottomPanel({
  title,
  onClose,
  children,
  fullScreen = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  fullScreen?: boolean;
}) {
  return (
    <>
      <div className="panel-overlay" onClick={onClose} aria-hidden />
      <div
        className={`panel-sheet${fullScreen ? " panel-sheet--fullscreen" : ""}`}
        role="dialog"
        aria-label={title}
      >
        <div className="panel-header">
          <strong>{title}</strong>
          <button type="button" className="btn btn-icon" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="panel-body">{children}</div>
      </div>
    </>
  );
}

export default function CharacterSheet() {
  const [sheet, setSheet] = useState<CharacterSheet | null>(null);
  const [kvConfigured, setKvConfigured] = useState(true);
  const [panel, setPanel] = useState<Panel>(null);
  const [hpDeltaInput, setHpDeltaInput] = useState("");
  const [creditInput, setCreditInput] = useState("");
  const [notesDraft, setNotesDraft] = useState("");
  const notesFocused = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sheetRef = useRef<CharacterSheet | null>(null);

  useEffect(() => {
    sheetRef.current = sheet;
  }, [sheet]);

  useEffect(() => {
    if (!notesFocused.current) {
      setNotesDraft(sheet?.runtime.notes ?? "");
    }
  }, [sheet?.runtime.notes]);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/shim-sham");
      const data = await res.json();
      setKvConfigured(data.kvConfigured);
      if (!data.kvConfigured) {
        const local = localStorage.getItem(LOCAL_KEY);
        if (local) {
          const { buildCharacterSheet } = await import("@/lib/shim-sham/static");
          setSheet(buildCharacterSheet(JSON.parse(local)));
        } else {
          setSheet(data.sheet);
        }
      } else {
        setSheet(data.sheet);
      }
    } catch {
      setError("Failed to load character sheet.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (body: Record<string, unknown>) => {
      try {
        setError(null);
        const payload =
          !kvConfigured && sheetRef.current
            ? { ...sheetRef.current.runtime, ...body }
            : body;
        const data = await patchSheet(payload);
        setSheet(data.sheet);
        setKvConfigured(data.kvConfigured);
        if (!data.kvConfigured) {
          localStorage.setItem(LOCAL_KEY, JSON.stringify(data.sheet.runtime));
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    },
    [kvConfigured],
  );

  const applyHpDelta = (sign: -1 | 1, currentHp: number, forceFieldHp: number) => {
    const trimmed = hpDeltaInput.trim();
    const parsed = parseInt(trimmed, 10);
    const amount = trimmed === "" || Number.isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    void save({ action: "hp-delta", delta: sign * amount, currentHp, forceFieldHp });
    setHpDeltaInput("");
  };

  if (loading) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading Shim Sham…</p>
      </main>
    );
  }

  if (!sheet) {
    return (
      <main style={{ padding: "2rem", textAlign: "center" }}>
        <p>{error ?? "Character not found."}</p>
      </main>
    );
  }

  const { static: data, level, runtime } = sheet;
  const hpPct = Math.round((runtime.currentHp / level.maxHp) * 100);
  const ffPct = Math.round((runtime.forceFieldHp / FORCE_FIELD_MAX_HP) * 100);
  const ffUsesLeft = FORCE_FIELD_DAILY_USES - runtime.forceFieldUsesUsed;
  const nextLevel = getNextLevelSnapshot(runtime.level);

  const speedEntries: SpeedEntry[] = [
    { label: "Land", value: level.landSpeed, panacheBoost: true, accelerateBoost: true },
    level.flySpeed != null && runtime.jetpack
      ? { label: "Fly", value: level.flySpeed, panacheBoost: true, accelerateBoost: false }
      : null,
    level.climbSpeed != null
      ? { label: "Climb", value: level.climbSpeed, panacheBoost: true, accelerateBoost: true }
      : null,
    level.swimSpeed != null
      ? { label: "Swim", value: level.swimSpeed, panacheBoost: false, accelerateBoost: false }
      : null,
  ].filter((entry): entry is SpeedEntry => entry != null);

  const actionsByCost = {
    free: data.actions.filter((a) => a.cost === "free"),
    reaction: data.actions.filter((a) => a.cost === "reaction"),
    single: data.actions.filter((a) => a.cost === "single"),
    minute: data.actions.filter((a) => a.cost === "minute"),
  };

  return (
    <main className="sheet-page">
      {!kvConfigured && (
        <div className="save-banner">
          Vercel Redis not configured — saving to this browser only.
        </div>
      )}
      {error && (
        <div className="save-banner" style={{ background: "#450a0a", borderColor: "#991b1b", color: "#fecaca" }}>
          {error}
        </div>
      )}

      <header className="sheet-header">
        <div className="sheet-header-row">
          <div>
            <h1 className="sheet-title">{data.name}</h1>
            <p className="sheet-subtitle">
              “{data.nickname}” ·{" "}
              <AonLink href={data.ancestry.url}>{data.ancestry.name}</AonLink>
              {" · "}
              <AonLink href={data.background.url}>{data.background.name}</AonLink>
              {" · Level "}
              {runtime.level}{" "}
              <AonLink href={data.class.url}>{data.class.name.replace(/\d+/, "").trim()}</AonLink>
              {" · "}
              <AonLink href={data.style.url}>{data.style.name}</AonLink>
            </p>
          </div>
          <div className="sheet-header-actions">
            <button
              type="button"
              className={`btn ${runtime.accelerate ? "accelerate-on" : ""}`}
              onClick={() => void save({ accelerate: !runtime.accelerate })}
              aria-pressed={runtime.accelerate}
            >
              {runtime.accelerate ? "Accelerate ✦" : "Accelerate"}
            </button>
            <button
              type="button"
              className={`btn ${runtime.jetpack ? "jetpack-on" : ""}`}
              onClick={() => void save({ jetpack: !runtime.jetpack })}
              aria-pressed={runtime.jetpack}
            >
              {runtime.jetpack ? "Jetpack ✦" : "Jetpack"}
            </button>
            <button
              type="button"
              className={`btn ${runtime.panache ? "panache-on" : ""}`}
              onClick={() => void save({ panache: !runtime.panache })}
              aria-pressed={runtime.panache}
              disabled={!runtime.combat}
            >
              {runtime.panache ? "Panache ✦" : "Panache"}
            </button>
            <button
              type="button"
              className={`btn ${runtime.combat ? "combat-on" : ""}`}
              onClick={() => {
                const nextCombat = !runtime.combat;
                void save(nextCombat ? { combat: true } : { combat: false, panache: false });
              }}
              aria-pressed={runtime.combat}
            >
              {runtime.combat ? "Combat ✦" : "Combat"}
            </button>
          </div>
        </div>
      </header>

      <section className="sheet-content">
        <div className="sheet-column sheet-column--combat">
          <div className="stat-card sheet-hp-block">
            <span className="stat-label">Hit Points</span>
            <div className="stat-value stat-value--hp" style={{ fontSize: "2.5rem" }}>
              {runtime.currentHp}
              <span style={{ fontSize: "1.25rem", color: "var(--muted)", fontWeight: 500 }}>
                {" "}/ {level.maxHp}
              </span>
            </div>
            <div className="hp-bar">
              <div className={`hp-bar-fill ${hpPct <= 25 ? "low" : ""}`} style={{ width: `${hpPct}%` }} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
              <button type="button" className="btn btn-danger btn-icon" onClick={() => applyHpDelta(-1, runtime.currentHp, runtime.forceFieldHp)} aria-label="Apply damage">−</button>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="Amount"
                value={hpDeltaInput}
                onChange={(e) => setHpDeltaInput(e.target.value)}
                aria-label="HP change amount"
                style={{
                  flex: 1,
                  minWidth: 72,
                  minHeight: 44,
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text)",
                  padding: "0 0.75rem",
                }}
              />
              <button type="button" className="btn btn-success btn-icon" onClick={() => applyHpDelta(1, runtime.currentHp, runtime.forceFieldHp)} aria-label="Apply healing">+</button>
              <button type="button" className="btn" onClick={() => void save({ currentHp: level.maxHp })}>Full</button>
            </div>

            <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="stat-label">
                  <AonLink href="https://2e.aonsrd.com/treasure/57">Force Field</AonLink> Temp HP
                </span>
                <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {runtime.forceFieldUsesUsed}/{FORCE_FIELD_DAILY_USES} raises used
                </span>
              </div>
              <div className="stat-value stat-value--ff" style={{ fontSize: "1.75rem", color: "var(--accent)" }}>
                {runtime.forceFieldHp}
                <span style={{ fontSize: "1rem", color: "var(--muted)", fontWeight: 500 }}> / {FORCE_FIELD_MAX_HP}</span>
              </div>
              <div className="hp-bar">
                <div className="force-field-bar-fill" style={{ width: `${ffPct}%` }} />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                <button type="button" className="btn btn-primary" onClick={() => void save({ action: "activate-force-field" })} disabled={ffUsesLeft <= 0}>
                  Activate
                </button>
                <button type="button" className="btn" onClick={() => void save({ action: "force-field-regen" })} disabled={runtime.forceFieldHp <= 0 || runtime.forceFieldHp >= FORCE_FIELD_MAX_HP}>
                  +2 (turn)
                </button>
                <button type="button" className="btn btn-danger" onClick={() => void save({ action: "deactivate-force-field" })}>Deactivate</button>
              </div>
            </div>
          </div>

          <div className="sheet-grid">
            <div className="stat-card">
              <div className="stat-label">AC</div>
              <div className="stat-value">{level.ac}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.25rem" }}>
                <AonLink href={data.armor.url}>{data.armor.name}</AonLink>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Perception</div>
              <div className="stat-value">+{level.perception}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: "0.35rem", lineHeight: 1.4 }}>
                {data.senses.map((s, i) => (
                  <span key={s.name}>
                    {i > 0 && " · "}
                    <AonLink href={s.url}>{s.name}</AonLink>
                  </span>
                ))}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Class DC</div>
              <div className="stat-value">{level.classDc}</div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Fort / Ref / Will</div>
              <div className="stat-value" style={{ fontSize: "1.35rem" }}>
                +{level.fort} / +{level.reflex} / +{level.will}
              </div>
            </div>

            <div className="stat-card stat-card--wide">
              <div className="stat-label">Speed</div>
              <div style={{ fontSize: "1rem", fontWeight: 600, marginTop: "0.35rem", lineHeight: 1.5 }}>
                {speedEntries.map((speed, index) => {
                  const speedClass = getSpeedClassName(speed, runtime.panache, runtime.accelerate);
                  const displayValue = getSpeedDisplayValue(speed, runtime.panache, runtime.accelerate);
                  return (
                    <span key={speed.label}>
                      {index > 0 && " · "}
                      {speed.label === "Fly" ? (
                        <span className="speed-fly-label">{speed.label}</span>
                      ) : (
                        speed.label
                      )}{" "}
                      <span className={speedClass}>
                        {displayValue}′
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Daily</div>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                <input
                  type="checkbox"
                  checked={runtime.meyelRerollUsed}
                  onChange={(e) => void save({ meyelRerollUsed: e.target.checked })}
                />
                <AonLink href={data.heritage.url}>
                  <em>{data.heritage.name}</em> reroll used
                </AonLink>
              </label>
            </div>

            <div className="stat-card">
              <div className="stat-label">Credits</div>
              <div className="stat-value" style={{ fontSize: "1.5rem" }}>{runtime.credits.toLocaleString()}</div>
              <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
                <button type="button" className="btn btn-icon" onClick={() => void save({ credits: runtime.credits - 10 })}>−</button>
                <button type="button" className="btn btn-icon" onClick={() => void save({ credits: runtime.credits + 10 })}>+</button>
                <form
                  style={{ display: "flex", flex: 1 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    const n = parseInt(creditInput, 10);
                    if (!Number.isNaN(n)) {
                      void save({ credits: Math.max(0, runtime.credits + n) });
                      setCreditInput("");
                    }
                  }}
                >
                  <input
                    type="number"
                    placeholder="Amount"
                    value={creditInput}
                    onChange={(e) => setCreditInput(e.target.value)}
                    style={{
                      width: "100%",
                      minHeight: 44,
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--surface-2)",
                      color: "var(--text)",
                      padding: "0 0.5rem",
                    }}
                  />
                </form>
              </div>
            </div>
          </div>

          {runtime.conditions.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {runtime.conditions.map((id) => {
                const c = findCondition(id);
                return (
                  <span key={id} className="chip">
                    {c ? <AonLink href={c.url}>{c.name}</AonLink> : id}
                    <button type="button" onClick={() => void save({ conditions: runtime.conditions.filter((x) => x !== id) })} aria-label={`Remove ${c?.name ?? id}`}>×</button>
                  </span>
                );
              })}
            </div>
          )}
        </div>

        <div className="sheet-column sheet-column--strikes">
          <div className="stat-card sheet-section">
            <div className="stat-label" style={{ marginBottom: "0.5rem" }}>Strikes</div>
            {data.weapons.map((w) => (
              <div key={w.id} className="strike-entry">
                <div className="strike-header">
                  <AonLink href={w.weaponUrl ?? w.url}>{w.name}</AonLink>
                  <span className="strike-attack">{w.attack}</span>
                </div>
                <div className="strike-damage">
                  {formatStrikeDamage(w.damage, level.finisherDice, runtime.panache)}
                </div>
                <div className="strike-traits">{w.traits.join(" · ")}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="sheet-column sheet-column--skills">
          <div className="stat-card sheet-section">
            <div className="stat-label" style={{ marginBottom: "0.5rem" }}>Skills</div>
            <div className="sheet-skills-grid">
              {data.skills.map((s) => (
                <div key={s.name} style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                  <AonLink href={s.url}>{s.name}</AonLink>
                  <strong>+{s.bonus}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className="stat-card sheet-section sheet-notes-card">
            <label className="stat-label" htmlFor="sheet-notes">Notes</label>
            <textarea
              id="sheet-notes"
              className="sheet-notes"
              value={notesDraft}
              placeholder="Session notes, reminders…"
              onFocus={() => {
                notesFocused.current = true;
              }}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => {
                notesFocused.current = false;
                if (notesDraft !== (runtime.notes ?? "")) {
                  void save({ notes: notesDraft });
                }
              }}
            />
          </div>
        </div>
      </section>

      <div className="sheet-spacer" />

      <nav className="bottom-nav" aria-label="Sheet panels">
        <button type="button" className="btn" onClick={() => setPanel("actions")}>Actions</button>
        <button type="button" className="btn" onClick={() => setPanel("abilities")}>Abilities</button>
        <button type="button" className="btn" onClick={() => setPanel("inventory")}>Inventory</button>
        <button type="button" className="btn" onClick={() => setPanel("conditions")}>Conditions</button>
        <button type="button" className="btn" onClick={() => setPanel("manage")}>Rest / Level</button>
      </nav>

      {panel === "actions" && (
        <BottomPanel title="Actions" onClose={() => setPanel(null)} fullScreen>
          <div className="actions-layout">
            <div className="actions-other-column">
              <div className="action-group-title">Free Action</div>
              {actionsByCost.free.map((a) => (
                <AonLink key={a.id} href={a.url} className="action-row">
                  <div className="action-name">
                    <ActionTitle action={a} combat={runtime.combat} />
                  </div>
                  <div className="action-summary">{a.summary}</div>
                  {a.traits && <div className="action-summary">{a.traits.join(" · ")}</div>}
                </AonLink>
              ))}
              <div className="action-group-title">Reaction</div>
              {actionsByCost.reaction.map((a) => (
                <AonLink key={a.id} href={a.url} className="action-row">
                  <div className="action-name">
                    <ActionTitle action={a} combat={runtime.combat} />
                  </div>
                  <div className="action-summary">{a.summary}</div>
                  {a.traits && <div className="action-summary">{a.traits.join(" · ")}</div>}
                </AonLink>
              ))}
              <div className="action-group-title">Minute</div>
              {actionsByCost.minute.map((a) => (
                <AonLink key={a.id} href={a.url} className="action-row">
                  <div className="action-name">{a.name}</div>
                  <div className="action-summary">{a.summary}</div>
                </AonLink>
              ))}
            </div>
            <div className="actions-single-section">
              <div className="action-group-title">Single Action</div>
              <div className="actions-single-grid">
                {actionsByCost.single.map((a) => (
                  <SingleActionRow
                    key={a.id}
                    action={a}
                    combat={runtime.combat}
                    jetpack={runtime.jetpack}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
            <AonLink href={data.playbookUrl}>Combat Playbook</AonLink>
            {" · "}
            <AonLink href={data.planUrl}>Level Plan</AonLink>
          </div>
        </BottomPanel>
      )}

      {panel === "abilities" && (
        <BottomPanel title="Ability Stats" onClose={() => setPanel(null)}>
          <div className="ability-grid">
            <div className="ability-column">
              <div className="action-group-title">Physical</div>
              {PHYSICAL_ABILITIES.map((key) => (
                <div key={key} className="ability-row">
                  <span className="ability-name">{key}</span>
                  <strong className="ability-mod">{formatAbilityMod(level.abilities[key])}</strong>
                </div>
              ))}
            </div>
            <div className="ability-column">
              <div className="action-group-title">Mental</div>
              {MENTAL_ABILITIES.map((key) => (
                <div key={key} className="ability-row">
                  <span className="ability-name">{key}</span>
                  <strong className="ability-mod">{formatAbilityMod(level.abilities[key])}</strong>
                </div>
              ))}
            </div>
          </div>
        </BottomPanel>
      )}

      {panel === "inventory" && (
        <BottomPanel title="Inventory" onClose={() => setPanel(null)}>
          <div className="stat-label">Equipment</div>
          {data.inventory.map((item) => (
            <div key={item.id} style={{ padding: "0.6rem 0", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
              <span>
                {item.url ? <AonLink href={item.url}>{item.name}</AonLink> : item.name}
                {item.invested && <span style={{ color: "var(--warning)", fontSize: "0.75rem" }}> (invested)</span>}
                {item.notes && <span style={{ color: "var(--muted)", fontSize: "0.8rem" }}> — {item.notes}</span>}
              </span>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}>{item.bulk} bulk</span>
            </div>
          ))}

          <div className="action-group-title">Consumables</div>
          {data.consumableCatalog.map((c) => {
            const used = runtime.consumables[c.id] ?? 0;
            const remaining = c.quantity - used;
            return (
              <div key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0", borderBottom: "1px solid var(--border)" }}>
                <AonLink href={c.url}>{c.name}</AonLink>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "var(--muted)" }}>{remaining}/{c.quantity}</span>
                  <button type="button" className="btn btn-icon" disabled={remaining <= 0} onClick={() => void save({ consumables: { ...runtime.consumables, [c.id]: used + 1 } })}>Use</button>
                  {used > 0 && (
                    <button type="button" className="btn btn-icon" onClick={() => void save({ consumables: { ...runtime.consumables, [c.id]: used - 1 } })}>↩</button>
                  )}
                </div>
              </div>
            );
          })}

          <div className="action-group-title">Ammunition</div>
          {runtime.batteries.map((b, i) => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
              <AonLink href="https://2e.aonsrd.com/equipment/ammunition/2-batteries">Battery {i + 1}</AonLink>
              <div style={{ display: "flex", gap: "0.35rem" }}>
                <button type="button" className="btn btn-icon" onClick={() => {
                  const batteries = [...runtime.batteries];
                  batteries[i] = { ...b, charges: Math.max(0, b.charges - 1) };
                  void save({ batteries });
                }}>−</button>
                <span>{b.charges}/{b.max}</span>
                <button type="button" className="btn btn-icon" onClick={() => {
                  const batteries = [...runtime.batteries];
                  batteries[i] = { ...b, charges: Math.min(b.max, b.charges + 1) };
                  void save({ batteries });
                }}>+</button>
              </div>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0" }}>
            <AonLink href="https://2e.aonsrd.com/equipment/ammunition/3-chem-tanks">Chem Tank (pistol)</AonLink>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              <button type="button" className="btn btn-icon" onClick={() => void save({ chemTankCharges: Math.max(0, runtime.chemTankCharges - 1) })}>−</button>
              <span>{runtime.chemTankCharges}/8</span>
              <button type="button" className="btn btn-icon" onClick={() => void save({ chemTankCharges: Math.min(8, runtime.chemTankCharges + 1) })}>+</button>
            </div>
          </div>
        </BottomPanel>
      )}

      {panel === "conditions" && (
        <BottomPanel title="Conditions" onClose={() => setPanel(null)}>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 0 }}>
            Tap to apply · <AonLink href="https://2e.aonsrd.com/conditions">All conditions on AoN</AonLink>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {CONDITIONS.map((c) => {
              const active = runtime.conditions.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className="btn"
                  style={{
                    fontSize: "0.85rem",
                    background: active ? "#1e3a5f" : undefined,
                    borderColor: active ? "var(--accent)" : undefined,
                  }}
                  onClick={() => {
                    const conditions = active
                      ? runtime.conditions.filter((x) => x !== c.id)
                      : [...runtime.conditions, c.id];
                    void save({ conditions });
                  }}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </BottomPanel>
      )}

      {panel === "manage" && (
        <BottomPanel title="Rest & Level Up" onClose={() => setPanel(null)}>
          <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
            <AonLink href="https://2e.aonsrd.com/rules/492-rest-and-daily-preparations">Rest and Daily Preparations</AonLink>
          </p>
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: "100%", marginBottom: "1rem" }}
            onClick={() => {
              if (!confirm("Rest for 8 hours? Heals CON×level HP, resets daily abilities, and clears panache.")) {
                return;
              }
              void save({
                action: "rest",
                currentHp: runtime.currentHp,
                conditions: runtime.conditions,
                forceFieldUsesUsed: 0,
                forceFieldHp: 0,
                meyelRerollUsed: false,
                panache: false,
                accelerate: false,
                jetpack: false,
                combat: false,
              }).then(() => setPanel(null));
            }}
          >
            Rest (8 hours)
          </button>

          {nextLevel ? (
            <>
              <div className="stat-label">Level Up to {nextLevel.level}</div>
              <ul style={{ fontSize: "0.85rem", color: "var(--muted)", paddingLeft: "1.25rem" }}>
                <li>Max HP → {nextLevel.maxHp}</li>
                <li>AC → {nextLevel.ac}</li>
                <li>Fort/Ref/Will → +{nextLevel.fort}/+{nextLevel.reflex}/+{nextLevel.will}</li>
                {nextLevel.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <button
                type="button"
                className="btn btn-success"
                style={{ width: "100%" }}
                onClick={() => {
                  if (confirm(`Level up to ${nextLevel.level}? HP will be set to ${nextLevel.maxHp}.`)) {
                    void save({ action: "level-up" });
                  }
                }}
              >
                Level Up to {nextLevel.level}
              </button>
            </>
          ) : (
            <p>At max planned level (15).</p>
          )}

          <div style={{ marginTop: "1.5rem" }}>
            <AonLink href={data.planUrl}>View full progression plan</AonLink>
          </div>
        </BottomPanel>
      )}
    </main>
  );
}
