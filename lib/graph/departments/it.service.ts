// lib/graph/departments/it.service.ts

import { getSharedData, getToken } from "@/lib/graph/shared.service";
import { callGraph }               from "@/lib/graph/graphClient";
import type { GraphPage } from "@/lib/graph/graphClient"

const IS_BYPASS = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

type GraphDevice = {
  id:                  string
  deviceName:          string
  operatingSystem?:    string | null
  complianceState?:    string | null
  lastSyncDateTime?:   string | null
}

// ── Mock data ────────────────────────────────────────────────────────────────

const MOCK_DATA = {
  kpis: {
    ticketsHoy:           "12",
    resueltosViaBot:      "8",
    uptimeMensual:        "99%",
    incidentesAbiertos:   "3",
    equiposEnRed:         "284",
    servidores:           "14",
    parchesPendientes:    "7",
    sistemasMonitoreados: "21",
  },
  tickets: {
    today:     12,
    escalated:  3,
    chatbot:    8,
  },
  ticketsList: [
    { id: "t1", title: "VPN sin conexión en sede norte",    priority: "high",   status: "Abierto",    assignee: "Luis H.",     created: "2026-03-10" },
    { id: "t2", title: "Error en impresora piso 3",         priority: "medium", status: "En proceso", assignee: "Sara M.",     created: "2026-03-10" },
    { id: "t3", title: "Actualización bloqueada en laptop", priority: "low",    status: "Abierto",    assignee: "Sin asignar", created: "2026-03-09" },
    { id: "t4", title: "Acceso denegado a SharePoint",      priority: "high",   status: "Escalado",   assignee: "Luis H.",     created: "2026-03-09" },
    { id: "t5", title: "Teams no sincroniza calendario",    priority: "medium", status: "Resuelto",   assignee: "Pedro G.",    created: "2026-03-08" },
  ],
  services: [
    { id: "s1", name: "Microsoft 365",   status: "operational", uptime: "99.9%" },
    { id: "s2", name: "Azure AD",        status: "operational", uptime: "100%"  },
    { id: "s3", name: "SharePoint",      status: "operational", uptime: "99.8%" },
    { id: "s4", name: "VPN Corporativa", status: "degraded",    uptime: "97.2%" },
    { id: "s5", name: "ERP",             status: "operational", uptime: "99.5%" },
    { id: "s6", name: "POS Tiendas",     status: "maintenance", uptime: "98.1%" },
  ],
  incidents: [
    { id: "in1", title: "VPN intermitente sede norte",       severity: "high",   status: "En investigación", since: "2026-03-10T08:30:00" },
    { id: "in2", title: "Lentitud en ERP módulo compras",    severity: "medium", status: "Monitoreando",     since: "2026-03-09T14:00:00" },
    { id: "in3", title: "POS sin sincronización tienda 7",   severity: "medium", status: "En proceso",       since: "2026-03-10T10:15:00" },
  ],
  servers: [
    { id: "sv1", name: "SRV-APP-01",  role: "Aplicaciones",  status: "online",       cpu: 42, ram: 67 },
    { id: "sv2", name: "SRV-DB-01",   role: "Base de datos",  status: "online",       cpu: 78, ram: 82 },
    { id: "sv3", name: "SRV-FILE-01", role: "Archivos",       status: "online",       cpu: 23, ram: 45 },
    { id: "sv4", name: "SRV-BKUP-01", role: "Backups",        status: "maintenance",  cpu: 0,  ram: 12 },
  ],
};

// ── Main service function ────────────────────────────────────────────────────

export async function getITData() {
  const shared = await getSharedData();

  // ── Bypass: datos mock ───────────────────────────────────────────────────
  if (IS_BYPASS) {
    return { ...shared, ...MOCK_DATA };
  }

  // ── Producción: datos reales de Microsoft Graph ──────────────────────────
  const token = await getToken();

const devicesRes = await callGraph<GraphPage<GraphDevice>>(
  "/deviceManagement/managedDevices?$select=id,deviceName,operatingSystem,complianceState,lastSyncDateTime&$top=50",
  token
).catch((): GraphPage<GraphDevice> => ({ value: [] }))

const equiposEnRed      = devicesRes.value.length
const parchesPendientes = devicesRes.value
  .filter(d => d.complianceState === "noncompliant").length

  return {
    ...shared,
    kpis: {
      ...MOCK_DATA.kpis,
      equiposEnRed:      equiposEnRed.toString(),
      parchesPendientes: parchesPendientes.toString(),
    },
    tickets:     MOCK_DATA.tickets,
    ticketsList: MOCK_DATA.ticketsList, // TODO: conectar ITSM (Freshdesk, Jira SM…)
    services:    MOCK_DATA.services,    // TODO: conectar Azure Service Health
    incidents:   MOCK_DATA.incidents,   // TODO: conectar Azure Monitor
    servers:     MOCK_DATA.servers,     // TODO: conectar Azure Monitor
  };
}

export type ITData = Awaited<ReturnType<typeof getITData>>;