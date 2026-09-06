import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectGames } from '../lib/selectors';
import { filterCollection } from '../lib/filterCollection';
import { collectionValue, formatMoney } from '../lib/value';
import { collectionFiltersChanged, collectionFiltersReset } from '../features/ui/uiSlice';
import { gameAdded, gameUpdated, gameRemoved } from '../features/collection/collectionSlice';
import GameForm from '../features/collection/GameForm';
import ImportDialog from '../features/collection/ImportDialog';
import GameCard from '../components/GameCard';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { relativeDate } from '../lib/format';

const MOODS = ['any', 'strategy', 'competitive', 'cooperative', 'party'];

export default function CollectionPage() {
  const dispatch = useAppDispatch();
  const games = useAppSelector(selectGames);
  const filters = useAppSelector((s) => s.ui.collectionFilters);

  const [editing, setEditing] = useState(null); // game | 'new' | null
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState('');

  const shown = useMemo(() => filterCollection(games, filters), [games, filters]);
  const value = collectionValue(shown);
  const set = (patch) => dispatch(collectionFiltersChanged(patch));
  const active = filters.players || filters.maxMinutes || filters.maxWeight || filters.mood !== 'any' || filters.query;

  const flash = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">Shelf</h1>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={() => setImporting(true)}>Import from BGG</button>
          <button className="btn-primary" onClick={() => setEditing('new')}>+ Add game</button>
        </div>
      </div>

      <div className="card space-y-3">
        <input
          className="field" placeholder="Search titles…"
          value={filters.query} onChange={(e) => set({ query: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="text-xs text-slate-400">
            Players: {filters.players || 'any'}
            <input type="range" min="0" max="10" value={filters.players}
              onChange={(e) => set({ players: Number(e.target.value) })}
              className="w-full accent-brand" />
          </label>
          <label className="text-xs text-slate-400">
            Max time: {filters.maxMinutes || 'any'}
            <input type="range" min="0" max="180" step="15" value={filters.maxMinutes}
              onChange={(e) => set({ maxMinutes: Number(e.target.value) })}
              className="w-full accent-brand" />
          </label>
          <label className="text-xs text-slate-400">
            Max weight: {filters.maxWeight ? filters.maxWeight.toFixed(1) : 'any'}
            <input type="range" min="0" max="5" step="0.5" value={filters.maxWeight}
              onChange={(e) => set({ maxWeight: Number(e.target.value) })}
              className="w-full accent-brand" />
          </label>
          <label className="text-xs text-slate-400">
            Mood
            <select className="field mt-1" value={filters.mood} onChange={(e) => set({ mood: e.target.value })}>
              {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
        {active && (
          <button className="text-xs text-brand" onClick={() => dispatch(collectionFiltersReset())}>
            Clear filters
          </button>
        )}
      </div>

      <p className="text-sm text-slate-400">
        {shown.length} of {games.length} games · {formatMoney(value.resale)} resale estimate
      </p>

      {shown.length === 0 ? (
        <EmptyState
          title={games.length ? 'No games match those filters' : 'Your shelf is empty'}
          hint={games.length ? 'Try widening the constraints.' : 'Add games one at a time or import your BGG collection.'}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              onClick={() => setEditing(g)}
              footer={
                <span className="flex flex-wrap gap-1.5">
                  <span className="chip">{g.condition}</span>
                  {g.estimatedValue > 0 && <span className="chip">{formatMoney(g.estimatedValue)}</span>}
                  <span className="chip">added {relativeDate(g.acquiredAt)}</span>
                </span>
              }
            />
          ))}
        </div>
      )}

      <Modal
        open={editing === 'new'}
        onClose={() => setEditing(null)}
        title="Add a game"
      >
        <GameForm
          onSubmit={(g) => { dispatch(gameAdded(g)); setEditing(null); flash(`Added ${g.title}`); }}
        />
      </Modal>

      <Modal
        open={editing && editing !== 'new'}
        onClose={() => setEditing(null)}
        title={editing?.title ?? 'Edit game'}
      >
        {editing && editing !== 'new' && (
          <GameForm
            initial={editing}
            onSubmit={(changes) => {
              dispatch(gameUpdated({ id: editing.id, changes }));
              setEditing(null);
              flash('Saved');
            }}
            onDelete={() => {
              dispatch(gameRemoved(editing.id));
              setEditing(null);
              flash('Removed');
            }}
          />
        )}
      </Modal>

      <Modal open={importing} onClose={() => setImporting(false)} title="Import from BoardGameGeek">
        <ImportDialog onDone={(n) => { setImporting(false); flash(`Imported ${n} games`); }} />
      </Modal>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 shadow-lg sm:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}
