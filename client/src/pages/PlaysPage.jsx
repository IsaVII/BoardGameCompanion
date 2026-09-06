import { useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectPlays, selectGames, selectPlayers, selectPlayFeed } from '../lib/selectors';
import { playLogged, playRemoved } from '../features/plays/playsSlice';
import {
  leaderboard, mostPlayed, longestWinStreak, playsPerMonth, totalHours,
} from '../lib/stats';
import PlayForm from '../features/plays/PlayForm';
import Modal from '../components/Modal';
import StatTile from '../components/StatTile';
import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import { relativeDate, pct } from '../lib/format';

export default function PlaysPage() {
  const dispatch = useAppDispatch();
  const plays = useAppSelector(selectPlays);
  const games = useAppSelector(selectGames);
  const players = useAppSelector(selectPlayers);
  const feed = useAppSelector(selectPlayFeed);
  const [logging, setLogging] = useState(false);

  const board = useMemo(() => leaderboard(plays, players).filter((p) => p.plays > 0), [plays, players]);
  const top = useMemo(() => mostPlayed(plays, games), [plays, games]);
  const streak = useMemo(() => longestWinStreak(plays, players), [plays, players]);
  const perMonth = useMemo(() => playsPerMonth(plays), [plays]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Plays</h1>
        <button className="btn-primary" onClick={() => setLogging(true)}>+ Log play</button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Total plays" value={plays.length} />
        <StatTile label="Hours played" value={totalHours(plays)} />
        <StatTile label="Longest win streak" value={streak ? streak.streak : '—'} sub={streak?.name} />
        <StatTile label="Most played" value={top[0]?.count ?? '—'} sub={top[0]?.title} />
      </div>

      {plays.length === 0 ? (
        <EmptyState title="No plays logged yet" hint="Quick-log a session — game, who played, who won." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="card">
              <h2 className="mb-3 font-semibold">Leaderboard</h2>
              <ul className="space-y-2 text-sm">
                {board.map((p, i) => (
                  <li key={p.id} className="flex items-center justify-between">
                    <span>{i + 1}. {p.name}</span>
                    <span className="text-slate-400">{pct(p.winRate)} · {p.wins}/{p.plays}</span>
                  </li>
                ))}
              </ul>
            </section>
            <section className="card">
              <h2 className="mb-3 font-semibold">Plays per month</h2>
              <BarChart data={perMonth} />
            </section>
          </div>

          <section className="card">
            <h2 className="mb-3 font-semibold">Most played</h2>
            <ul className="space-y-1 text-sm">
              {top.map((t) => (
                <li key={t.gameId} className="flex justify-between">
                  <span>{t.title}</span><span className="text-slate-400">{t.count} plays</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card">
            <h2 className="mb-3 font-semibold">History</h2>
            <ul className="divide-y divide-edge text-sm">
              {feed.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-3 py-2">
                  <div>
                    <p className="font-medium text-slate-100">{p.gameTitle}</p>
                    <p className="text-xs text-slate-400">
                      {p.playerNames.join(', ') || 'nobody'} · {p.minutes} min ·{' '}
                      {p.cooperativeWin ? 'co-op win' : `${p.winnerNames.join(', ') || 'no winner'} won`}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-500">{relativeDate(p.date)}</span>
                    <button className="text-xs text-rose-300" onClick={() => dispatch(playRemoved(p.id))}>
                      ✕
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      <Modal open={logging} onClose={() => setLogging(false)} title="Log a play">
        <PlayForm onSubmit={(p) => { dispatch(playLogged(p)); setLogging(false); }} />
      </Modal>
    </div>
  );
}
