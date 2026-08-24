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

Git: repo initialized at `aw-sheet/.git`, **no initial commit yet**.

## Key paths

| Path | Purpose |
|------|---------|
| `app/shim-sham/page.tsx` | Route entry (renders `CharacterSheet`) |
| `app/shim-sham/CharacterSheet.tsx` | Main UI — all panels and interactions |
| `app/api/shim-sham/route.ts` | GET/PATCH API for runtime state |
| `lib/shim-sham/static.ts` | Static character data + `buildCharacterSheet()` |
| `lib/shim-sham/progression.ts` | Level 1–15 stats from progression gist |
| `lib/shim-sham/conditions.ts` | Condition list with AoN URLs |
| `lib/kv.ts` | Upstash Redis load/save |
| `lib/types.ts` | TypeScript types |
| `data/jenluwess-wivvashimmeh.md` | Notes export (source for actions/consumables) |

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

**Runtime state** (mutable): HP, panache, credits, conditions, Force Field HP/uses, consumables used, battery charges, chem tank, Meyel reroll used, hero points, level.

**Static data** (in code): weapons, skills, actions, inventory, ancestry/class links. Level-dependent numbers (AC, saves, max HP, speeds) come from `progression.ts` via `buildCharacterSheet(runtime)`.

### Persistence fallback

If `KV_REST_API_URL` / `KV_REST_API_TOKEN` (or Upstash equivalents) are unset:
- API still computes state changes
- Client saves `runtime` to `localStorage` key `shim-sham-runtime`
- Yellow banner: "Vercel Redis not configured — saving to this browser only."

## Data sources

1. **Paper sheet** — `Scoured Stars/character sheet.png` (not copied into repo; reference only)
2. **Notes export** — `data/jenluwess-wivvashimmeh.md` (also at `Scoured Stars/Jenluwess Wivvashimmeh/Jenluwess Wivvashimmeh.md`)
3. **Level plan** — https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530 → `lib/shim-sham/progression.ts`
4. **Combat playbook** — https://gist.github.com/keesey/2c6a5bb30f1ccc30e4d4b7fe3e1c7e78 (not in UI; linked from Actions panel)

## User decisions (from conversation)

- **Access control:** User doesn't care much — no auth implemented; rely on obscure Vercel URL
- **Storage:** Upstash Redis via Vercel Marketplace (replaced deprecated `@vercel/kv` with `@upstash/redis`)
- **iCloud Note:** Could not be fetched by agent; user exported Markdown — that's the actions source
- **Playbook:** Optional; not incorporated into sheet UI (only linked)

## Implemented features

- [x] HP current/max, damage/healing, Force Field temp HP (absorbs damage first)
- [x] Force Field Raise (3×/day), +2 HP/turn, clear
- [x] AC, saves, Perception, Class DC, speeds, senses
- [x] Panache toggle
- [x] Hero points (tap dots)
- [x] Weapons & skills with AoN links
- [x] Actions panel (Free / Single / Minute from Notes)
- [x] Inventory + consumables + batteries + chem tank
- [x] Credits ± adjustment
- [x] Conditions panel (toggle common conditions, AoN links)
- [x] Rest (CON×level heal, reset dailies, clear panache/hero points/fatigued)
- [x] Level up through 15 (from gist; confirmation dialog)

## Known gaps / likely next steps

1. **Skills & weapons don't auto-update on level-up** — only AC/HP/saves/speeds from `progression.ts` change. Attack bonuses, skill ranks, new feats at higher levels are still level-6 values in `static.ts`. Update `static.ts` or add per-level overrides when leveling past 6.

2. **Initial runtime vs. Note checkboxes** — Note export shows consumables checked `[x]` (used) and Force Field 2/3 raises used. App defaults to **fresh after rest** (nothing used, full HP). Sync defaults if you want current session state instead.

3. **Inventory editing** — view-only + consumable "Use" tracking. No add/remove equipment in UI yet.

4. **Git** — init done, no commit. User rule: only commit when asked.

5. **Deploy** — not done. Steps in `README.md`: push to GitHub → Vercel import → add Upstash Redis → deploy.

6. **Offline/PWA** — not implemented.

7. **Ability scores** — not displayed on sheet (in progression data but not in UI).

8. **Paper vs. Note discrepancies** to verify:
   - Rapier: Note says **Advanced**, paper said Tactical
   - Note lists more consumables than paper sheet
   - Swim speed 35 ft at level 6

## Deploy checklist

1. `git add -A && git commit -m "..."` (when ready)
2. Create GitHub repo, push
3. Vercel → Import project
4. Storage → Add **Upstash Redis** (env vars auto-injected)
5. Deploy; open `https://<project>.vercel.app/shim-sham` on iPad

## API reference

### `GET /api/shim-sham`

Returns `{ sheet: CharacterSheet, kvConfigured: boolean }`.

### `PATCH /api/shim-sham`

Body examples:

```json
{ "panache": true }
{ "action": "hp-delta", "delta": -7 }
{ "action": "raise-force-field" }
{ "action": "force-field-regen" }
{ "action": "rest" }
{ "action": "level-up" }
{ "credits": 1500 }
{ "conditions": ["frightened", "flat-footed"] }
```

## iCloud Note access

The shared iCloud URL does **not** work for automated fetching (Apple JS shell only). Always use the Markdown export for updates; copy changes into `data/jenluwess-wivvashimmeh.md` and update `lib/shim-sham/static.ts` actions/inventory as needed.

## Related files outside this repo

- `/Users/keesey/Desktop/RPG/Scoured Stars/character sheet.png`
- `/Users/keesey/Desktop/RPG/Scoured Stars/Jenluwess Wivvashimmeh/Jenluwess Wivvashimmeh.md`

---

*To continue: open `~/Documents/workspace/aw-sheet` in Cursor and read this file first.*
