// Tiny dependency-free bar chart for the plays-per-month view.
export default function BarChart({ data, valueKey = 'count', labelKey = 'month' }) {
  const max = Math.max(1, ...data.map((d) => d[valueKey]));
  return (
    <div className="flex items-end gap-2">
      {data.map((d) => (
        <div key={d[labelKey]} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs text-slate-400">{d[valueKey]}</span>
          <div
            className="w-full rounded-t bg-brand/70"
            style={{ height: `${(d[valueKey] / max) * 96 + 4}px` }}
          />
          <span className="text-[10px] text-slate-500">{String(d[labelKey]).slice(2)}</span>
        </div>
      ))}
    </div>
  );
}
