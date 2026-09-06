import { useState } from 'react';

const MOODS = ['strategy', 'competitive', 'cooperative', 'party'];
const CONDITIONS = ['mint', 'good', 'worn', 'damaged'];

const BLANK = {
  title: '', minPlayers: 1, maxPlayers: 4, minTime: 30, maxTime: 60,
  weight: 2, mood: 'strategy', condition: 'good', estimatedValue: 0, notes: '',
};

export default function GameForm({ initial, onSubmit, onDelete }) {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const num = (k, v) => set(k, v === '' ? '' : Number(v));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      title: form.title.trim(),
      minPlayers: Number(form.minPlayers) || 1,
      maxPlayers: Math.max(Number(form.maxPlayers) || 1, Number(form.minPlayers) || 1),
      minTime: Number(form.minTime) || 0,
      maxTime: Math.max(Number(form.maxTime) || 0, Number(form.minTime) || 0),
      weight: Number(form.weight) || 1,
      estimatedValue: Number(form.estimatedValue) || 0,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="g-title">Title</label>
        <input id="g-title" required className="field" value={form.title}
          onChange={(e) => set('title', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Min players</label>
          <input type="number" min="1" className="field" value={form.minPlayers}
            onChange={(e) => num('minPlayers', e.target.value)} />
        </div>
        <div>
          <label className="label">Max players</label>
          <input type="number" min="1" className="field" value={form.maxPlayers}
            onChange={(e) => num('maxPlayers', e.target.value)} />
        </div>
        <div>
          <label className="label">Min minutes</label>
          <input type="number" min="0" step="5" className="field" value={form.minTime}
            onChange={(e) => num('minTime', e.target.value)} />
        </div>
        <div>
          <label className="label">Max minutes</label>
          <input type="number" min="0" step="5" className="field" value={form.maxTime}
            onChange={(e) => num('maxTime', e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Weight: {Number(form.weight).toFixed(1)}</label>
          <input type="range" min="1" max="5" step="0.1" className="w-full accent-brand"
            value={form.weight} onChange={(e) => num('weight', e.target.value)} />
        </div>
        <div>
          <label className="label">Est. value ($)</label>
          <input type="number" min="0" className="field" value={form.estimatedValue}
            onChange={(e) => num('estimatedValue', e.target.value)} />
        </div>
        <div>
          <label className="label">Mood</label>
          <select className="field" value={form.mood} onChange={(e) => set('mood', e.target.value)}>
            {MOODS.map((m) => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Condition</label>
          <select className="field" value={form.condition} onChange={(e) => set('condition', e.target.value)}>
            {CONDITIONS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="label">Notes</label>
        <textarea className="field" rows="2" value={form.notes}
          onChange={(e) => set('notes', e.target.value)} />
      </div>

      <div className="flex justify-between gap-2 pt-1">
        {onDelete ? (
          <button type="button" className="btn-ghost text-rose-300" onClick={onDelete}>Delete</button>
        ) : <span />}
        <button type="submit" className="btn-primary">Save game</button>
      </div>
    </form>
  );
}
