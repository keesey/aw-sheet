# AW Sheet — Agent Handoff

*Saved when closing the Scoured Stars agent session. Use this to continue work in `~/Documents/workspace/aw-sheet`.*

## Project goal

Interactive, iPad-friendly character sheet for **Jenluwess "Shim Sham" Wivvashimmeh** (Starfinder 2e Swashbuckler / Battledancer). Tailored to this character only — not a generic sheet.

Host on **Vercel** with persistent state in **Upstash Redis** (via Vercel Storage/Marketplace). Low cost; no public domain needed.

## Current status: MVP complete

The app builds and runs. Dev server:

```bash
cd ~/Documents/workspace/aw-sheet
nvm use       # Node 24 — see .nvmrc
yarn install  # if needed
yarn dev      # → http://localhost:3000/shim-sham
```

Production build: `yarn build` (verified working).

## Key paths

| Path | Purpose |
|------|---------|
| `app/shim-sham/page.tsx` | Route entry (renders `CharacterSheet`) |
| `app/shim-sham/CharacterSheet.tsx` | Main UI — all panels and interactions |
| `app/api/shim-sham/route.ts` | GET/PATCH API for runtime state |
| `lib/shim-sham/static.ts` | Static character data + `buildCharacterSheet()` |
| `lib/shim-sham/progression.ts` | Level 1–15 stats from progression gist |
| `lib/shim-sham/stylish-combatant.ts` | Stylish Combatant / Continuous Flair bonuses |
| `lib/shim-sham/conditions.ts` | Condition list with AoN URLs |
| `lib/kv.ts` | Upstash Redis load/save |
| `lib/types.ts` | TypeScript types |
| `data/jenluwess-wivvashimmeh.md` | Notes export (source for actions/consumables) |
| `data/progression-gist-issues.md` | Gist vs AoN-calculated stat discrepancies |

## Architecture

```
Browser (CharacterSheet.tsx)
  ↕ fetch GET/PATCH /api/shim-sham
API route
  ↕ load/save RuntimeState
Upstash Redis (or localStorage fallback)
  +
Static data (static.ts + progression.ts) → merged into CharacterSheet
```

**Runtime state** (mutable): HP, panache, credits, conditions, Force Field HP/uses, consumables used, battery charges, chem tank, Meyel reroll used, level.

**Static data** (in code): weapons, skills, actions, inventory, ancestry/class links. Level-dependent stats (AC, saves, skills, strikes, max HP, speeds) are computed from `progression.ts` and rank tables via `buildCharacterSheet(runtime)`.

### Persistence fallback

If `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or Upstash equivalents) are unset:
- API still computes state changes
- Client saves `runtime` to `localStorage` key `shim-sham-runtime`
- Yellow banner: "Vercel Redis not configured — saving to this browser only."

## Data sources

1. **Paper sheet** — `Scoured Stars/character sheet.png` (not copied into repo; reference only)
2. **Notes export** — `data/jenluwess-wivvashimmeh.md`
3. **Level plan** — https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530 → `lib/shim-sham/progression.ts`
4. **Combat playbook** — https://gist.github.com/keesey/2c6a5bb30f1ccc30e4d4b7fe3e1c7e78 (not in UI)

Rules reference: [Archives of Nethys (Starfinder 2e)](https://2e.aonsrd.com). See `data/progression-gist-issues.md` where the gist diverges from AoN math.

## Implemented features

- [x] HP current/max, damage/healing, Force Field temp HP (absorbs damage first)
- [x] Force Field Raise (3×/day), +2 HP/turn, clear
- [x] AC, saves, Perception, Class DC, speeds, senses
- [x] Panache toggle, Encounter / Explore modes
- [x] Weapons & skills with AoN links; level-scaling attack/skill bonuses
- [x] Strike rolls with MAP, crit doubling, Deadly on crit
- [x] Range increment penalties (Zero Pistol)
- [x] Stylish Combatant (+1, +2 at 9+) and Continuous Flair (exploration at 11+)
- [x] Conditions with AoN-accurate effects (incl. fatigued → AC/saves only)
- [x] Bulk encumbrance and overburdened warnings
- [x] Inventory + consumables + batteries + chem tank + ad hoc items
- [x] Credits ± adjustment
- [x] Rest (direct from bottom nav; CON×level heal, reset dailies)
- [x] Level up through 15 (Levels panel; from gist)

## Bottom nav panels

Alphabetical: **Conditions**, **Inventory**, **Levels** (feats/class features + level up), **Rest** (no modal).

## Known gaps / likely next steps

1. **Initial runtime vs. Note checkboxes** — Note export shows consumables used and Force Field 2/3 raises used. App defaults to fresh-after-rest.

2. **Inventory editing** — equipment is view-only; consumable "Use" tracking and ad hoc items only.

3. **Deploy** — see `README.md`: push to GitHub → Vercel import → Upstash Redis.

4. **Offline/PWA** — not implemented.

5. **Ability scores** — shown in AbilitiesSection (from progression data).

6. **Paper vs. Note discrepancies** to verify:
   - Swim speed 35 ft at level 6 (not in progression)
   - Rapier grade (Note: Advanced)

7. **Roll engine simplifications** — no range-increment UI beyond manual +/- on ranged strikes; no Keen Flair 19→crit or save degree upgrades.

## API reference

### `GET /api/shim-sham`

Returns `{ sheet: CharacterSheet, kvConfigured: boolean }`.

### `PATCH /api/shim-sham`

Body examples:

```json
{ "panache": true }
{ "action": "hp-delta", "delta": -7 }
{ "action": "activate-force-field" }
{ "action": "rest" }
{ "action": "level-up" }
{ "credits": 1500 }
{ "conditions": ["frightened", "off-guard"] }
```

## iCloud Note access

The shared iCloud URL does **not** work for automated fetching. Use the Markdown export; copy changes into `data/jenluwess-wivvashimmeh.md` and update `lib/shim-sham/static.ts` as needed.

---

*To continue: open `~/Documents/workspace/aw-sheet` in Cursor and read this file first.*
