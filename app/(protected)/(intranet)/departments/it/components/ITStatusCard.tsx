import ITGaugeCard from "./ITGaugeCard";

type Store = {
  id: string;
  name: string;
  status: string;
  uptime: string;
  latency: string;
  health: number;
};

const STATUS_CONFIG: Record<string, { badge: string; text: string; dot: string }> = {
  // Spanish
  operativo:     { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  reducido:      { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  mantenimiento: { badge: "bg-sky-50 border-sky-100",         text: "text-sky-700",     dot: "bg-sky-400"     },
  caido:         { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
  // English aliases
  operational:   { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  degraded:      { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  maintenance:   { badge: "bg-sky-50 border-sky-100",         text: "text-sky-700",     dot: "bg-sky-400"     },
  down:          { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
  ok:            { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  warning:       { badge: "bg-amber-50 border-amber-100",     text: "text-amber-700",   dot: "bg-amber-400"   },
  error:         { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
  online:        { badge: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-emerald-400" },
  offline:       { badge: "bg-rose-50 border-rose-100",       text: "text-rose-700",    dot: "bg-rose-400"    },
};

const FALLBACK = { badge: "bg-slate-50 border-slate-100", text: "text-slate-500", dot: "bg-slate-300" };

export default function ITStatusCard({ store }: { store: Store }) {
  const cfg = STATUS_CONFIG[store.status?.toLowerCase()] ?? FALLBACK;

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-violet-200 hover:shadow-sm transition-all duration-200">

      {/* Left: name + meta */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
          <h3 className="text-[13px] font-semibold text-slate-800 truncate">{store.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-semibold capitalize ${cfg.badge} ${cfg.text}`}>
            {store.status}
          </span>
          <span className="text-[10px] text-slate-400">{store.uptime} · {store.latency}</span>
        </div>
      </div>

      {/* Right: mini gauge */}
      <ITGaugeCard title="" value={store.health} size="small" />

    </div>
  );
}