"use client";

import { useTickets } from "../context/HelpTicketsContext";

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-rose-500",
  mid:  "bg-amber-500",
  low:  "bg-emerald-500",
};

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  open:     { label: "Abierto",    classes: "bg-blue-50 text-blue-700 border border-blue-200" },
  progress: { label: "En proceso", classes: "bg-amber-50 text-amber-700 border border-amber-200" },
  resolved: { label: "Resuelto",   classes: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
  critical: { label: "Crítico",    classes: "bg-rose-50 text-rose-700 border border-rose-200" },
};

export default function HelpTicketsCard() {
  const { tickets } = useTickets();

  // 🔥 Adaptador visual
  const mappedTickets = tickets.map((t, index) => {
    // prioridad fake por ahora (luego la hacemos real)
    const priority = index % 3 === 0 ? "high" : index % 3 === 1 ? "mid" : "low";

    // status adaptado
    const statusMap: Record<string, string> = {
      open:         "open",
      "in-progress": "progress",
      closed:       "resolved",
    };

    return {
      id:       `#${t.id.slice(0, 4)}`,
      title:    t.title,
      area:     t.area,
      priority,
      status:   statusMap[t.status] ?? "open",
      updated:  t.createdAt.toLocaleDateString(),
    };
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">
            Mis tickets activos
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Solicitudes en curso asignadas a ti
          </p>
        </div>
        <button className="text-[11px] font-medium text-blue-600 hover:underline">
          Ver todos
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              {["ID", "Solicitud", "Prioridad", "Estado", "Actualizado"].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-[10px] uppercase tracking-widest font-semibold text-slate-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {mappedTickets.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-6 text-center text-slate-400 text-sm">
                  No hay tickets aún
                </td>
              </tr>
            ) : (
              mappedTickets.map((t) => {
                // ✅ Fix: extraer con guard antes de usar
                const badge       = STATUS_BADGE[t.status];
                const priorityDot = PRIORITY_DOT[t.priority];
                if (!badge || !priorityDot) return null;

                return (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <span className="font-mono text-[11px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                        {t.id}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800 text-[13px]">{t.title}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{t.area}</p>
                    </td>

                    <td className="px-5 py-3">
                      <span className={`inline-block w-2 h-2 rounded-full ${priorityDot}`} />
                    </td>

                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full ${badge.classes}`}>
                        {badge.label}
                      </span>
                    </td>

                    <td className="px-5 py-3 text-[12px] text-slate-400 whitespace-nowrap">
                      {t.updated}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}