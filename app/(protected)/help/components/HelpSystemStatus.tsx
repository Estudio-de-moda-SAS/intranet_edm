// app/(protected)/(intranet)/help/components/HelpSystemStatus.tsx
// SERVER COMPONENT

const systems = [
  { name: "Correo corporativo",  status: "ok"   },
  { name: "Microsoft 365",       status: "ok"   },
  { name: "VPN Corporativa",     status: "warn" },
  { name: "SharePoint / OneDrive", status: "ok" },
  { name: "Servidor ERP (SAP)", status: "down"  },
  { name: "Intranet",            status: "ok"   },
] as const;

type Status = "ok" | "warn" | "down";

const STATUS_CONFIG: Record<Status, { dot: string; label: string; badge: string }> = {
  ok:   { dot: "bg-emerald-400", label: "Operativo",     badge: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  warn: { dot: "bg-amber-400",   label: "Lento",         badge: "bg-amber-50 text-amber-700 border border-amber-200" },
  down: { dot: "bg-rose-500",    label: "Mantenimiento", badge: "bg-rose-50 text-rose-700 border border-rose-200" },
};

const allOk = systems.every((s) => s.status === "ok");

export default function HelpSystemStatus() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Estado de sistemas
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Actualizado hace 5 min</p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full ${
            allOk
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
              : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${allOk ? "bg-emerald-500" : "bg-amber-400"}`} />
          {allOk ? "Todo operativo" : "Incidencias activas"}
        </span>
      </div>

      <ul className="divide-y divide-slate-100">
        {systems.map(({ name, status }) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <li
              key={name}
              className="flex items-center justify-between px-5 py-3"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className="text-[12px] text-slate-700">{name}</span>
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                {cfg.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
