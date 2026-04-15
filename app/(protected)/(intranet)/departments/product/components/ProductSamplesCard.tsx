/**
 * @module ProductSamplesCard
 * Tarjeta de estado de muestras del módulo de Producto.
 *
 * @remarks
 * Este componente renderiza un resumen visual del estado de las muestras
 * activas del área, incluyendo:
 * - Conteo por estado
 * - Tabla de seguimiento
 * - Acciones de aprobación o rechazo según permisos
 *
 * La información mostrada es estática y sirve como mock para la intranet.
 * En un entorno productivo, estos datos podrían provenir de un servicio
 * conectado a sistemas de desarrollo de producto o control de calidad.
 */

// app/product/components/ProductSamplesCard.tsx
"use client";

import { Scissors, CheckCircle2, XCircle, Clock } from "lucide-react";
import Link from "next/link";

/**
 * Representa una muestra dentro del flujo de seguimiento del área de Producto.
 *
 * @property id Identificador único de la muestra.
 * @property refCode Código de referencia del producto.
 * @property refName Nombre descriptivo de la referencia.
 * @property supplier Proveedor asociado a la muestra.
 * @property sentDate Fecha de envío de la muestra.
 * @property dueDate Fecha estimada de vencimiento o entrega.
 * @property status Estado actual de la muestra.
 * @property round Número de ronda o iteración de revisión.
 */
type Sample = {
  id:         string;
  refCode:    string;
  refName:    string;
  supplier:   string;
  sentDate:   string;
  dueDate:    string;
  status:     "pending" | "approved" | "rejected" | "revision";
  round:      number;
};

/**
 * Dataset estático de muestras activas.
 *
 * @remarks
 * Este arreglo contiene referencias utilizadas para poblar la tarjeta
 * de seguimiento de muestras en la vista de Producto.
 */
const SAMPLES: Sample[] = [
  { id: "s1",  refCode: "VE-2508", refName: "Vestido lencero midi",        supplier: "Textiles Andino S.A.",  sentDate: "10 jun", dueDate: "20 jun", status: "pending",  round: 1 },
  { id: "s2",  refCode: "FA-2503", refName: "Falda plisada organza",       supplier: "Sedas del Valle",       sentDate: "08 jun", dueDate: "18 jun", status: "revision", round: 2 },
  { id: "s3",  refCode: "TR-2540", refName: "Traje de baño cut-out",       supplier: "Swimwear CO.",          sentDate: "05 jun", dueDate: "15 jun", status: "pending",  round: 1 },
  { id: "s4",  refCode: "CU-2542", refName: "Cubre-bikini kimono",         supplier: "Sedas del Valle",       sentDate: "04 jun", dueDate: "14 jun", status: "rejected", round: 1 },
  { id: "s5",  refCode: "BL-2501", refName: "Blusa lino perforada",        supplier: "Textiles Andino S.A.",  sentDate: "01 jun", dueDate: "11 jun", status: "approved", round: 2 },
  { id: "s6",  refCode: "PA-2517", refName: "Pantalón palazzo crêpe",      supplier: "Confecciones Bogotá",   sentDate: "01 jun", dueDate: "11 jun", status: "approved", round: 1 },
];

/**
 * Metadatos visuales asociados al estado de cada muestra.
 *
 * @remarks
 * Este objeto centraliza la configuración de:
 * - Etiqueta visible
 * - Ícono representativo
 * - Clases visuales del badge
 *
 * Se utiliza tanto en el resumen superior como en la tabla.
 */
