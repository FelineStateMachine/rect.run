# rect.run

rect.run is a daily Shikaku puzzle web app built with Fresh and Deno.

The app generates one puzzle per date from a deterministic seed, stores progress
in localStorage, and is designed for touch-first play on phones.

Core product behavior:

- one daily puzzle route per date
- deterministic generation from the date seed
- swipe/drag rectangle entry on the board
- local resume on the same device
- fixed one-screen mobile game layout
- compact clue strip for dense boards
- PWA metadata and installable web app assets

Tech stack:

- Deno 2
- Fresh
- Preact islands for board interaction
- Deno Deploy-friendly static + server-rendered app structure

Development:

```bash
deno task dev
```

Quality checks:

```bash
deno task check
deno task test
deno task build
```

Project structure:

- `routes/` page routes and API routes
- `islands/ShikakuGame.tsx` interactive game UI
- `lib/shikaku/` puzzle generation, validation, interaction helpers
- `lib/storage/` local progress persistence
- `static/` icons and web manifest
- `tests/` unit tests

Notes:

- `/d` redirects to the current available puzzle date
- `/api/puzzles/[date]` returns generated puzzle data for a date
- branding is set for deployment at `rect.run`
