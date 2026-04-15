/**
 * @module HRRequestsCard
 * Tarjeta de gestión y visualización de solicitudes del módulo de RRHH.
 *
 * @remarks
 * Este componente muestra un resumen interactivo de solicitudes realizadas
 * por colaboradores, permitiendo:
 * - Filtrar por estado
 * - Visualizar metadatos de cada solicitud
 * - Identificar solicitudes pendientes
 * - Ejecutar acciones rápidas sobre solicitudes en estado pendiente
 *
 * Está construido como componente cliente porque administra estado local
 * para el filtro de visualización.
 */

"use client";

import { useState } from "react";
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

/**
 * Tipos de solicitud disponibles.
 */
type RequestType =
  | "vacation"
  | "permit"
  | "certificate"
  | "advance"
  | "remote";

/**
 * Estados posibles de una solicitud.
 */
type RequestStatus = "pending" | "approved" | "rejected";

/**
 * Estructura de una solicitud de RRHH.
 *
 * @property id Identificador único de la solicitud.
 * @property employee Nombre del colaborador.
 * @property department Departamento al que pertenece.
 * @property type Tipo de solicitud.
 * @property description Descripción breve de la solicitud.
 * @property date Fecha relativa de creación o actualización.
 * @property days Cantidad de días asociados, si aplica.
 * @property status Estado actual de la solicitud.
 * @property initials Iniciales del colaborador para avatar visual.
 * @property hue Tono base usado para generar el gradiente del avatar.
 */
type Request = {
  id: string;
  employee: string;
  department: string;
  type: RequestType;
  description: string;
  date: string;
  days?: number;
  status: RequestStatus;
  initials: string;
  hue: number;
};

/**
 * Configuración visual y textual por tipo de solicitud.
 *
 * @remarks
 * Permite mapear cada tipo a:
 * - Etiqueta legible
 * - Color de fondo
 * - Color de texto
 */
const TYPE_CONFIG: Record<
  RequestType,
  { label: string; bg: string; text: string }
> = {
  vacation: {
    label: "Vacaciones",
    bg: "bg-violet-50",
    text: "text-violet-700",
  },
  permit: {
    label: "Permiso",
    bg: "bg-amber-50",
    text: "text-amber-700",
  },
  certificate: {
    label: "Certificado",
    bg: "bg-sky-50",
    text: "text-sky-700",
  },
  advance: {
    label: "Anticipo",
    bg: "bg-rose-50",
    text: "text-rose-700",
  },
  remote: {
    label: "Trabajo remoto",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
  },
};

/**
 * Dataset de solicitudes utilizado como mock.
 *
 * @remarks
 * En un entorno productivo, estos datos deberían consumirse desde una API
 * o servicio de backend.
 */
const REQUESTS: Request[] = [
  {
    id: "1",
    employee: "Laura Martínez",
    department: "Ventas",
    type: "vacation",
    description: "Vacaciones anuales",
    date: "Hoy",
    days: 15,
    status: "pending",
    initials: "LM",
    hue: 260,
  },
  {
    id: "2",
    employee: "Carlos Ruiz",
    department: "TI",
    type: "remote",
    description: "Trabajo remoto — 1 semana",
    date: "Hoy",
    days: 5,
    status: "pending",
    initials: "CR",
    hue: 210,
  },
  {
    id: "3",
    employee: "Ana Gómez",
    department: "Finanzas",
    type: "permit",
    description: "Cita médica personal",
    date: "Ayer",
    days: 1,
    status: "pending",
    initials: "AG",
    hue: 280,
  },
  {
    id: "4",
    employee: "Jorge Herrera",
    department: "Operaciones",
    type: "certificate",
    description: "Carta laboral",
    date: "Hace 2 días",
    status: "approved",
    initials: "JH",
    hue: 190,
  },
  {
    id: "5",
    employee: "María Torres",
    department: "Marketing",
    type: "advance",
    description: "Anticipo de nómina",
    date: "Hace 3 días",
    status: "rejected",
    initials: "MT",
    hue: 340,
  },
];

