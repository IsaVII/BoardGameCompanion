import express from 'express';
import cors from 'cors';
import { db } from './db.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const DOMAINS = ['collection', 'plays', 'lending', 'wishlist', 'players'];

app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Pull the whole state (client hydrates from this on another device).
app.get('/api/state', (_req, res) => {
  res.json(db.data);
});

// Last-write-wins bulk merge. No auth: this is single-user, low-stakes data
// (game titles, scores, nicknames) — see ARCHITECTURE.md.
app.post('/api/sync', async (req, res) => {
  const incoming = req.body ?? {};
  for (const domain of DOMAINS) {
    if (incoming[domain]?.entities) db.data[domain] = incoming[domain];
  }
  db.data.updatedAt = Date.now();
  await db.write();
  res.json(db.data);
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Shelf sync API on http://localhost:${port}`));
