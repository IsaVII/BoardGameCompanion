import { playerRange, timeRange, weightLabel } from '../lib/format';

const MOOD_STYLE = {
  strategy: 'bg-indigo-500/20 text-indigo-200',
  competitive: 'bg-rose-500/20 text-rose-200',
  cooperative: 'bg-emerald-500/20 text-emerald-200',
  party: 'bg-amber-500/20 text-amber-200',
};

export default function GameCard({ game, onClick, footer }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card w-full text-left transition hover:border-brand/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold leading-tight text-slate-50">{game.title}</p>
          <p className="mt-1 text-xs text-slate-400">
            {playerRange(game)} players · {timeRange(game)} · {weightLabel(game.weight)}
          </p>
        </div>
        <span className={`chip border-transparent ${MOOD_STYLE[game.mood] ?? ''}`}>{game.mood}</span>
      </div>
      {footer && <div className="mt-3 border-t border-edge pt-3 text-xs text-slate-400">{footer}</div>}
    </button>
  );
}
