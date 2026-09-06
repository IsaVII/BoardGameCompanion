import { useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { store, persistor } from '../app/store';
import { selectPlayers, selectPlays } from '../lib/selectors';
import { playerAdded, playerRenamed, playerRemoved } from '../features/players/playersSlice';
import { syncEnabled } from '../lib/apiClient';

const DOMAINS = ['collection', 'plays', 'lending', 'wishlist', 'players'];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const players = useAppSelector(selectPlayers);
  const plays = useAppSelector(selectPlays);
  const [name, setName] = useState('');
  const fileRef = useRef(null);

  const playCount = (id) => plays.filter((p) => p.playerIds.includes(id)).length;

  const exportData = () => {
    const state = store.getState();
    const payload = Object.fromEntries(DOMAINS.map((k) => [k, state[k]]));
    const blob = new Blob([JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), state: payload }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shelf-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const parsed = JSON.parse(text);
        if (!parsed.state) throw new Error('bad file');
        localStorage.setItem(
          'persist:shelf-v1',
          JSON.stringify(Object.fromEntries(DOMAINS.map((k) => [k, JSON.stringify(parsed.state[k])]))),
        );
        window.location.reload();
      } catch {
        alert('That file could not be read as a Shelf backup.');
      }
    });
  };

  const reset = async () => {
    if (!confirm('Erase all games, plays, loans and wishlist on this device? Export a backup first if unsure.')) return;
    await persistor.purge();
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Settings</h1>

      <section className="card space-y-3">
        <h2 className="font-semibold">Players</h2>
        <ul className="space-y-2">
          {players.map((p) => (
            <li key={p.id} className="flex items-center gap-2">
              <input
                className="field" value={p.name}
                onChange={(e) => dispatch(playerRenamed({ id: p.id, changes: { name: e.target.value } }))}
              />
              <span className="shrink-0 text-xs text-slate-500">{playCount(p.id)} plays</span>
              <button className="text-xs text-rose-300" onClick={() => dispatch(playerRemoved(p.id))}>✕</button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input className="field" placeholder="New player name" value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) { dispatch(playerAdded(name.trim())); setName(''); }
            }} />
          <button className="btn-ghost" onClick={() => { if (name.trim()) { dispatch(playerAdded(name.trim())); setName(''); } }}>
            Add
          </button>
        </div>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Your data</h2>
        <p className="text-sm text-slate-400">
          Everything lives in this browser. No account, nothing sent anywhere. Back it up
          or move it to another device with a file.
        </p>
        <div className="flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={exportData}>Export backup</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>Import backup</button>
          <input ref={fileRef} type="file" accept="application/json" hidden onChange={importData} />
          <button className="btn-ghost text-rose-300" onClick={reset}>Reset everything</button>
        </div>
        <p className="text-xs text-slate-500">
          Cross-device sync: {syncEnabled ? 'configured' : 'off (set VITE_API_URL to enable the optional server)'}
        </p>
      </section>
    </div>
  );
}
