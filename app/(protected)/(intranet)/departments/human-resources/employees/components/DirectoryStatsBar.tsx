"use client";

type Stats = { total: number; active: number; remote: number; leave: number };
type Props  = { stats: Stats };

export function DirectoryStatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 border-b border-slate-200/80">
      <StatItem label="Total"       value={stats.total}  suffix="empleados" barColor="bg-violet-500" pct={100} />
      <StatItem label="Activos"     value={stats.active} color="text-green-700"  barColor="bg-green-500"  pct={stats.total ? Math.round((stats.active / stats.total) * 100) : 0} />
      <StatItem label="Remotos"     value={stats.remote} color="text-blue-700"   barColor="bg-blue-500"   pct={stats.total ? Math.round((stats.remote / stats.total) * 100) : 0} />
      <StatItem label="En licencia" value={stats.leave}  color="text-amber-700"  barColor="bg-amber-500"  pct={stats.total ? Math.round((stats.leave  / stats.total) * 100) : 0} />
    </div>
  );
}

function StatItem({ label, value, suffix, color = "text-slate-900", barColor, pct }: {
  label: string; value: number; suffix?: string; color?: string; barColor: string; pct: number;
}) {
  return (
    <div className="relative px-6 py-5 border-r border-slate-200/80 last:border-r-0 overflow-hidden group hover:bg-slate-50/60 transition-colors">
      {/* Mini progress bar at bottom */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 w-full">
        <div className={`h-full ${barColor} opacity-60 transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-mono mb-1">{label}</p>
      <p className={`text-2xl font-bold leading-none tracking-tight ${color}`}>
        {value}
        {suffix ? <span className="text-[12px] font-normal text-slate-400 ml-1.5">{suffix}</span> : null}
      </p>
      <p className="text-[11px] text-slate-400 mt-1.5 font-mono">{pct}% del total</p>
    </div>
  );
}