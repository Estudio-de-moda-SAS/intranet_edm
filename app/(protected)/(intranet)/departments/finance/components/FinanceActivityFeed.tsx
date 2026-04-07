import { Activity, CheckCircle2, XCircle, Upload, Edit3, Eye, Trash2, ChevronRight, Filter } from "lucide-react";

type ActionType = "approved" | "rejected" | "uploaded" | "edited" | "viewed" | "deleted";

interface ActivityEntry {
  id:           string;
  action:       ActionType;
  user:         string;
  userRole:     string;
  userInitials: string;
  avatarFrom:   string;
  avatarTo:     string;
  target:       string;
  targetHref?:  string;
  timestamp:    string;
  module:       string;
}

const ACTION_CONFIG: Record<ActionType, {
  label:     string;
  Icon:      React.ElementType;
  iconBg:    string;
  iconColor: string;
  textColor: string;
}> = {
  approved: { label: "Aprobó",   Icon: CheckCircle2, iconBg: "bg-emerald-100 dark:bg-emerald-500/[0.15]", iconColor: "text-emerald-600 dark:text-emerald-400", textColor: "text-emerald-700 dark:text-emerald-400" },
  rejected: { label: "Rechazó",  Icon: XCircle,      iconBg: "bg-rose-100 dark:bg-rose-500/[0.15]",       iconColor: "text-rose-600 dark:text-rose-400",       textColor: "text-rose-700 dark:text-rose-400"       },
  uploaded: { label: "Cargó",    Icon: Upload,       iconBg: "bg-blue-100 dark:bg-blue-500/[0.15]",       iconColor: "text-blue-600 dark:text-blue-400",       textColor: "text-blue-700 dark:text-blue-400"       },
  edited:   { label: "Editó",    Icon: Edit3,        iconBg: "bg-amber-100 dark:bg-amber-500/[0.15]",     iconColor: "text-amber-600 dark:text-amber-400",     textColor: "text-amber-700 dark:text-amber-400"     },
  viewed:   { label: "Consultó", Icon: Eye,          iconBg: "bg-slate-100 dark:bg-[#30363d]",            iconColor: "text-slate-500 dark:text-[#768390]",     textColor: "text-slate-500 dark:text-[#768390]"     },
  deleted:  { label: "Eliminó",  Icon: Trash2,       iconBg: "bg-rose-100 dark:bg-rose-500/[0.15]",       iconColor: "text-rose-600 dark:text-rose-400",       textColor: "text-rose-700 dark:text-rose-400"       },
};

const ACTIVITY: ActivityEntry[] = [
  { id: "a1", action: "approved", user: "Carolina Mejía",   userRole: "CFO",              userInitials: "CM", avatarFrom: "from-violet-500", avatarTo: "to-fuchsia-500",  target: "Reporte Q4 2024",          targetHref: "/finance/reports/q4-2024",  timestamp: "hace 8 min",  module: "Reportes"     },
  { id: "a2", action: "uploaded", user: "Luis Herrera",     userRole: "Analista",         userInitials: "LH", avatarFrom: "from-blue-500",   avatarTo: "to-cyan-500",     target: "Factura #INV-2025-0342",   targetHref: "/finance/invoices/0342",    timestamp: "hace 22 min", module: "Facturas"     },
  { id: "a3", action: "edited",   user: "Mariana Torres",   userRole: "Contabilidad",     userInitials: "MT", avatarFrom: "from-emerald-500",avatarTo: "to-teal-500",     target: "Presupuesto Mkt Q1",       targetHref: "/finance/budgets/mkt-q1",   timestamp: "hace 1 h",    module: "Presupuestos" },
  { id: "a4", action: "rejected", user: "Andrés Gómez",     userRole: "Gerente Área",     userInitials: "AG", avatarFrom: "from-rose-500",   avatarTo: "to-pink-500",     target: "Solicitud anticipo viaje", targetHref: "/finance/requests/trav-08", timestamp: "hace 2 h",    module: "Solicitudes"  },
  { id: "a5", action: "approved", user: "Carolina Mejía",   userRole: "CFO",              userInitials: "CM", avatarFrom: "from-violet-500", avatarTo: "to-fuchsia-500",  target: "Conciliación feb 2025",    targetHref: "/finance/recon/feb25",      timestamp: "hace 3 h",    module: "Contabilidad" },
  { id: "a6", action: "uploaded", user: "Felipe Castro",    userRole: "Cuentas por pagar",userInitials: "FC", avatarFrom: "from-orange-500", avatarTo: "to-amber-500",    target: "Factura proveedor SAP",    targetHref: "/finance/invoices/0341",    timestamp: "hace 4 h",    module: "Facturas"     },
  { id: "a7", action: "viewed",   user: "Daniela Ruiz",     userRole: "Auditoría",        userInitials: "DR", avatarFrom: "from-slate-500",  avatarTo: "to-slate-600",    target: "Estado Resultados 2024",   targetHref: "/finance/reports/annual24", timestamp: "hace 5 h",    module: "Auditoría"    },
];

