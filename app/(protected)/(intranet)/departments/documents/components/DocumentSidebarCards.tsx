"use client";

import {
  FileText,
  Users,
} from "lucide-react";

/* ─────────────────────────────────────────────
   DOCUMENTOS RECIENTES
─────────────────────────────────────────────*/

type RecentDoc = {
  id: string;
  name: string;
  owner: string;
  updated: string;
  status: "approved" | "pending";
};

const RECENT: RecentDoc[] = [
  {
    id: "DOC-101",
    name: "Política de Seguridad de la Información",
    owner: "Beatriz Londoño",
    updated: "Hace 2h",
    status: "approved",
  },
  {
    id: "DOC-102",
    name: "Procedimiento Gestión de Incidentes",
    owner: "Ernesto Palacio",
    updated: "Hace 4h",
    status: "pending",
  },
  {
    id: "DOC-103",
    name: "Manual de Compras",
    owner: "Marcela Quintero",
    updated: "Ayer",
    status: "approved",
  },
];

export function DocumentRecentCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <FileText className="h-3.5 w-3.5 text-indigo-600" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Documentos recientes
            </p>
            <p className="text-[11px] text-slate-400">
              Últimas actualizaciones del repositorio
            </p>
          </div>
        </div>

      </div>

      <ul className="divide-y divide-slate-50">

        {RECENT.map((doc) => (
          <li
            key={doc.id}
            className="group px-5 py-3 hover:bg-slate-50 transition"
          >
            <div className="flex items-start justify-between">

              <div className="flex-1 min-w-0">

                <p className="text-[12px] font-semibold text-slate-800 truncate">
                  {doc.name}
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  {doc.owner} · {doc.updated}
                </p>

              </div>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  doc.status === "approved"
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {doc.status === "approved" ? "Aprobado" : "Pendiente"}
              </span>

            </div>
          </li>
        ))}

      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RESPONSABLES DE DOCUMENTOS
─────────────────────────────────────────────*/

type Owner = {
  id: string;
  name: string;
  role: string;
  docs: number;
};

const OWNERS: Owner[] = [
  { id: "1", name: "Beatriz Londoño", role: "Compliance", docs: 42 },
  { id: "2", name: "Ernesto Palacio", role: "Operaciones", docs: 31 },
  { id: "3", name: "Marcela Quintero", role: "Compras", docs: 25 },
];

export function DocumentOwnersCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">

        <div className="flex items-center gap-2">

          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Users className="h-3.5 w-3.5 text-violet-600" />
          </span>

          <div>
            <p className="text-sm font-semibold text-slate-800">
              Responsables
            </p>

            <p className="text-[11px] text-slate-400">
              Gestión documental por área
            </p>
          </div>

        </div>

      </div>

      <ul className="divide-y divide-slate-50">

        {OWNERS.map((o) => (
          <li
            key={o.id}
            className="px-5 py-3 flex items-center justify-between hover:bg-slate-50"
          >

            <div>
              <p className="text-[12px] font-semibold text-slate-800">
                {o.name}
              </p>

              <p className="text-[10px] text-slate-400">
                {o.role}
              </p>
            </div>

            <span className="text-[11px] font-semibold text-indigo-600">
              {o.docs} docs
            </span>

          </li>
        ))}

      </ul>
    </div>
  );
}