export default function StatTile({ label, value, sub }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="text-2xl font-bold text-slate-50">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
