/**
 * @module graph/departments/it.service
 * Service de datos para el departamento de Tecnología (TI) de la
 * intranet EDM.
 *
 * @remarks
 * Agrega en una sola llamada los datos necesarios para renderizar el
 * dashboard de TI: KPIs operativos, tickets de soporte, estado de
 * servicios corporativos, incidentes activos y métricas de servidores.
 *
 * En producción, el inventario de dispositivos y el conteo de parches
 * pendientes se obtienen desde Microsoft Intune a través de Graph.
 * Tickets, servicios, incidentes y servidores están pendientes de
 * integración con las herramientas ITSM y de monitoreo corporativas —
 * actualmente se sirven desde {@link MOCK_DATA}.
 *
 * **Scopes de Graph requeridos:**
 * | Scope                              | Dato obtenido                        |
 * |------------------------------------|--------------------------------------|
 * | `DeviceManagementManagedDevices.Read.All` | Inventario de dispositivos Intune |
 *
 * @example
 * ```tsx
 * // En un Server Component:
 * export default async function ITPage() {
 *   const data = await getITData();
 *   return <ITDashboard data={data} />;
 * }
 * ```
 */

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph }               from "@/lib/graph/graphClient";
import type { GraphPage }          from "@/lib/graph/graphClient";

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

// ── Tipos de Graph ────────────────────────────────────────────────────────────

/**
 * Subconjunto de un dispositivo administrado devuelto por
 * `/deviceManagement/managedDevices` en Microsoft Intune a través de Graph.
 *
 * @remarks
 * Solo incluye los campos seleccionados en la query (`$select`). El campo
 * `complianceState` se usa para identificar dispositivos con parches
 * pendientes — los dispositivos con valor `"noncompliant"` se cuentan
 * como parches pendientes en el KPI {@link ITData.kpis.parchesPendientes}.
 */
export type GraphDevice = {
  /** Identificador único del dispositivo en Intune. */
  id: string;

  /** Nombre del dispositivo tal como aparece en Intune. */
  deviceName: string;

  /**
   * Sistema operativo del dispositivo (ej. `"Windows"`, `"macOS"`).
   * `null` si no está disponible en Intune.
   */
  operatingSystem?: string | null;

  /**
   * Estado de cumplimiento del dispositivo con las políticas de Intune.
   * Valores posibles: `"compliant"`, `"noncompliant"`, `"unknown"`,
   * `"notApplicable"`, `"inGracePeriod"`, `"configManager"`.
   * `null` si aún no se ha evaluado.
   */
  complianceState?: string | null;

  /**
   * Fecha y hora de la última sincronización del dispositivo con Intune
   * en formato ISO 8601.
   * `null` si el dispositivo nunca se ha sincronizado.
   */
  lastSyncDateTime?: string | null;
};

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Datos mock del dashboard de TI para desarrollo local sin Azure.
 *
 * @remarks
 * Incluye KPIs, tickets, servicios corporativos, incidentes activos y
 * servidores con estados representativos del contexto de EDM. En
 * producción, `equiposEnRed` y `parchesPendientes` se sobreescriben con
 * datos reales de Intune. El resto permanece como mock hasta integrar
 * las herramientas ITSM y de monitoreo.
 */
