/**
 * @module DocumentOpsCenter
 * Centro de operaciones del sistema de Gestión Documental.
 *
 * @remarks
 * Este componente concentra alertas operativas clave relacionadas con:
 * - vencimientos documentales,
 * - procesos pendientes de aprobación,
 * - métricas de actividad reciente.
 *
 * Funciona como un bloque de monitoreo rápido dentro del dashboard,
 * permitiendo a los usuarios identificar acciones prioritarias
 * sin necesidad de navegar a vistas detalladas.
 */

"use client";

import { AlertTriangle, Clock, CheckCircle2 } from "lucide-react";

/**
 * Representa una alerta operativa dentro del sistema documental.
 *
 * @property icon Icono representativo del tipo de alerta.
 * @property text Descripción breve de la alerta.
 * @property color Clase CSS aplicada para indicar severidad o estado.
 */
type OpsAlert = {
  icon: React.ElementType;
  text: string;
  color: string;
};

/**
 * Colección de alertas operativas del módulo documental.
 *
 * @remarks
 * Actualmente utiliza datos mock, pero en producción debería alimentarse
 * desde servicios backend que consoliden métricas en tiempo real.
 *
 * Ejemplos de fuentes futuras:
 * - APIs de cumplimiento documental
 * - workflows de aprobación
 * - sistemas de auditoría
 */
const OPS_ALERTS: OpsAlert[] = [
  {
    icon: AlertTriangle,
    text: "12 documentos vencen esta semana",
    color: "text-red-600 dark:text-red-400",
  },
  {
    icon: Clock,
    text: "42 documentos pendientes de aprobación",
    color: "text-amber-600 dark:text-amber-400",
  },
  {
    icon: CheckCircle2,
    text: "186 aprobados este mes",
    color: "text-emerald-600 dark:text-emerald-400",
  },
];

/**
 * Centro de operaciones documental.
 *
 * @returns Componente visual con alertas operativas del sistema.
 *
 * @remarks
 * Este componente proporciona una vista rápida del estado operativo
 * del repositorio documental, destacando:
 *
 * - riesgos (documentos por vencer),
 * - cuellos de botella (pendientes de aprobación),
 * - actividad positiva (documentos aprobados).
 *
 * Está diseñado para ser altamente visible dentro del dashboard
 * y facilitar la toma de decisiones rápidas.
 *
 * @future
 * Posibles mejoras:
 * - Integración con datos en tiempo real.
 * - Priorización dinámica de alertas.
 * - Interacción (click → navegación a detalle).
 * - Notificaciones activas o badges dinámicos.
 *
 * @example
 * ```tsx
 * <DocumentOpsCenter />
 * ```
 */
export default function DocumentOpsCenter() {
  return (
    <div className="rounded-xl border p-5
                    bg-white border-slate-200
                    dark:bg-[#161b22] dark:border-[#30363d]">
      <h3 className="text-sm font-semibold mb-4
                     text-slate-800 dark:text-[#e6edf3]">
        Centro de Operaciones
      </h3>

      <div className="space-y-3">
        {OPS_ALERTS.map((a, i) => {
          const Icon = a.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-3 text-sm
                         text-slate-700 dark:text-[#adbac7]"
            >
              <Icon className={`h-4 w-4 shrink-0 ${a.color}`} />
              {a.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}