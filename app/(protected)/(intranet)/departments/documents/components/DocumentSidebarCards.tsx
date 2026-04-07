"use client";

import { FileText, Users } from "lucide-react";

type RecentDoc = {
  id:      string;
  name:    string;
  owner:   string;
  updated: string;
  status:  "approved" | "pending";
};

const RECENT: RecentDoc[] = [
  { id: "DOC-101", name: "Política de Seguridad de la Información", owner: "Beatriz Londoño",  updated: "Hace 2h", status: "approved" },
  { id: "DOC-102", name: "Procedimiento Gestión de Incidentes",     owner: "Ernesto Palacio",  updated: "Hace 4h", status: "pending"  },
  { id: "DOC-103", name: "Manual de Compras",                       owner: "Marcela Quintero", updated: "Ayer",    status: "approved" },
];

export function DocumentRecentCard() {
  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm
                    bg-white border-slate-200
                    dark:bg-[#161b22] dark:border-[#30363d]">

      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-indigo-50 dark:bg-indigo-500/[0.12]">
            <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Documentos recientes
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              Últimas actualizaciones del repositorio
            </p>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {RECENT.map((doc) => (
          <li key={doc.id}
              className="group px-5 py-3 transition-colors
                         hover:bg-slate-50 dark:hover:bg-[#1c2128]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold truncate
                              text-slate-800 dark:text-[#e6edf3]">
                  {doc.name}
                </p>
                <p className="text-[10px] mt-0.5 text-slate-400 dark:text-[#545d68]">
                  {doc.owner} · {doc.updated}
                </p>
              </div>
              <span className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                doc.status === "approved"
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/[0.12] dark:text-emerald-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-500/[0.12] dark:text-amber-400"
              }`}>
                {doc.status === "approved" ? "Aprobado" : "Pendiente"}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

type Owner = { id: string; name: string; role: string; docs: number };

const OWNERS: Owner[] = [
  { id: "1", name: "Beatriz Londoño",  role: "Compliance",  docs: 42 },
  { id: "2", name: "Ernesto Palacio",  role: "Operaciones", docs: 31 },
  { id: "3", name: "Marcela Quintero", role: "Compras",      docs: 25 },
];

export function DocumentOwnersCard() {
  return (
    <div className="rounded-2xl border overflow-hidden shadow-sm
                    bg-white border-slate-200
                    dark:bg-[#161b22] dark:border-[#30363d]">

      <div className="flex items-center justify-between px-5 py-4
                      border-b border-slate-100 dark:border-[#21262d]">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg
                           bg-violet-50 dark:bg-violet-500/[0.12]">
            <Users className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
              Responsables
            </p>
            <p className="text-[11px] text-slate-400 dark:text-[#545d68]">
              Gestión documental por área
            </p>
          </div>
        </div>
      </div>

      <ul className="divide-y divide-slate-50 dark:divide-[#21262d]">
        {OWNERS.map((o) => (
          <li key={o.id}
              className="px-5 py-3 flex items-center justify-between transition-colors
                         hover:bg-slate-50 dark:hover:bg-[#1c2128]">
            <div>
              <p className="text-[12px] font-semibold text-slate-800 dark:text-[#e6edf3]">
                {o.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-[#545d68]">
                {o.role}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {o.docs} docs
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

