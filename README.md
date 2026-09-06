# Shelf — Board Game Companion

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

Offline-first: all data lives in your browser. No account, no sensitive data.

## Stack

- **client/** — React + Vite, Redux Toolkit, redux-persist, React Router,
  Tailwind CSS. JSX files are views only; `.js` files hold slices, selectors and
  the ranking/stats/import logic. See [ARCHITECTURE.md](ARCHITECTURE.md).
- **server/** — optional Express + lowdb sync API. Not needed to run the app.

## Run

```bash
cd client
npm install
npm run dev        # http://localhost:5173
npm test           # ranking + stats unit tests
```

Optional sync server:

```bash
cd server
npm install
npm start          # http://localhost:4000
# then run the client with VITE_API_URL=http://localhost:4000
```