export const MOCK_DATA = {
  /**
   * KPIs del dashboard de TI.
   * `equiposEnRed` y `parchesPendientes` se sobreescriben en producción
   * con datos reales de Microsoft Intune.
   */
  kpis: {
    /** Tickets de soporte registrados hoy. */
    ticketsHoy: "12",
    /** Tickets resueltos automáticamente por el chatbot. */
    resueltosViaBot: "8",
    /** Porcentaje de uptime promedio de servicios en el mes (ej. `"99%"`). */
    uptimeMensual: "99%",
    /** Incidentes de alta o media severidad actualmente abiertos. */
    incidentesAbiertos: "3",
    /** Dispositivos registrados en Intune (sobreescrito en producción). */
    equiposEnRed: "284",
    /** Servidores corporativos monitoreados. */
    servidores: "14",
    /** Dispositivos con `complianceState === "noncompliant"` en Intune. */
    parchesPendientes: "7",
    /** Sistemas y servicios bajo monitoreo activo. */
    sistemasMonitoreados: "21",
  },

  /**
   * Resumen agregado de tickets del día para el widget de estadísticas.
   */
  tickets: {
    /** Total de tickets registrados hoy. */
    today: 12,
    /** Tickets escalados a nivel 2 o superior. */
    escalated: 3,
    /** Tickets resueltos por el chatbot sin intervención humana. */
    chatbot: 8,
  },

  /**
   * Lista de tickets de soporte recientes con distintas prioridades y
   * estados para el widget de cola de soporte.
   */
  ticketsList: [
    { id: "t1", title: "VPN sin conexión en sede norte",    priority: "high",   status: "Abierto",    assignee: "Luis H.",     created: "2026-03-10" },
    { id: "t2", title: "Error en impresora piso 3",         priority: "medium", status: "En proceso", assignee: "Sara M.",     created: "2026-03-10" },
    { id: "t3", title: "Actualización bloqueada en laptop", priority: "low",    status: "Abierto",    assignee: "Sin asignar", created: "2026-03-09" },
    { id: "t4", title: "Acceso denegado a SharePoint",      priority: "high",   status: "Escalado",   assignee: "Luis H.",     created: "2026-03-09" },
    { id: "t5", title: "Teams no sincroniza calendario",    priority: "medium", status: "Resuelto",   assignee: "Pedro G.",    created: "2026-03-08" },
  ],

  /**
   * Estado operativo de los servicios corporativos principales.
   *
   * | `status`      | Descripción                          |
   * |---------------|--------------------------------------|
   * | `operational` | Funcionando con normalidad           |
   * | `degraded`    | Funcionando con degradación parcial  |
   * | `maintenance` | En ventana de mantenimiento          |
   * | `outage`      | Fuera de servicio                    */
  services: [
    { id: "s1", name: "Microsoft 365",   status: "operational", uptime: "99.9%" },
    { id: "s2", name: "Azure AD",        status: "operational", uptime: "100%"  },
    { id: "s3", name: "SharePoint",      status: "operational", uptime: "99.8%" },
    { id: "s4", name: "VPN Corporativa", status: "degraded",    uptime: "97.2%" },
    { id: "s5", name: "ERP",             status: "operational", uptime: "99.5%" },
    { id: "s6", name: "POS Tiendas",     status: "maintenance", uptime: "98.1%" },
  ],

  /**
   * Incidentes activos que afectan servicios o infraestructura corporativa.
   * `since` indica el momento de detección en formato ISO 8601.
   */
  incidents: [
    { id: "in1", title: "VPN intermitente sede norte",     severity: "high",   status: "En investigación", since: "2026-03-10T08:30:00" },
    { id: "in2", title: "Lentitud en ERP módulo compras",  severity: "medium", status: "Monitoreando",     since: "2026-03-09T14:00:00" },
    { id: "in3", title: "POS sin sincronización tienda 7", severity: "medium", status: "En proceso",       since: "2026-03-10T10:15:00" },
  ],

  /**
   * Servidores corporativos con estado y métricas de uso de recursos.
   * `cpu` y `ram` son porcentajes de uso (0–100).
   * `status: "maintenance"` indica que el servidor está en ventana de
   * mantenimiento y sus métricas pueden no ser representativas.
   */
  servers: [
    { id: "sv1", name: "SRV-APP-01",  role: "Aplicaciones", status: "online",      cpu: 42, ram: 67 },
    { id: "sv2", name: "SRV-DB-01",   role: "Base de datos", status: "online",      cpu: 78, ram: 82 },
    { id: "sv3", name: "SRV-FILE-01", role: "Archivos",      status: "online",      cpu: 23, ram: 45 },
    { id: "sv4", name: "SRV-BKUP-01", role: "Backups",       status: "maintenance", cpu: 0,  ram: 12 },
  ],
};

// ── Service principal ─────────────────────────────────────────────────────────

/**
 * Agrega y retorna todos los datos necesarios para renderizar el dashboard
 * del departamento de Tecnología.
 *
 * @remarks
 * En modo bypass retorna {@link MOCK_DATA} completo junto con el perfil
 * de usuario de {@link getSharedData}.
 *
 * En producción consulta `/deviceManagement/managedDevices` en Microsoft
 * Intune para obtener el inventario de dispositivos y calcular dos KPIs
 * en tiempo real:
 * - `equiposEnRed` → número total de dispositivos gestionados por Intune.
 * - `parchesPendientes` → dispositivos con `complianceState === "noncompliant"`.
 *
 * El resto de los datos permanece como mock hasta integrar las
 * herramientas especializadas:
 *
 * | Dato          | Integración pendiente                          |
 * |---------------|------------------------------------------------|
 * | `ticketsList` | ITSM corporativo (Freshdesk, Jira SM, etc.)    |
 * | `services`    | Azure Service Health API                       |
 * | `incidents`   | Azure Monitor / Azure Service Health           |
 * | `servers`     | Azure Monitor Metrics API                      |
 *
 * @returns Objeto {@link ITData} con el perfil del usuario y todos los
 *   datos del dashboard de TI.
 *
 * @example
 * ```tsx
 * export default async function ITPage() {
 *   const data = await getITData();
 *   return <ITDashboard data={data} />;
 * }
 * ```
 */
export async function getITData() {
  const shared = await getSharedData();

  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  const token = await getToken();

  const devicesRes = await callGraph<GraphPage<GraphDevice>>(
    "/deviceManagement/managedDevices?$select=id,deviceName,operatingSystem,complianceState,lastSyncDateTime&$top=50",
    token,
  ).catch((): GraphPage<GraphDevice> => ({ value: [] }));

  const equiposEnRed      = devicesRes.value.length;
  const parchesPendientes = devicesRes.value
    .filter((d) => d.complianceState === "noncompliant").length;

  return {
    ...shared,
    kpis: {
      ...MOCK_DATA.kpis,
      equiposEnRed:      equiposEnRed.toString(),
      parchesPendientes: parchesPendientes.toString(),
    },
    tickets:     MOCK_DATA.tickets,
    ticketsList: MOCK_DATA.ticketsList,
    services:    MOCK_DATA.services,
    incidents:   MOCK_DATA.incidents,
    servers:     MOCK_DATA.servers,
  };
}

// ── Tipos exportados ──────────────────────────────────────────────────────────

/**
 * Tipo inferido del valor resuelto por {@link getITData}.
 *
 * @remarks
 * Declarado con `Awaited<ReturnType<...>>` para que cualquier cambio en
 * la estructura de retorno de {@link getITData} se propague
 * automáticamente a todos los componentes que consumen este tipo, sin
 * necesidad de actualizarlo manualmente.
 *
 * @example
 * ```tsx
 * interface ITDashboardProps {
 *   data: ITData;
 * }
 * ```
 */
export type ITData = Awaited<ReturnType<typeof getITData>>;