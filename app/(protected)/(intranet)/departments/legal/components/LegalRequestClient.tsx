"use client";

import type { LegalRequest } from "@/lib/graph/departments/legal.service";
import { useSearchFilter } from "@/app/hooks/useSearchFilter";
import { useState } from "react";
import FilterBar from "@/app/components/ui/filters/FilterBar";

type Props = {
  requests: LegalRequest[];
  STATUS_MAP: any;
  PRIORITY_MAP: any;
  TYPE_LABEL: any;
};

export default function LegalRequestsClient({
  requests,
  STATUS_MAP,
  PRIORITY_MAP,
  TYPE_LABEL,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("all");

  const { search, setSearch, filtered } = useSearchFilter(
    requests,
    (r, search) =>
      r.title.toLowerCase().includes(search) ||
      r.department.toLowerCase().includes(search)
  );

  const finalRequests =
    statusFilter === "all"
      ? filtered
      : filtered.filter((r) => r.status === statusFilter);

  return (
    <>
      {/* FILTER BAR */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        searchPlaceholder="Buscar solicitud o departamento..."
        filters={[
          {
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { value: "all", label: "Todos" },
              { value: "pending", label: "Pendiente" },
              { value: "in_review", label: "En revisión" },
              { value: "completed", label: "Completada" },
              { value: "rejected", label: "Rechazada" },
            ],
          },
        ]}
      />

      {/* LIST */}
      <ul className="divide-y divide-slate-50">
        {finalRequests.map((req) => {
          const status = STATUS_MAP[req.status];
          const priority = PRIORITY_MAP[req.priority];

          return (
            <li
              key={req.id}
              className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
            >
              <span
                className={`mt-2 h-2 w-2 shrink-0 rounded-full ${priority.dot}`}
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800">
                  {req.title}
                </p>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {req.id} · {TYPE_LABEL[req.type]} · {req.department}

                  {req.assignedTo && (
                    <>
                      {" "}
                      · <span className="text-slate-500">{req.assignedTo}</span>
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${status.cls}`}
                >
                  {status.label}
                </span>

                <span className="text-[10px] text-slate-400">
                  Vence {req.dueDate}
                </span>
              </div>
            </li>
          );
        })}
      </ul>

      {finalRequests.length === 0 && (
        <div className="px-5 py-6 text-center text-xs text-slate-400">
          No se encontraron solicitudes
        </div>
      )}
    </>
  );
}
