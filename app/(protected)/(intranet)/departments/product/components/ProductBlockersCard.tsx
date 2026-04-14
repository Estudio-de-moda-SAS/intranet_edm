/**
 * @module ProductBlockersCard
 * Tarjeta de bloqueos activos del módulo de Producto.
 *
 * @remarks
 * Este componente renderiza un listado resumido de bloqueos o dependencias
 * activas que afectan el avance de iniciativas dentro del área de Producto.
 *
 * Su propósito es ofrecer visibilidad inmediata sobre impedimentos
 * relevantes para la operación, facilitando la priorización y el acceso
 * rápido a su detalle.
 *
 * Los bloqueos mostrados pueden representar situaciones como:
 * - dependencias externas
 * - aprobaciones pendientes
 * - limitaciones de infraestructura
 * - revisiones interáreas
 *
 * La información actual es estática y funciona como mock para la interfaz.
 * En una implementación productiva, estos datos podrían obtenerse desde:
 * - sistemas de seguimiento de iniciativas
 * - herramientas de gestión de proyectos
 * - tableros operativos
 * - servicios internos de incidentes o riesgos
 */

// app/product/components/ProductBlockersCard.tsx
// CLIENT COMPONENT — Equivalente a FinanceAlertsCard
"use client";

import { ShieldAlert, ExternalLink } from "lucide-react";

/**
 * Representa un bloqueo activo dentro del flujo del área de Producto.
 *
 * @remarks
 * Este tipo modela una incidencia, dependencia o restricción
 * que impide o ralentiza el avance de una iniciativa o proceso.
 *
 * Cada bloqueo incluye:
 * - un identificador único
 * - una descripción breve del problema
 * - el squad responsable o afectado
 * - un nivel de severidad
 * - una ruta de navegación al detalle
 *
 * @property id Identificador único del bloqueo.
 * @property title Título o descripción resumida del bloqueo.
 * @property squad Squad, equipo o frente asociado.
 * @property severity Nivel de severidad del bloqueo.
 * @property href Ruta de navegación hacia el detalle del bloqueo.
 */
type Blocker = {
  id:       string;
  title:    string;
  squad:    string;
  severity: "high" | "medium" | "low";
  href:     string;
};

/**
 * Dataset estático de bloqueos activos.
 *
 * @remarks
 * Este arreglo contiene bloqueos representativos del módulo de Producto,
 * utilizados para poblar la tarjeta de blockers en la homepage.
 *
 * Los ejemplos incluidos reflejan escenarios comunes de seguimiento:
 * - dependencias técnicas externas
 * - aprobaciones pendientes
 * - limitaciones de entorno
 * - revisiones legales o transversales
 *
 * Este dataset permite validar:
 * - la visualización del componente
 * - los estados de severidad
 * - el comportamiento de navegación
 */
const BLOCKERS: Blocker[] = [
  {
    id:       "blk-1",
    title:    "Dependencia externa: SDK de pagos desactualizado",
    squad:    "Platform",
    severity: "high",
    href:     "/product/blockers/blk-1",
  },
  {
    id:       "blk-2",
    title:    "Diseño UX de onboarding pendiente de aprobación",
    squad:    "Growth",
    severity: "medium",
    href:     "/product/blockers/blk-2",
  },
  {
    id:       "blk-3",
    title:    "Capacidad de staging insuficiente para load tests",
    squad:    "Mobile",
    severity: "medium",
    href:     "/product/blockers/blk-3",
  },
  {
    id:       "blk-4",
    title:    "Revisión legal del contrato API v2 pendiente",
    squad:    "Platform",
    severity: "low",
    href:     "/product/blockers/blk-4",
  },
];

/**
 * Configuración visual asociada a cada nivel de severidad.
 *
 * @remarks
 * Este objeto centraliza la representación visual de los bloqueos
 * según su severidad.
 *
 * Para cada nivel se define:
 * - `label`: texto visible para el usuario
 * - `cls`: clases utilitarias del badge
 * - `dot`: color del indicador puntual
 *
 * Esto permite mantener consistencia visual y simplifica
 * el renderizado del listado.
 */
const SEV = {
  high:   { label: "Alta",   cls: "bg-rose-50  text-rose-700  border-rose-100",  dot: "bg-rose-400"   },
  medium: { label: "Media",  cls: "bg-amber-50 text-amber-700 border-amber-100", dot: "bg-amber-400"  },
  low:    { label: "Baja",   cls: "bg-slate-50 text-slate-500 border-slate-200", dot: "bg-slate-300"  },
};

/**
 * Tarjeta de bloqueos activos del área de Producto.
 *
 * @returns Un componente visual con el listado de blockers pendientes de resolución.
 *
 * @remarks
 * Este componente presenta una vista compacta de los bloqueos activos
 * del módulo, organizada como un listado navegable.
 *
 * Cada elemento muestra:
 * - descripción resumida del bloqueo
 * - squad asociado
 * - severidad
 * - acceso directo al detalle
 *
 * La tarjeta está pensada para brindar una lectura rápida del estado
 * de impedimentos del área y favorecer la atención temprana
 * de elementos críticos o de alto impacto.
 *
 * Resulta útil para:
 * - monitoreo operativo
 * - visibilidad ejecutiva de riesgos
 * - seguimiento de dependencias
 * - navegación rápida a incidencias relevantes
 *
 * @example
 * ```tsx
 * <ProductBlockersCard />
 * ```
 */
export default function ProductBlockersCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Blockers activos</h2>
          <p className="text-[11px] text-slate-400">{BLOCKERS.length} pendientes de resolución</p>
        </div>
      </div>

      <div className="space-y-2.5">
        {BLOCKERS.map((b) => {
          const sev = SEV[b.severity];
          return (
            <a
              key={b.id}
              href={b.href}
              className="group flex items-start gap-2.5 rounded-lg border border-slate-100 bg-slate-50/60 px-3 py-2.5 hover:border-rose-200 hover:bg-rose-50/30 transition-colors"
            >
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${sev.dot}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[12px] font-medium text-slate-700 leading-snug truncate">
                  {b.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">{b.squad}</p>
              </div>
              <div className="shrink-0 flex items-center gap-1.5">
                <span className={`rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sev.cls}`}>
                  {sev.label}
                </span>
                <ExternalLink className="h-3 w-3 text-slate-300 group-hover:text-rose-400 transition-colors" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}