interface ActivityFeedProps { limit?: number; className?: string; }

export function FinanceActivityFeed({ limit = 6, className = "" }: ActivityFeedProps) {
  const entries = ACTIVITY.slice(0, limit);

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm
                     bg-white border-slate-200
                     dark:bg-[#161b22] dark:border-[#30363d] ${className}`}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Activity className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <div>
            <h3 className="text-[12.5px] font-semibold text-slate-800 dark:text-[#e6edf3]">
              Actividad Reciente
            </h3>
            <p className="text-[10.5px] text-slate-400 dark:text-[#545d68]">
              Registro de acciones del equipo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-lg border px-2 py-1 text-[10.5px] font-medium transition-colors
                             border-slate-200 text-slate-500 hover:border-violet-200 hover:text-violet-600
                             dark:border-[#30363d] dark:text-[#545d68] dark:hover:border-violet-500/40 dark:hover:text-violet-400">
            <Filter className="h-2.5 w-2.5" />
            Filtrar
          </button>
          <a href="/finance/activity"
             className="flex items-center gap-0.5 text-[11px] font-medium transition-colors
                        text-violet-600 hover:text-violet-700
                        dark:text-violet-400 dark:hover:text-violet-300">
            Ver todo <ChevronRight className="h-3 w-3" />
          </a>
        </div>
      </div>

      {/* Feed */}
      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]" role="list">
        {entries.map((entry) => {
          const cfg = ACTION_CONFIG[entry.action];
          const { Icon } = cfg;
          return (
            <li key={entry.id}
                className="flex items-start gap-3 px-4 py-3 transition-colors group
                           hover:bg-slate-50 dark:hover:bg-[#1c2128]">

              {/* Avatar */}
              <div className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full
                               bg-gradient-to-br ${entry.avatarFrom} ${entry.avatarTo}
                               text-white text-[11px] font-bold shadow-sm`}>
                {entry.userInitials}
                <span className={`absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full
                                  border-2 border-white dark:border-[#161b22] ${cfg.iconBg}`}>
                  <Icon className={`h-2 w-2 ${cfg.iconColor}`} aria-hidden />
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-[12px] leading-snug text-slate-700 dark:text-[#adbac7]">
                  <span className="font-semibold text-slate-800 dark:text-[#e6edf3]">
                    {entry.user}
                  </span>
                  {" "}
                  <span className={`font-medium ${cfg.textColor}`}>{cfg.label}</span>
                  {" "}
                  {entry.targetHref ? (
                    <a href={entry.targetHref}
                       className="font-medium text-violet-600 hover:underline dark:text-violet-400">
                      {entry.target}
                    </a>
                  ) : (
                    <span className="font-medium text-slate-700 dark:text-[#adbac7]">
                      {entry.target}
                    </span>
                  )}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 dark:text-[#545d68]">{entry.timestamp}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-[#444c56]" aria-hidden />
                  <span className="text-[10px] text-slate-400 dark:text-[#545d68]">{entry.module}</span>
                  <span className="h-0.5 w-0.5 rounded-full bg-slate-300 dark:bg-[#444c56]" aria-hidden />
                  <span className="text-[10px] text-slate-400 dark:text-[#545d68]">{entry.userRole}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60
                      dark:border-[#21262d] dark:bg-[#1c2128]/50">
        <a href="/finance/activity"
           className="text-[11px] font-medium transition-colors
                      text-slate-500 hover:text-violet-600
                      dark:text-[#545d68] dark:hover:text-violet-400">
          Ver historial completo de auditoría →
        </a>
      </div>
    </div>
  );
}
