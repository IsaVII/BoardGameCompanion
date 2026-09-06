# Board Game Companion — Architecture

A polished, native-feeling companion app for board game collectors. Fills the four
jobs BGG's app does poorly: **collection management**, **game night picker**,
**play logging + stats**, and **lending tracker**.

## Guiding constraints (from the brief)

- **No sensitive data.** Titles, scores, dates, player nicknames only. No auth
  provider lock-in, no location, no payment accounts.
- **Offline-first.** The app is fully usable with zero backend — state lives in
  the browser and is the source of truth. The backend is an optional sync layer.
- **Fast.** Client-side filtering/ranking, no spinners for core loops.

## Monorepo layout

```
BoardGameCompanion/
├── client/                 # React + Vite SPA (the product)
│   ├── src/
│   │   ├── app/            # store config, root providers
│   │   ├── features/       # one folder per domain (Redux slice + hooks + views)
│   │   │   ├── collection/
│   │   │   ├── picker/
│   │   │   ├── plays/
│   │   │   ├── lending/
│   │   │   └── wishlist/
│   │   ├── components/     # shared presentational components (.jsx)
│   │   ├── lib/            # pure helpers, selectors, ranking logic (.js)
│   │   ├── data/           # seed data, BGG import adapter (.js)
│   │   ├── pages/          # route-level screens (.jsx)
│   │   └── styles/
│   └── ...
└── server/                 # optional Express + lowdb sync API
    └── src/
```

### File convention: `.jsx` vs `.js`

- **`.jsx`** — anything that returns markup: components, pages, layouts.
- **`.js`** — everything else: Redux slices, selectors, ranking/stat math,
  formatters, the BGG import adapter, API client, hooks that contain no JSX.

This keeps business logic linated/testable in isolation from the view layer.

## Frontend

| Concern            | Choice                              | Why |
|--------------------|-------------------------------------|-----|
| Build              | Vite                                | fast HMR, native ESM |
| UI                 | React 18                            | — |
| State              | Redux Toolkit                       | normalized entities, predictable, devtools |
| Persistence        | `redux-persist` → `localStorage`    | offline-first, survives reload |
| Routing            | React Router v6                     | — |
| Styling            | Tailwind CSS                        | design consistency without a component lib |
| IDs                | `nanoid` (bundled with RTK)         | — |

### Redux store shape (normalized)

```
{
  collection: { ids: [], entities: { [id]: Game } },
  plays:      { ids: [], entities: { [id]: Play } },
  lending:    { ids: [], entities: { [id]: Loan } },
  wishlist:   { ids: [], entities: { [id]: WishlistItem } },
  players:    { ids: [], entities: { [id]: Player } },
  ui:         { pickerConstraints, filters }
}
```

`Game`: id, title, minPlayers, maxPlayers, minTime, maxTime, weight (1–5),
categories[], mood ('competitive'|'cooperative'|'party'|'strategy'),
condition ('mint'|'good'|'worn'|'damaged'), estimatedValue, thumbnail, bggId,
acquiredAt, notes.

### Key client logic (`src/lib/`)

- **`ranking.js`** — the game night picker. Given `{players, minutes, mood}`,
  filter the collection to games that fit, then score by fit tightness +
  play recency + weight match. Pure function, unit-testable.
- **`stats.js`** — win-rate per player per group, most-played, longest win
  streak, total hours, plays-per-month.
- **`value.js`** — collection value roll-up, condition-adjusted.
- **`bggImport.js`** — parses a BGG collection XML/CSV export into `Game[]`.
- **`lending.js`** — overdue detection (default 30-day window).

## Backend (optional sync layer — `server/`)

Thin Express REST API over `lowdb` (JSON file). Not required to run the app;
it exists so a user can sync across devices later.

```
GET/PUT /api/collection      GET/POST/PATCH/DELETE /api/plays
GET/PUT /api/wishlist        GET/POST/PATCH        /api/lending
POST    /api/sync            # last-write-wins bulk merge
```

The client talks to it through `src/lib/apiClient.js`, which is a no-op when
`VITE_API_URL` is unset. Sync is opt-in and diff-based (last-write-wins on
`updatedAt`), matching the "no sensitive data, low stakes" risk profile.

## Testing

- `lib/*` pure functions get Vitest unit tests (ranking + stats first).
- Components: React Testing Library smoke tests for the picker and play logger.

## Roadmap hooks (not in v1)

- Barcode scan (camera → UPC → metadata lookup) — `features/collection/scan`.
- BGG live import via a backend proxy (avoids CORS + rate limits).
- Shareable stats cards (render to canvas/PNG).
