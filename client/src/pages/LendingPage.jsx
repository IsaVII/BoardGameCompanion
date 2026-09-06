import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectLoans, selectGames } from '../lib/selectors';
import { loanCreated, loanReturned, loanRemoved } from '../features/lending/lendingSlice';
import { splitLoans, daysOut } from '../lib/lending';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';

function LoanRow({ loan, title, onReturn, onRemove, tone }) {
  return (
    <li className={`card flex items-center justify-between gap-3 ${tone}`}>
      <div>
        <p className="font-medium text-slate-100">{title}</p>
        <p className="text-xs text-slate-400">
          {loan.returnedAt
            ? `Returned after ${daysOut(loan)} days`
            : `With ${loan.borrower} · ${daysOut(loan)} days out · reminder at ${loan.reminderDays}d`}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        {!loan.returnedAt && (
          <button className="btn-ghost px-3 py-1 text-xs" onClick={onReturn}>Mark returned</button>
        )}
        <button className="text-xs text-rose-300" onClick={onRemove}>✕</button>
      </div>
    </li>
  );
}

export default function LendingPage() {
  const dispatch = useAppDispatch();
  const loans = useAppSelector(selectLoans);
  const games = useAppSelector(selectGames);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ gameId: games[0]?.id ?? '', borrower: '', lentAt: new Date().toISOString().slice(0, 10), reminderDays: 30 });

  const { overdue, out, returned } = splitLoans(loans);
  const title = (id) => games.find((g) => g.id === id)?.title ?? 'A game';
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    if (!form.gameId || !form.borrower.trim()) return;
    dispatch(loanCreated({ ...form, borrower: form.borrower.trim(), reminderDays: Number(form.reminderDays) || 30 }));
    setOpen(false);
    setForm((f) => ({ ...f, borrower: '' }));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Lending</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ Lend a game</button>
      </div>

      {loans.length === 0 && (
        <EmptyState title="Nothing lent out" hint="Log a game when it leaves the house and get a nudge if it doesn't come back." />
      )}

      {overdue.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-rose-300">Overdue</h2>
          <ul className="space-y-2">
            {overdue.map((l) => (
              <LoanRow key={l.id} loan={l} title={title(l.gameId)} tone="border-rose-500/40 bg-rose-500/10"
                onReturn={() => dispatch(loanReturned(l.id))} onRemove={() => dispatch(loanRemoved(l.id))} />
            ))}
          </ul>
        </section>
      )}

      {out.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-300">Out on loan</h2>
          <ul className="space-y-2">
            {out.map((l) => (
              <LoanRow key={l.id} loan={l} title={title(l.gameId)}
                onReturn={() => dispatch(loanReturned(l.id))} onRemove={() => dispatch(loanRemoved(l.id))} />
            ))}
          </ul>
        </section>
      )}

      {returned.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-500">Returned</h2>
          <ul className="space-y-2 opacity-70">
            {returned.map((l) => (
              <LoanRow key={l.id} loan={l} title={title(l.gameId)} onRemove={() => dispatch(loanRemoved(l.id))} />
            ))}
          </ul>
        </section>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Lend a game">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Game</label>
            <select className="field" value={form.gameId} onChange={(e) => set('gameId', e.target.value)}>
              {games.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Borrower</label>
            <input className="field" value={form.borrower} onChange={(e) => set('borrower', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Date lent</label>
              <input type="date" className="field" value={form.lentAt} onChange={(e) => set('lentAt', e.target.value)} />
            </div>
            <div>
              <label className="label">Remind after (days)</label>
              <input type="number" min="1" className="field" value={form.reminderDays}
                onChange={(e) => set('reminderDays', e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">Save loan</button>
        </form>
      </Modal>
    </div>
  );
}
