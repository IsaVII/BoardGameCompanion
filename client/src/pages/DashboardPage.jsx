import { Link } from 'react-router-dom';
import { useAppSelector } from '../app/hooks';
import { selectGames, selectPlays, selectLoans, selectPlayers, selectPlayFeed } from '../lib/selectors';
import { collectionValue, formatMoney } from '../lib/value';
import { totalPlays, totalHours, leaderboard } from '../lib/stats';
import { splitLoans, daysOut } from '../lib/lending';
import { relativeDate, pct } from '../lib/format';
import StatTile from '../components/StatTile';

export default function DashboardPage() {
  const games = useAppSelector(selectGames);
  const plays = useAppSelector(selectPlays);
  const loans = useAppSelector(selectLoans);
  const players = useAppSelector(selectPlayers);
  const feed = useAppSelector(selectPlayFeed);

  const value = collectionValue(games);
  const { overdue } = splitLoans(loans);
  const board = leaderboard(plays, players).filter((p) => p.plays > 0).slice(0, 3);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Home</h1>
        <Link to="/picker" className="btn-primary">✦ What should we play?</Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Games" value={value.count} sub={`${formatMoney(value.resale)} resale est.`} />
        <StatTile label="Plays logged" value={totalPlays(plays)} sub={`${totalHours(plays)} hrs at the table`} />
        <StatTile label="Sticker value" value={formatMoney(value.sticker)} />
        <StatTile
          label="Out on loan"
          value={loans.filter((l) => !l.returnedAt).length}
          sub={overdue.length ? `${overdue.length} overdue` : 'all on time'}
        />
      </div>

      {overdue.length > 0 && (
        <div className="card border-rose-500/40 bg-rose-500/10">
          <p className="font-semibold text-rose-200">Overdue loans</p>
          <ul className="mt-2 space-y-1 text-sm text-rose-100/90">
            {overdue.map((l) => {
              const g = games.find((x) => x.id === l.gameId);
              return (
                <li key={l.id}>
                  <span className="font-medium">{g?.title ?? 'A game'}</span> — with {l.borrower} for {daysOut(l)} days
                </li>
              );
            })}
          </ul>
          <Link to="/lending" className="btn-ghost mt-3">Open lending tracker</Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Recent plays</h2>
            <Link to="/plays" className="text-xs text-brand">All plays →</Link>
          </div>
          {feed.length === 0 ? (
            <p className="text-sm text-slate-400">No plays yet. Log your first session.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {feed.slice(0, 5).map((p) => (
                <li key={p.id} className="flex justify-between gap-3">
                  <span className="truncate">
                    <span className="font-medium text-slate-100">{p.gameTitle}</span>
                    <span className="text-slate-400">
                      {' '}· {p.cooperativeWin ? 'co-op win' : `${p.winnerNames.join(', ') || 'no winner'} won`}
                    </span>
                  </span>
                  <span className="shrink-0 text-slate-500">{relativeDate(p.date)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Win rate</h2>
            <Link to="/plays" className="text-xs text-brand">Full stats →</Link>
          </div>
          {board.length === 0 ? (
            <p className="text-sm text-slate-400">Log competitive plays to build a leaderboard.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {board.map((p, i) => (
                <li key={p.id} className="flex items-center justify-between">
                  <span>{i + 1}. {p.name}</span>
                  <span className="text-slate-400">{pct(p.winRate)} · {p.wins}/{p.plays}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
