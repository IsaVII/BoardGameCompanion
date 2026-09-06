import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectGames, selectPlayers } from '../../lib/selectors';
import { addPlayer } from '../players/playersSlice';
import { selectActiveGroupId } from '../groups/groupsSlice';

const today = () => new Date().toISOString().slice(0, 10);

export default function PlayForm({ onSubmit }) {
  const dispatch = useAppDispatch();
  const games = useAppSelector(selectGames);
  const players = useAppSelector(selectPlayers);
  const groupId = useAppSelector(selectActiveGroupId);

  const [form, setForm] = useState({
    gameId: games[0]?.id ?? '',
    date: today(),
    minutes: 45,
    playerIds: [],
    winnerIds: [],
    cooperativeWin: false,
    notes: '',
  });
  const [newName, setNewName] = useState('');
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const toggle = (key, id) =>
    setForm((f) => {
      const has = f[key].includes(id);
      const next = has ? f[key].filter((x) => x !== id) : [...f[key], id];
      // dropping a player also drops them as a winner
      if (key === 'playerIds' && has) {
        return { ...f, playerIds: next, winnerIds: f.winnerIds.filter((x) => x !== id) };
      }
      return { ...f, [key]: next };
    });

  const addNewPlayer = async () => {
    const name = newName.trim();
    if (!name) return;
    const created = await dispatch(addPlayer({ groupId, input: { name } })).unwrap();
    setForm((f) => ({ ...f, playerIds: [...f.playerIds, created.id] }));
    setNewName('');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.gameId) return;
    onSubmit({
      ...form,
      minutes: Number(form.minutes) || 0,
      winnerIds: form.cooperativeWin ? form.playerIds : form.winnerIds,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Game</label>
          <select className="field" value={form.gameId} onChange={(e) => set('gameId', e.target.value)}>
            {games.length === 0 && <option value="">Add a game first</option>}
            {games.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="field" value={form.date} onChange={(e) => set('date', e.target.value)} />
        </div>
        <div>
          <label className="label">Minutes</label>
          <input type="number" min="0" step="5" className="field" value={form.minutes}
            onChange={(e) => set('minutes', e.target.value)} />
        </div>
      </div>

      <div>
        <span className="label">Who played</span>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => (
            <button type="button" key={p.id} onClick={() => toggle('playerIds', p.id)}
              className={`chip ${form.playerIds.includes(p.id) ? 'border-brand bg-brand/20 text-brand-soft' : ''}`}>
              {p.name}
            </button>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input className="field" placeholder="Add player…" value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewPlayer())} />
          <button type="button" className="btn-ghost" onClick={addNewPlayer}>Add</button>
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-brand" checked={form.cooperativeWin}
          onChange={(e) => set('cooperativeWin', e.target.checked)} />
        Cooperative game — everyone wins or loses together
      </label>

      {!form.cooperativeWin && (
        <div>
          <span className="label">Winner(s)</span>
          <div className="flex flex-wrap gap-2">
            {form.playerIds.length === 0 && <p className="text-xs text-slate-500">Pick players first.</p>}
            {form.playerIds.map((id) => {
              const p = players.find((x) => x.id === id);
              return (
                <button type="button" key={id} onClick={() => toggle('winnerIds', id)}
                  className={`chip ${form.winnerIds.includes(id) ? 'border-emerald-400 bg-emerald-500/20 text-emerald-200' : ''}`}>
                  {p?.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <button type="submit" className="btn-primary w-full" disabled={!form.gameId}>Log play</button>
    </form>
  );
}
