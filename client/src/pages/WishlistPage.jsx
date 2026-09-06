import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectWishlist } from '../lib/selectors';
import { wishAdded, wishUpdated, wishRemoved } from '../features/wishlist/wishlistSlice';
import { gameAdded } from '../features/collection/collectionSlice';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import { formatMoney } from '../lib/value';

const PRIORITIES = ['high', 'medium', 'low'];
const TONE = { high: 'text-rose-300', medium: 'text-amber-300', low: 'text-slate-400' };

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlist);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: '', priority: 'medium', estimatedPrice: 0, notes: '' });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const total = items.reduce((s, i) => s + (i.estimatedPrice || 0), 0);

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    dispatch(wishAdded({ ...form, title: form.title.trim(), estimatedPrice: Number(form.estimatedPrice) || 0 }));
    setOpen(false);
    setForm({ title: '', priority: 'medium', estimatedPrice: 0, notes: '' });
  };

  const acquire = (item) => {
    dispatch(gameAdded({ title: item.title, estimatedValue: item.estimatedPrice }));
    dispatch(wishRemoved(item.id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Wishlist</h1>
        <button className="btn-primary" onClick={() => setOpen(true)}>+ Add</button>
      </div>

      {items.length === 0 ? (
        <EmptyState title="Wishlist is empty" hint="Track games you're eyeing and roughly what they cost." />
      ) : (
        <>
          <p className="text-sm text-slate-400">{items.length} games · {formatMoney(total)} estimated</p>
          <ul className="space-y-2">
            {items.map((i) => (
              <li key={i.id} className="card flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-slate-100">{i.title}</p>
                  <p className="text-xs text-slate-400">
                    <span className={TONE[i.priority]}>{i.priority} priority</span>
                    {i.estimatedPrice > 0 && ` · ${formatMoney(i.estimatedPrice)}`}
                    {i.notes && ` · ${i.notes}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <select
                    className="field w-auto py-1 text-xs" value={i.priority}
                    onChange={(e) => dispatch(wishUpdated({ id: i.id, changes: { priority: e.target.value } }))}
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <button className="btn-ghost px-3 py-1 text-xs" onClick={() => acquire(i)}>Got it →</button>
                  <button className="text-xs text-rose-300" onClick={() => dispatch(wishRemoved(i.id))}>✕</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Add to wishlist">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input className="field" value={form.title} onChange={(e) => set('title', e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Priority</label>
              <select className="field" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Est. price ($)</label>
              <input type="number" min="0" className="field" value={form.estimatedPrice}
                onChange={(e) => set('estimatedPrice', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Notes</label>
            <input className="field" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
          </div>
          <button type="submit" className="btn-primary w-full">Add</button>
        </form>
      </Modal>
    </div>
  );
}
