# AW Sheet

Interactive, iPad-friendly character sheet for **Jenluwess "Shim Sham" Wivvashimmeh** (Starfinder 2e Swashbuckler / Battledancer). Tailored to this character only — not a generic sheet.

Live: [`/shim-sham`](https://aw-sheet.vercel.app/shim-sham)

Rules reference: [Archives of Nethys (Starfinder 2e)](https://2e.aonsrd.com).

## Features

- **Combat & exploration** — Encounter / Explore modes, panache, cover, dueling/baton parry toggles
- **HP & Force Field** — damage/healing, temp HP (absorbs first), Raise (3×/day), +2 HP/turn regen
- **Stats** — attributes (with condition highlighting), AC, saves, Perception, Class DC, speeds (land, fly from jetpack, climb), senses
- **Strikes & area weapons** — level-scaling attacks, MAP, crit doubling, Deadly on crit, Zero Pistol range-increment penalties
- **Skills & actions** — AoN links, Stylish Combatant (+1 / +2 at 9+) and Continuous Flair (exploration at 11+), bravado actions
- **Conditions** — AoN-accurate effects (e.g. fatigued → AC/saves only; enfeebled/clumsy/stupefied via attribute deltas)
- **Inventory** — equipment view, consumable use tracking, batteries, chem tank, ad hoc items, bulk/encumbrance warnings
- **Progression** — level up through 15 (Levels panel: feats, class features, attribute boosts)
- **Rest** — header button; CON×level heal, reset dailies, tick doomed/drained down
- **Notes** — editable runtime notes with automatic session log entries
- **Credits** — ± adjustment

## Local development

Requires **Node.js 24+** (see `.nvmrc`). Uses **Yarn**.

```bash
cd ~/Documents/workspace/aw-sheet
nvm use          # if using nvm
yarn install
yarn dev           # → http://localhost:3000/shim-sham
yarn build         # production build
```

Copy `.env.example` to `.env.local` and set Upstash Redis vars for server-side persistence during local dev.

Without Redis configured, the API still computes state changes but only the client persists them — `localStorage` key `shim-sham-runtime`, with a yellow banner: *"Vercel Redis not configured — saving to this browser only."*

Default runtime starts at **level 6**, full HP, fresh consumables/dailies (`createDefaultRuntime` in `lib/shim-sham/static.ts`).

## Deployment

Host on **Vercel** with **Upstash Redis** (Vercel Storage / Marketplace). No custom domain required.

1. Push to GitHub and import in [Vercel](https://vercel.com)
2. Project **Storage** tab → add **Upstash Redis**
3. Env vars are injected automatically (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
4. Deploy — free tier is plenty for a single-user private sheet

## Architecture

```
Browser (CharacterSheet.tsx)
  ↕ fetch GET/PATCH /api/shim-sham
API route (app/api/shim-sham/route.ts)
  ↕ load/save RuntimeState
Upstash Redis (or localStorage fallback on client)
  +
Static data + computed level stats → buildCharacterSheet(runtime)
```

**Runtime state** (mutable): level, HP, panache, encounter/explore toggles, jetpack, parry/cover, credits, conditions, Force Field, consumables, batteries, chem tank, Meyel reroll, notes, ad hoc items.

**Static data** (in code): weapons, skills, actions, inventory, ancestry/class links.

**Computed per level** (from `progression.ts` feats/attribute boosts + rank tables): attributes (`attributes.ts`), AC (`armor.ts`), saves, Perception, Class DC, max HP, strikes, skills.

### Key paths

| Path | Purpose |
|------|---------|
| `app/shim-sham/CharacterSheet.tsx` | Main UI |
| `app/shim-sham/components/panels/` | Conditions, Inventory, Levels panels |
| `app/api/shim-sham/route.ts` | GET/PATCH API |
| `lib/shim-sham/static.ts` | Static data, default runtime, `buildCharacterSheet()` |
| `lib/shim-sham/progression.ts` | Level 1–15 feats, class features, attribute boosts |
| `lib/shim-sham/attributes.ts` | Attribute calculation (ancestry/background/class + level boosts) |
| `lib/shim-sham/condition-effects.ts` | Condition math and runtime stat overrides |
| `lib/shim-sham/conditions.ts` | Condition definitions with AoN URLs |
| `lib/kv.ts` | Upstash Redis load/save |

## Data sources

| Source | Used for |
|--------|----------|
| [Level progression gist](https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530) | `lib/shim-sham/progression.ts` (feats, boosts) |
| `lib/shim-sham/static.ts` | Actions, character identity, default runtime |
| `lib/shim-sham/inventory.ts` | Equipment and consumables |
| [Combat playbook gist](https://gist.github.com/keesey/2c6a5bb30f1ccc30e4d4b7fe3e1c7e78) | Reference only (not in UI) |
| Paper sheet (`Scoured Stars/character sheet.png`) | Reference only (not in repo) |

Gist stat blocks list attributes, Fort/Ref/Will, AC, and HP — not Perception or Class DC. The sheet calculates those from AoN rules.

## API

### `GET /api/shim-sham`

Returns `{ sheet: CharacterSheet, kvConfigured: boolean }`.

### `PATCH /api/shim-sham`

Partial runtime updates or actions:

```json
{ "panache": true }
{ "action": "hp-delta", "delta": -7 }
{ "action": "activate-force-field" }
{ "action": "deactivate-force-field" }
{ "action": "force-field-regen" }
{ "action": "rest" }
{ "action": "level-up" }
{ "credits": 1500 }
{ "conditions": [{ "id": "frightened", "value": 1 }] }
```

## Known gaps

- **Default runtime** — starts fresh at level 6 (full HP, unused consumables/dailies); not synced to in-game session state.
- **Inventory editing** — worn equipment is view-only; consumable tracking and ad hoc items only.
- **Roll engine** — no Keen Flair (19→crit on attacks) or save degree upgrades.
- **Offline** — web manifest for standalone install (`app/manifest.ts`); no service worker / offline cache.
- **Data to verify** — swim speed (35′ with panache at level 6, not in progression); rapier grade (Advanced vs commercial in inventory).
