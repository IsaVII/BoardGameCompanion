# Shelf - Board Game Companion

A polished companion app for board game collectors. Does the four things the
BoardGameGeek app does poorly:

1. **Collection management** — add games or import a BGG export, track condition
   and estimated resale value, keep a wishlist.
2. **Game night picker** — enter tonight's constraints (players, time, mood,
   weight) and get an instantly filtered, ranked list from your own shelf.
3. **Play logging & stats** — quick-log a session; over time see win-rate
   leaderboards, most-played games, longest win streak, plays per month.
4. **Lending tracker** — log a game when it goes out and get a nudge if it's not
   back in 30 days.

Multi-user: sign in on any device and **share a group's shelf, plays, lending
and wishlist** with other people via invite codes. Nothing sensitive is stored —
game titles, scores, dates, nicknames.

## Stack

- **client/** — React + Vite, Redux Toolkit (normalized cache + async thunks),
  React Router, Tailwind CSS. `.jsx` = views only; `.js` = slices, selectors,
  data providers, and the ranking/stats/import logic.
- **Supabase** — Postgres + Auth (username or email + password, JWT) + Row-Level
  Security. No custom API server; the client talks to Supabase directly under RLS.
- **Local mode** — with no Supabase config the app runs fully offline against
  `localStorage`, single device, seeded with a starter shelf.

The data layer is swappable: [`client/src/lib/db/`](client/src/lib/db/) picks
`localProvider` or `supabaseProvider` at runtime based on env config, behind one
interface.

See [ARCHITECTURE.md](ARCHITECTURE.md) and [supabase/README.md](supabase/README.md).

## Run

```bash
cd client
npm install
npm run dev        # local mode, no setup
npm test           # ranking + stats + app boot (vitest)
npm run build      # production bundle
```

The dev server listens on your LAN, so `npm run dev` prints both a **Local** and a
**Network** URL (e.g. `http://192.168.0.145:5173`). Open the Network URL on a
phone or tablet on the same Wi-Fi. On first run, Windows will ask to allow Node
through the firewall — allow it for **private networks**. Supabase mode works the
same from any device since the database is hosted.

## Enable accounts + shared groups

1. Create a Supabase project.
2. Apply every file in [`supabase/migrations/`](supabase/migrations/) in order
   (`0001_init.sql`, `0002_username_login.sql`, `0003_delete_account.sql`).
3. `cp client/.env.example client/.env.local` and fill in `VITE_SUPABASE_URL`
   and `VITE_SUPABASE_ANON_KEY`.
4. `npm run dev` — now you get a login screen (username or email), a group
   switcher, invite codes, realtime sync across devices, and account deletion
   from Settings.

Full walkthrough in [supabase/README.md](supabase/README.md).

## Layout

```
client/
  src/
    app/          store, routing, providers
    pages/        one component per route (Dashboard, Collection, Picker,
                  Plays, Lending, Wishlist, Settings, Login)
    features/     Redux slices + feature UI (auth, collection, groups,
                  lending, players, plays, wishlist, ui)
    lib/db/       swappable local / supabase data providers
    components/   shared UI
    data/         seed data
supabase/
  migrations/     SQL schema, applied in order
```
