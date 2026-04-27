"use client";

import { Database, Server } from "lucide-react";
import { infraStats, servers } from "../config";
import { cpuColor } from "../utils";

/**
 * @module ITDashboardSection/tabs/InfrastructureTab
 * Pestaña de infraestructura del dashboard de TI.
 *
 * @remarks
 * Extraída directamente del componente original.
 * No contiene cambios funcionales, solo separación de responsabilidades.
 */
export function InfrastructureTab() {
  return (
    <div className="space-y-5">
      {/* Infra stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {infraStats.map(({ icon: Icon, label, value, pct, color, textColor }) => (
          <div
            key={label}
            className="rounded-xl border border-slate-100 bg-slate-50 p-3"
          >
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${color}`}
              >
                <Icon className="h-4 w-4 text-white" />
              </span>
              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {label}
                </p>
                <p className={`text-sm font-extrabold ${textColor}`}>
                  {value}
                </p>
              </div>
            </div>

            <div className="mt-3 h-1.5 rounded-full bg-white overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${color}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Server resources */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Server className="h-4 w-4 text-slate-400" />
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Recursos críticos
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-100">
          <table className="w-full text-left">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                  Servidor
                </th>
                <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                  Rol
                </th>
                <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                  Estado
                </th>
                <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                  CPU
                </th>
                <th className="px-4 py-2 text-[10px] uppercase tracking-wider text-slate-400">
                  RAM
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {servers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
                        <Database className="h-3.5 w-3.5 text-indigo-500" />
                      </span>
                      <span className="text-[12px] font-semibold text-slate-700">
                        {s.name}
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-[12px] text-slate-500">
                    {s.role}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        s.status === "online"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          s.status === "online"
                            ? "bg-emerald-400"
                            : "bg-amber-400"
                        }`}
                      />
                      {s.status === "online" ? "Online" : "Mantenimiento"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cpuColor(s.cpu)}`}
                          style={{ width: `${s.cpu}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {s.cpu}%
                      </span>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cpuColor(s.ram)}`}
                          style={{ width: `${s.ram}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {s.ram}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}