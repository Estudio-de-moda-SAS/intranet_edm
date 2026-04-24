import type { ElementType } from "react";

/**
 * @module ITDashboardSection/types
 * Tipos compartidos del dashboard de operaciones de TI.
 *
 * @remarks
 * Este archivo centraliza los contratos usados por el contenedor principal,
 * la configuración del dashboard y las pestañas internas.
 */

/**
 * Identificador válido de pestaña del dashboard.
 *
 * @remarks
 * Debe mantenerse alineado con los ids definidos en `TABS`.
 */
export type TabId = "disponibilidad" | "tickets" | "infraestructura";

/**
 * Configuración de una pestaña disponible en el dashboard.
 */
export type TabConfig = {
  /**
   * Identificador interno de la pestaña.
   */
  id: TabId;

  /**
   * Etiqueta visible en la navegación.
   */
  label: string;
};

/**
 * Punto de datos para disponibilidad, latencia y errores.
 */
export type UptimeDataPoint = {
  hora: string;
  uptime: number;
  latencia: number;
  errores: number;
};

/**
 * Punto de datos para tendencia semanal de tickets.
 */
export type TicketTrendPoint = {
  semana: string;
  abiertos: number;
  cerrados: number;
  escalados: number;
};

/**
 * Distribución de tickets por categoría.
 */
export type TicketCategoryPoint = {
  name: string;
  value: number;
  color: string;
};

/**
 * Servidor mostrado en la tabla de infraestructura.
 */
export type ServerResource = {
  name: string;
  role: string;
  status: "online" | "maintenance";
  cpu: number;
  ram: number;
};

/**
 * Tarjeta compacta de infraestructura.
 */
export type InfraStat = {
  icon: ElementType;
  label: string;
  value: string;
  pct: number;
  color: string;
  textColor: string;
};

/**
 * Métrica destacada de disponibilidad.
 */
export type UptimeStat = {
  label: string;
  value: string;
  good: boolean;
};

/**
 * Métrica destacada de tickets.
 */
export type TicketStat = {
  label: string;
  value: string;
};