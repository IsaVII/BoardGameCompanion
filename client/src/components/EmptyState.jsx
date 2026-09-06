export default function EmptyState({ title, hint, action }) {
  return (
    <div className="card flex flex-col items-center gap-2 py-10 text-center">
      <p className="text-base font-semibold text-slate-200">{title}</p>
      {hint && <p className="max-w-sm text-sm text-slate-400">{hint}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
