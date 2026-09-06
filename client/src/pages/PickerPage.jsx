import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { pickerChanged } from '../features/ui/uiSlice';
import { selectGames, selectPlays } from '../lib/selectors';
import { rankGames } from '../lib/ranking';
import GameCard from '../components/GameCard';
import EmptyState from '../components/EmptyState';

const MOODS = ['any', 'strategy', 'competitive', 'cooperative', 'party'];

export default function PickerPage() {
  const dispatch = useAppDispatch();
  const picker = useAppSelector((s) => s.ui.picker);
  const games = useAppSelector(selectGames);
  const plays = useAppSelector(selectPlays);

  const ranked = useMemo(
    () => rankGames(games, picker, plays),
    [games, picker, plays],
  );

  const set = (patch) => dispatch(pickerChanged(patch));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Tonight</h1>

      <div className="card space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="players">Players: {picker.players}</label>
            <input
              id="players" type="range" min="1" max="10" value={picker.players}
              onChange={(e) => set({ players: Number(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>
          <div>
            <label className="label" htmlFor="minutes">Time: {picker.minutes} min</label>
            <input
              id="minutes" type="range" min="15" max="180" step="15" value={picker.minutes}
              onChange={(e) => set({ minutes: Number(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="mood">Mood</label>
            <select id="mood" className="field" value={picker.mood} onChange={(e) => set({ mood: e.target.value })}>
              {MOODS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="weight">Max weight: {picker.maxWeight.toFixed(1)}</label>
            <input
              id="weight" type="range" min="1" max="5" step="0.5" value={picker.maxWeight}
              onChange={(e) => set({ maxWeight: Number(e.target.value) })}
              className="w-full accent-brand"
            />
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-400">
        {ranked.length} game{ranked.length === 1 ? '' : 's'} on your shelf fit these constraints.
      </p>

      {ranked.length === 0 ? (
        <EmptyState
          title="Nothing fits — yet"
          hint="Loosen the time or mood, or add more games to your shelf."
          action={<Link to="/collection" className="btn-ghost">Go to Shelf</Link>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {ranked.map(({ game, score, reasons }, i) => (
            <GameCard
              key={game.id}
              game={game}
              footer={
                <span className="flex flex-wrap items-center gap-1.5">
                  {i === 0 && <span className="chip border-transparent bg-brand/20 text-brand-soft">Top pick</span>}
                  <span className="chip">match {score}</span>
                  {reasons.slice(0, 3).map((r) => <span key={r} className="chip">{r}</span>)}
                </span>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