const STATUS_META = {
  pending:  { label: "Pendiente",   icon: <Clock        className="h-3.5 w-3.5 text-amber-500" />,   badge: "bg-amber-50   text-amber-700  border-amber-200"   },
  approved: { label: "Aprobada",    icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rechazada",   icon: <XCircle      className="h-3.5 w-3.5 text-rose-500" />,    badge: "bg-rose-50    text-rose-700   border-rose-200"    },
  revision: { label: "En revisión", icon: <Clock        className="h-3.5 w-3.5 text-sky-500" />,     badge: "bg-sky-50     text-sky-700    border-sky-200"     },
};

/**
 * Calcula cuántas muestras existen para un estado dado.
 *
 * @param status Estado a contabilizar.
 * @returns Número de muestras que coinciden con el estado indicado.
 *
 * @example
 * ```ts
 * summaryCount("pending");
 * ```
 */
const summaryCount = (status: Sample["status"]) =>
  SAMPLES.filter((s) => s.status === status).length;

/**
 * Propiedades del componente {@link ProductSamplesCard}.
 *
 * @property canApprove Indica si el usuario puede visualizar acciones de aprobación y rechazo.
 */
type Props = { canApprove: boolean };

/**
 * Tarjeta de seguimiento de muestras del módulo de Producto.
 *
 * @param props Propiedades del componente.
 * @param props.canApprove Define si se deben mostrar acciones operativas sobre muestras pendientes o en revisión.
 * @returns Un componente visual con resumen, tabla y acciones sobre muestras.
 *
 * @remarks
 * Este componente muestra:
 * - Encabezado con acceso a la vista completa
 * - Resumen por estados
 * - Tabla con información de cada muestra
 * - Acciones condicionadas por permisos
 *
 * Si `canApprove` es `true`, se renderiza una columna adicional
 * con acciones para aprobar o rechazar muestras en estados operativos.
 */
export default function ProductSamplesCard({ canApprove }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
            <Scissors className="h-3.5 w-3.5 text-stone-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Estado de muestras</h2>
            <p className="text-[11px] text-slate-400">Ciclo SS-25 · {SAMPLES.length} muestras activas</p>
          </div>
        </div>
        <Link href="/product/samples" className="text-[11px] font-medium text-amber-600 hover:text-amber-700">
          Ver todas →
        </Link>
      </div>

      {/* Summary pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["pending", "revision", "approved", "rejected"] as const).map((s) => (
          <span
            key={s}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_META[s].badge}`}
          >
            {STATUS_META[s].icon}
            {summaryCount(s)} {STATUS_META[s].label}
          </span>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-100">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-stone-100 bg-stone-50">
              {["Referencia", "Proveedor", "Enviada", "Vence", "Ronda", "Estado", ...(canApprove ? ["Acción"] : [])].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {SAMPLES.map((s) => {
              const meta = STATUS_META[s.status];
              const isOverdue = s.status === "pending" || s.status === "revision";

              return (
                <tr key={s.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="px-3 py-2.5">
                    <p className="font-semibold text-stone-700 font-mono">{s.refCode}</p>
                    <p className="text-[10px] text-stone-400 truncate max-w-[120px]">{s.refName}</p>
                  </td>
                  <td className="px-3 py-2.5 text-stone-600 whitespace-nowrap">{s.supplier}</td>
                  <td className="px-3 py-2.5 text-stone-500 whitespace-nowrap">{s.sentDate}</td>
                  <td className={`px-3 py-2.5 whitespace-nowrap font-medium ${isOverdue ? "text-rose-600" : "text-stone-500"}`}>
                    {s.dueDate}
                  </td>
                  <td className="px-3 py-2.5 text-center text-stone-500">
                    <span className="rounded-full bg-stone-100 px-1.5 py-0.5 text-[10px] font-semibold">
                      R{s.round}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
                      {meta.icon}
                      {meta.label}
                    </span>
                  </td>
                  {canApprove && (
                    <td className="px-3 py-2.5">
                      {(s.status === "pending" || s.status === "revision") && (
                        <div className="flex gap-1.5">
                          <button className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors">
                            Aprobar
                          </button>
                          <button className="rounded-lg border border-rose-200 bg-rose-50 px-2 py-1 text-[10px] font-semibold text-rose-700 hover:bg-rose-100 transition-colors">
                            Rechazar
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}