/**
 * Configuración visual y semántica por estado de solicitud.
 *
 * @remarks
 * Cada estado define:
 * - Ícono representativo
 * - Color principal
 * - Fondo de apoyo
 * - Etiqueta visible
 */
const STATUS_CONFIG = {
  pending: {
    icon: Clock,
    color: "text-amber-500",
    bg: "bg-amber-50",
    label: "Pendiente",
  },
  approved: {
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    label: "Aprobada",
  },
  rejected: {
    icon: XCircle,
    color: "text-rose-500",
    bg: "bg-rose-50",
    label: "Rechazada",
  },
};

/**
 * Filtros disponibles para la visualización de solicitudes.
 */
type Filter = "all" | "pending" | "approved" | "rejected";

/**
 * Tarjeta de solicitudes del módulo de RRHH.
 *
 * @returns Tarjeta interactiva con filtros y listado de solicitudes.
 *
 * @remarks
 * Funcionalidades principales:
 * - Filtrado local por estado
 * - Conteo de solicitudes pendientes
 * - Visualización resumida por solicitud
 * - Acciones rápidas de aprobación/rechazo para pendientes
 *
 * Estructura visual:
 * - Header con contador y enlace de navegación
 * - Barra de filtros
 * - Lista de solicitudes
 *
 * @example
 * ```tsx
 * <HRRequestsCard />
 * ```
 */
export default function HRRequestsCard() {
  const [filter, setFilter] = useState<Filter>("all");

  /**
   * Solicitudes filtradas según el estado actualmente seleccionado.
   */
  const filtered =
    filter === "all"
      ? REQUESTS
      : REQUESTS.filter((r) => r.status === filter);

  /**
   * Cantidad total de solicitudes pendientes.
   */
  const pendingCount = REQUESTS.filter((r) => r.status === "pending").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <ClipboardList className="h-3.5 w-3.5 text-violet-600" />
          </span>

          <h2 className="text-sm font-semibold text-slate-800">
            Solicitudes Pendientes
          </h2>

          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              {pendingCount} nuevas
            </span>
          )}
        </div>

        <Link
          href="/rrhh/solicitudes"
          className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-violet-600 transition-colors"
        >
          Ver todas <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-5 py-3 border-b border-slate-100">
        {(["all", "pending", "approved", "rejected"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${
              filter === f
                ? "bg-violet-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {{
              all: "Todas",
              pending: "Pendientes",
              approved: "Aprobadas",
              rejected: "Rechazadas",
            }[f]}
          </button>
        ))}
      </div>

      {/* List */}
      <ul className="divide-y divide-slate-50">
        {filtered.map((req) => {
          const typeCfg = TYPE_CONFIG[req.type];
          const statusCfg = STATUS_CONFIG[req.status];
          const StatusIcon = statusCfg.icon;

          return (
            <li
              key={req.id}
              className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/50 transition-colors"
            >
              {/* Avatar */}
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white shadow-sm"
                style={{
                  background: `linear-gradient(135deg, hsl(${req.hue},65%,55%), hsl(${req.hue + 20},60%,45%))`,
                }}
              >
                {req.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">
                    {req.employee}
                  </p>

                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeCfg.bg} ${typeCfg.text}`}
                  >
                    {typeCfg.label}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 truncate">
                  {req.department} · {req.description}
                  {req.days ? ` · ${req.days} días` : ""}
                </p>
              </div>

              {/* Date + status */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div
                  className={`flex items-center gap-1 text-[11px] font-semibold ${statusCfg.color}`}
                >
                  <StatusIcon className="h-3 w-3" />
                  {statusCfg.label}
                </div>

                <span className="text-[10px] text-slate-400">{req.date}</span>
              </div>

              {/* Action (pending only) */}
              {req.status === "pending" && (
                <div className="flex gap-1.5 shrink-0">
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                    <CheckCircle className="h-4 w-4" />
                  </button>
                  <button className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 transition-colors">
                    <XCircle className="h-4 w-4" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}