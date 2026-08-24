# AW Sheet

Interactive character sheets for Starfinder 2e, hosted on Vercel.

## Shim Sham

Jenluwess "Shim Sham" Wivvashimmeh — Swashbuckler (Battledancer) at [`/shim-sham`](http://localhost:3000/shim-sham).

### Features

- HP / Force Field temp HP with quick damage & healing
- AC, saves, skills, weapons, senses, panache
- Actions panel (from your Notes export)
- Inventory, consumables, batteries, chem tank
- Conditions with AoN links
- Credits adjustment
- Rest (heal, reset dailies) and level-up through 15 (from your progression gist)

### Local development

Requires **Node.js 24+** (see `.nvmrc`). Uses **Yarn** for package management.

```bash
cd ~/Documents/workspace/aw-sheet
nvm use          # if using nvm
yarn install
yarn dev
```

Without Redis configured, state persists in the browser's localStorage only (banner shown at top).

### Vercel deployment

1. Push this repo to GitHub and import in [Vercel](https://vercel.com)
2. In the project **Storage** tab, add **Upstash Redis** (Marketplace)
3. Env vars are injected automatically (`KV_REST_API_URL`, `KV_REST_API_TOKEN`)
4. Deploy — the free tier is plenty for a single-user private sheet

No custom domain required; use the default `*.vercel.app` URL.

### Data sources

- `data/jenluwess-wivvashimmeh.md` — Notes export (actions, consumables)
- Paper character sheet scan
- [Level progression gist](https://gist.github.com/keesey/7ae2c20287b0555a44d3f910eecb4530)
