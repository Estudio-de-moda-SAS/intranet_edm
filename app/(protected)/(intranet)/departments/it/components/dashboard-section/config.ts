import { HardDrive, Server, Shield, Wifi } from "lucide-react";
import type { TabConfig } from "./types";

/**
 * @module ITDashboardSection/config
 * Configuración visual y datasets del dashboard de TI.
 *
 * @remarks
 * Este archivo contiene:
 * - Datos de disponibilidad (uptime, latencia, errores)
 * - Métricas de tickets
 * - Estado de infraestructura
 * - Configuración de tabs
 */

/**
 * Datos de disponibilidad (últimas 24h)
 */
export const uptimeData = [
  { hora: "00:00", uptime: 100, latencia: 12, errores: 0 },
  { hora: "02:00", uptime: 100, latencia: 10, errores: 0 },
  { hora: "04:00", uptime: 99.8, latencia: 11, errores: 1 },
  { hora: "06:00", uptime: 100, latencia: 14, errores: 0 },
  { hora: "08:00", uptime: 98.2, latencia: 32, errores: 14 },
  { hora: "10:00", uptime: 99.5, latencia: 28, errores: 5 },
  { hora: "12:00", uptime: 100, latencia: 18, errores: 2 },
  { hora: "14:00", uptime: 100, latencia: 16, errores: 1 },
  { hora: "16:00", uptime: 99.1, latencia: 24, errores: 7 },
  { hora: "18:00", uptime: 100, latencia: 13, errores: 0 },
  { hora: "20:00", uptime: 100, latencia: 11, errores: 0 },
  { hora: "22:00", uptime: 100, latencia: 10, errores: 0 },
];

/**
 * Métricas rápidas de disponibilidad
 */
export const UPTIME_STATS = [
  { label: "Uptime promedio", value: "99.7%", good: true },
  { label: "Latencia promedio", value: "17 ms", good: true },
  { label: "Pico de errores", value: "14", good: false },
  { label: "Ventanas de caída", value: "2", good: false },
];

/**
 * Tendencia de tickets
 */
export const ticketData = [
  { semana: "S1 Ene", abiertos: 68, cerrados: 61, escalados: 7 },
  { semana: "S2 Ene", abiertos: 74, cerrados: 70, escalados: 4 },
  { semana: "S3 Ene", abiertos: 55, cerrados: 58, escalados: 3 },
  { semana: "S4 Ene", abiertos: 62, cerrados: 60, escalados: 5 },
  { semana: "S1 Feb", abiertos: 71, cerrados: 65, escalados: 6 },
  { semana: "S2 Feb", abiertos: 58, cerrados: 62, escalados: 2 },
  { semana: "S3 Feb", abiertos: 47, cerrados: 51, escalados: 3 },
];

/**
 * Distribución de tickets por categoría
 */
export const ticketsByCategory = [
  { name: "Conectividad", value: 28, color: "#6366f1" },
  { name: "Hardware", value: 19, color: "#38bdf8" },
  { name: "Software/Apps", value: 31, color: "#10b981" },
  { name: "Accesos", value: 14, color: "#f59e0b" },
  { name: "Otros", value: 8, color: "#94a3b8" },
];

/**
 * Cumplimiento SLA mensual
 */
export const slaData = [
  { mes: "Oct", cumplimiento: 93.1 },
  { mes: "Nov", cumplimiento: 94.8 },
  { mes: "Dic", cumplimiento: 91.2 },
  { mes: "Ene", cumplimiento: 95.5 },
  { mes: "Feb", cumplimiento: 96.3 },
  { mes: "Mar", cumplimiento: 97.1 },
];

/**
 * Métricas rápidas de tickets
 */
export const TICKET_STATS = [
  { label: "Total período", value: "435" },
  { label: "Tasa resolución", value: "89%" },
  { label: "MTTR promedio", value: "18 min" },
  { label: "SLA cumplido", value: "96.3%" },
];

/**
 * Recursos de servidores
 */
export const servers = [
  {
    id: "sv1",
    name: "SRV-APP-01",
    role: "Aplicaciones",
    status: "online",
    cpu: 42,
    ram: 67,
  },
  {
    id: "sv2",
    name: "SRV-DB-01",
    role: "Base de datos",
    status: "online",
    cpu: 78,
    ram: 82,
  },
  {
    id: "sv3",
    name: "SRV-FILE-01",
    role: "Archivos",
    status: "online",
    cpu: 23,
    ram: 45,
  },
  {
    id: "sv4",
    name: "SRV-BKUP-01",
    role: "Backups",
    status: "maintenance",
    cpu: 0,
    ram: 12,
  },
];

/**
 * Tarjetas resumen de infraestructura
 */
export const infraStats = [
  {
    icon: Server,
    label: "Servidores activos",
    value: "14 / 14",
    pct: 97,
    color: "from-indigo-500 to-indigo-600",
    textColor: "text-indigo-700",
  },
  {
    icon: Shield,
    label: "Endpoints protegidos",
    value: "284 / 291",
    pct: 98,
    color: "from-emerald-500 to-teal-500",
    textColor: "text-emerald-700",
  },
  {
    icon: Wifi,
    label: "APs en línea",
    value: "21 / 21",
    pct: 100,
    color: "from-sky-500 to-blue-500",
    textColor: "text-sky-700",
  },
  {
    icon: HardDrive,
    label: "Almacenamiento",
    value: "68% usado",
    pct: 68,
    color: "from-amber-500 to-orange-500",
    textColor: "text-amber-700",
  },
];

/**
 * Configuración de tabs
 */
export const TABS: TabConfig[] = [
  { id: "disponibilidad", label: "Disponibilidad" },
  { id: "tickets", label: "Tickets" },
  { id: "infraestructura", label: "Infraestructura" },
];