# Shelf — Architecture

A companion app for board game collectors. Fills the four jobs BGG's app does
poorly: **collection management**, **game night picker**, **play logging +
stats**, **lending tracker**. Multi-user: people sign in on any device and share
a group's data.

## Constraints (from the brief)

- **No sensitive data** — titles, scores, dates, nicknames. No health/finance/
  location. Auth exists only to scope data to people, not to protect secrets.
- **Fast core loops** — filtering and ranking run client-side on already-loaded
  data; no round-trip to pick a game.
- **Runnable with zero setup** — a local mode (localStorage) works with no
  backend; pointing at Supabase upgrades it to accounts + sharing.

## Layout

```
BoardGameCompanion/
├── client/                     # React + Vite SPA (the product)
│   └── src/
│       ├── app/                # store, hooks
│       ├── features/           # one folder per domain: slice (.js) + views (.jsx)
│       │   ├── auth/           # session, login bootstrap
│       │   ├── groups/         # group list, switcher, membership, data loader
│       │   ├── collection/  plays/  lending/  wishlist/  players/
│       │   └── createEntityFeature.js   # slice factory shared by the 5 domains
│       ├── components/         # shared presentational components (.jsx)
│       ├── lib/                # pure logic (.js)
│       │   ├── db/             # data provider: supabase | local, one interface
│       │   ├── ranking.js  stats.js  value.js  lending.js
│       │   ├── bggImport.js  filterCollection.js  selectors.js
│       │   └── supabase.js
│       ├── data/seed.js        # starter shelf for local mode
│       └── pages/              # route screens (.jsx)
└── supabase/
    └── migrations/0001_init.sql   # schema + RLS + signup trigger + join RPC
```

### `.jsx` vs `.js`

- **`.jsx`** — components, pages, layouts (anything returning markup).
- **`.js`** — Redux slices, async thunks, selectors, the data providers, and all
  ranking/stats/import/filter logic. Keeps domain logic testable without React.

## Data layer: one interface, two providers

`lib/db/index.js` picks a provider at load time from env config:

| Provider | When | Backing store | Accounts | Sharing |
|---|---|---|---|---|
| `localProvider` | no `VITE_SUPABASE_*` | `localStorage` | implicit single user | groups are device-local |
| `supabaseProvider` | env configured | Supabase Postgres | email + password (JWT) | real, via group membership |

Both implement the same async interface: `getSession / onAuthChange / signIn /
signUp / signOut`, `listGroups / createGroup / renameGroup / leaveGroup /
createInvite / joinGroup / listMembers`, and per-entity
`list / create / update / remove` plus `subscribe` for realtime.

Nothing above `lib/db` knows which provider is active.

## State (Redux Toolkit)

```
auth:    { user, status }                       // status gates the login screen
groups:  { list, activeId, status }             // activeId persisted to localStorage
games / plays / loans / wishlist / players:      // createEntityAdapter, one per domain
         { ids, entities, status }               // a normalized cache of the active group
ui:      { picker, collectionFilters }
```

The provider (Supabase or localStorage) is the **source of truth**; Redux is a
per-group cache, so there is no `redux-persist`.

### The five domain slices

All built by `createEntityFeature(name, { sortComparer, prepare })`, which
returns an entity adapter plus four thunks — `fetchAll(groupId)`,
`addItem({groupId, input})`, `editItem({groupId, id, changes})`,
`removeItem({groupId, id})` — wired to the active provider. `prepare` fills
domain defaults on create.

### Data lifecycle

- `useAuthBootstrap()` — loads the session once, subscribes to auth changes.
- `useGroupData()` — when signed in, loads the group list; whenever `activeId`
  changes, refetches all five domains and opens a realtime subscription that
  refetches on any change to that group's rows.

## Database (Supabase)

Domain tables share a shape: scoping columns + a `data jsonb` payload for the
rest (filtering is client-side on small data, so per-field columns aren't worth
the migration weight). The client works with a flattened `{ id, ...data }`.

```
profiles(id=auth.uid, display_name)
groups(id, name, created_by)
group_members(group_id, user_id, role)          -- 'owner' | 'member'
group_invites(id, group_id, code, expires_at)
games | players | plays | loans | wishlist
  (id, group_id, data jsonb, created_by, created_at, updated_at)
```

**RLS** — every domain policy is `is_group_member(group_id)`; a user can read or
write a row only in a group they belong to. **Signup trigger** creates a profile,
a personal "My Shelf" group, and an owner membership. **`join_group_with_code()`**
is a `SECURITY DEFINER` RPC that adds the caller to a group from an invite code.
Realtime is enabled on the domain tables + `group_members`.

No custom API server: RLS lets the client talk to Supabase directly.

## Key client logic (`lib/`)

- **`ranking.js`** — game night picker: filter the shelf to what fits
  `{players, minutes, mood, maxWeight}`, then score by player fit, time fit, and
  play recency. Pure, unit-tested.
- **`stats.js`** — competitive win-rate leaderboard, most-played, longest win
  streak, plays per month. Pure, unit-tested.
- **`filterCollection.js`** — the "filter by players / length / weight / mood"
  use case from the App Store reviews.
- **`value.js`** — condition-adjusted collection value for the resale angle.
- **`bggImport.js`** — parses a BGG CSV or XML collection export in the browser.

## Testing (Vitest)

- `lib/ranking`, `lib/stats` — pure-function unit tests.
- `app/App.test.jsx` — renders the app in local mode and asserts the full
  boot path (auth → groups → entity fetch → dashboard).

## Roadmap hooks

- Barcode scan → UPC lookup (`features/collection/scan`).
- Owner-only member management UI (remove members, transfer ownership).
- Shareable stat cards rendered to PNG.
- Optimistic writes (currently thunks refetch-on-write via realtime).
