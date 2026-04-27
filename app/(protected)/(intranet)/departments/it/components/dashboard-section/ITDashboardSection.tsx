"use client";

import { useState } from "react";
import { BarChart3, Activity, Server } from "lucide-react";

import { TABS } from "./config";
import type { TabId } from "./types";
import { AvailabilityTab } from "./tabs/AvailabilityTab";
import { TicketsTab } from "./tabs/TicketsTab";
import { InfrastructureTab } from "./tabs/InfrastructureTab";

/**
 * @module ITDashboardSection
 * Dashboard operativo de TI con visualización por pestañas.
 *
 * @remarks
 * Este componente funciona como contenedor principal del dashboard.
 * Mantiene el estado de la pestaña activa y renderiza la vista
 * correspondiente según la selección del usuario.
 *
 * No contiene la lógica interna de cada pestaña; esa responsabilidad
 * fue separada en módulos específicos para mejorar mantenibilidad.
 */

/**
 * Dashboard principal de operaciones de TI.
 *
 * @returns Sección con métricas operativas organizadas por pestañas.
 *
 * @remarks
 * La sección agrupa tres vistas principales:
 * - Disponibilidad
 * - Tickets
 * - Infraestructura
 *
 * El componente conserva la responsabilidad de:
 * - Renderizar encabezado
 * - Controlar navegación por tabs
 * - Delegar el contenido a componentes especializados
 *
 * @example
 * ```tsx
 * <ITDashboardSection />
 * ```
 */
export function ITDashboardSection() {
  const [active, setActive] = useState<TabId>("disponibilidad");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-sm">
            <BarChart3 className="h-4.5 w-4.5 text-white" />
          </span>

          <div>
            <h2 className="text-[15px] font-bold text-slate-900 leading-tight">
              Dashboard operativo TI
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Disponibilidad, tickets e infraestructura crítica
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">
          <Activity className="h-3.5 w-3.5 text-emerald-500" />
          <span className="text-[11px] font-semibold text-slate-500">
            Operación estable
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-100 px-4 pt-3">
        {TABS.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`relative rounded-t-xl px-4 py-2 text-[12px] font-semibold transition-all ${
                isActive
                  ? "bg-white text-indigo-600"
                  : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}

              {isActive && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="p-5">
        {active === "disponibilidad" && <AvailabilityTab />}
        {active === "tickets" && <TicketsTab />}
        {active === "infraestructura" && <InfrastructureTab />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-5 py-3">
        <div className="flex items-center gap-2">
          <Server className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] text-slate-400">
            Última actualización automática hace 3 min
          </span>
        </div>

        <button className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          Ver reporte completo →
        </button>
      </div>
    </section>
  );
}