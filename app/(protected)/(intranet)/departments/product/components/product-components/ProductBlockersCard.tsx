"use client";

import { AlertTriangle, ExternalLink } from "lucide-react";

/**
 * @module ProductBlockersCard
 * Tarjeta de alertas y bloqueos del área de Producto.
 */

/**
 * Representa una alerta o bloqueo operativo del área de Producto.
 *
 * @property id Identificador único de la alerta.
 * @property title Descripción principal del problema detectado.
 * @property area Área funcional o contexto afectado.
 * @property severity Nivel de severidad de la alerta.
 * @property href Ruta de navegación asociada al detalle o resolución.
 */
type Alert = {
  id: string;
  title: string;
  area: string;
  severity: "high" | "medium" | "low";
  href: string;
};

/**
 * Dataset estático de alertas operativas del área.
 *
 * @remarks
 * Este arreglo contiene alertas representativas que podrían bloquear
 * o ralentizar procesos del flujo de Producto.
 */
const ALERTS: Alert[] = [
  {
    id: "a1",
    title: "Ficha técnica FA-2503 incompleta — lanzamiento en 34 días",
    area: "Faldas",
    severity: "high",
    href: "/product/techsheets/FA-2503",
  },
  {
    id: "a2",
    title: "Muestra CU-2542 rechazada en R1 — requiere ajuste de corte",
    area: "Resort-25",
    severity: "high",
    href: "/product/samples/s4",
  },
  {
    id: "a3",
    title: "Proveedor 'Sedas del Valle' sin confirmación de entrega",
    area: "Proveedores",
    severity: "medium",
    href: "/product/suppliers",
  },
  {
    id: "a4",
    title: "2 referencias sin categoría asignada en Resort-25",
    area: "Colecciones",
    severity: "low",
    href: "/product/collections/resort25",
  },
];

/**
 * Configuración visual por severidad de alerta.
 */
const ALERT_SEV = {
  high: {
    label: "Alta",
    cls: "bg-rose-50  text-rose-700  border-rose-200",
    dot: "bg-rose-400",
  },
  medium: {
    label: "Media",
    cls: "bg-amber-50 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
  },
  low: {
    label: "Baja",
    cls: "bg-stone-50 text-stone-500 border-stone-200",
    dot: "bg-stone-300",
  },
} as const;

/**
 * Tarjeta de alertas y bloqueos del área de Producto.
 *
 * @returns Un listado visual de incidencias pendientes de atención.
 *
 * @remarks
 * Este componente reúne alertas operativas relevantes para el equipo,
 * permitiendo identificar rápidamente problemas que impactan
 * el avance del flujo de Producto.
 *
 * Se usa como bloque de visibilidad inmediata para:
 * - fichas incompletas
 * - muestras rechazadas
 * - pendientes de proveedores
 * - inconsistencias de clasificación o carga
 *
 * @example
 * ```tsx
 * <ProductBlockersCard />
 * ```
 */
export function ProductBlockersCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Alertas del área</h2>
          <p className="text-[11px] text-slate-400">{ALERTS.length} pendientes de atención</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {ALERTS.map((a) => {
          const sev = ALERT_SEV[a.severity];

          return (
            <a
              key={a.id}
              href={a.href}
              className="group flex items-start gap-2.5 rounded-lg border border-stone-100 bg-stone-50/60 px-3 py-2.5 hover:border-rose-200 hover:bg-rose-50/20 transition-colors"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-700 leading-snug">{a.title}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">{a.area}</p>
              </div>

              <div className="shrink-0 flex items-center gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sev.cls}`}>
                  {sev.label}
                </span>
                <ExternalLink className="h-3 w-3 text-stone-300 group-hover:text-rose-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}