/**
 * @module ServerMonitorPanel
 * Panel de monitoreo visual para la supervisión de servidores.
 *
 * @remarks
 * Este módulo implementa un panel interactivo que permite visualizar el estado
 * general de varios servidores de infraestructura, combinando:
 *
 * - Tabla resumen de servidores registrados
 * - Panel lateral con detalle del servidor seleccionado
 * - Indicadores de uso de CPU, RAM y disco
 * - Métricas complementarias como temperatura, uptime y ubicación
 * - Gráficas de tendencias para consumo de recursos y tráfico de red
 *
 * La interfaz está pensada para ofrecer una vista rápida del estado operativo
 * de la infraestructura, con énfasis en legibilidad, estados visuales y
 * navegación por selección.
 */

"use client";

import { useState } from "react";
import {
  Server,
  Cpu,
  MemoryStick,
  HardDrive,
  AlertTriangle,
  CheckCircle2,
  RefreshCcw,
  ArrowUpRight,
  Clock,
  Shield,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

// ── Types ─────────────────────────────────────────────────────────────────────

/**
 * Estados posibles de operación de un servidor.
 *
 * @remarks
 * Se utilizan para representar visualmente la condición general
 * de cada servidor dentro del panel.
 */
type ServerStatus = "online" | "warning" | "critical" | "maintenance" | "offline";

/**
 * Métrica histórica de uso de recursos para un servidor.
 *
 * @property t Marca de tiempo o franja horaria representada.
 * @property cpu Porcentaje de uso de CPU.
 * @property ram Porcentaje de uso de memoria RAM.
 * @property net Tráfico de red registrado en la muestra.
 */
interface ServerMetric {
  t: string;
  cpu: number;
  ram: number;
  net: number;
}

/**
 * Modelo de datos base de un servidor monitoreado.
 *
 * @property id Identificador único del servidor.
 * @property name Nombre técnico o hostname del servidor.
 * @property role Función principal dentro de la infraestructura.
 * @property os Sistema operativo instalado.
 * @property ip Dirección IP interna o de red.
 * @property location Ubicación física o lógica del servidor.
 * @property status Estado operativo actual.
 * @property cpu Porcentaje actual de uso de CPU.
 * @property ram Porcentaje actual de uso de RAM.
 * @property disk Porcentaje actual de uso de disco.
 * @property temp Temperatura actual del servidor en grados Celsius.
 * @property uptime Tiempo acumulado de actividad continua.
 * @property lastPatch Fecha del último parche o actualización aplicada.
 * @property history Histórico resumido de métricas del servidor.
 */
interface Server {
  id: string;
  name: string;
  role: string;
  os: string;
  ip: string;
  location: string;
  status: ServerStatus;
  cpu: number;
  ram: number;
  disk: number;
  temp: number;
  uptime: string;
  lastPatch: string;
  history: ServerMetric[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

/**
 * Genera un histórico simulado de métricas para un servidor.
 *
 * @param baseCpu Valor base de uso de CPU.
 * @param baseRam Valor base de uso de RAM.
 * @returns Lista de métricas con variación temporal simulada.
 *
 * @remarks
 * Esta función construye datos mock para alimentar las gráficas del panel,
 * produciendo fluctuaciones artificiales en CPU, RAM y tráfico de red.
 */
function genHistory(baseCpu: number, baseRam: number): ServerMetric[] {
  const hours = ["00", "02", "04", "06", "08", "10", "12", "14", "16", "18", "20", "22"];
  return hours.map((h, i) => ({
    t: `${h}:00`,
    cpu: Math.min(
      99,
      Math.max(1, baseCpu + Math.round(Math.sin(i * 0.9) * 12 + (Math.random() - 0.5) * 8))
    ),
    ram: Math.min(
      99,
      Math.max(10, baseRam + Math.round(Math.cos(i * 0.7) * 6 + (Math.random() - 0.5) * 4))
    ),
    net: Math.round(Math.abs(Math.sin(i * 1.2) * 180 + Math.random() * 60)),
  }));
}

/**
 * Conjunto estático de servidores mostrados en el panel.
 *
 * @remarks
 * Este arreglo actúa como fuente de datos mock para representar distintos
 * escenarios de estado, carga y ubicación dentro del sistema.
 */
const SERVERS: Server[] = [
  {
    id: "sv1",
    name: "SRV-APP-01",
    role: "Aplicaciones",
    os: "Windows Server 2022",
    ip: "10.0.1.10",
    location: "Rack A · Piso 3",
    status: "online",
    cpu: 42,
    ram: 67,
    disk: 54,
    temp: 48,
    uptime: "32 días",
    lastPatch: "2026-02-28",
    history: genHistory(42, 67),
  },
  {
    id: "sv2",
    name: "SRV-DB-01",
    role: "Base de datos",
    os: "Windows Server 2022",
    ip: "10.0.1.11",
    location: "Rack A · Piso 3",
    status: "warning",
    cpu: 78,
    ram: 82,
    disk: 71,
    temp: 61,
    uptime: "32 días",
    lastPatch: "2026-02-28",
    history: genHistory(78, 82),
  },
  {
    id: "sv3",
    name: "SRV-FILE-01",
    role: "Archivos / NAS",
    os: "Ubuntu Server 22.04",
    ip: "10.0.1.12",
    location: "Rack B · Piso 3",
    status: "online",
    cpu: 23,
    ram: 45,
    disk: 88,
    temp: 41,
    uptime: "18 días",
    lastPatch: "2026-03-01",
    history: genHistory(23, 45),
  },
  {
    id: "sv4",
    name: "SRV-BKUP-01",
    role: "Backups / DR",
    os: "Ubuntu Server 22.04",
    ip: "10.0.1.13",
    location: "Rack B · Piso 3",
    status: "maintenance",
    cpu: 5,
    ram: 14,
    disk: 62,
    temp: 35,
    uptime: "—",
    lastPatch: "2026-03-10",
    history: genHistory(5, 14),
  },
  {
    id: "sv5",
    name: "SRV-WEB-01",
    role: "Web / Intranet",
    os: "Ubuntu Server 22.04",
    ip: "10.0.1.14",
    location: "Rack C · Piso 2",
    status: "online",
    cpu: 31,
    ram: 52,
    disk: 43,
    temp: 44,
    uptime: "11 días",
    lastPatch: "2026-03-05",
    history: genHistory(31, 52),
  },
  {
    id: "sv6",
    name: "SRV-SEC-01",
    role: "Seguridad / SIEM",
    os: "CentOS Stream 9",
    ip: "10.0.1.15",
    location: "Rack A · Piso 2",
    status: "online",
    cpu: 55,
    ram: 71,
    disk: 39,
    temp: 52,
    uptime: "25 días",
    lastPatch: "2026-02-20",
    history: genHistory(55, 71),
  },
];

// ── Status config ─────────────────────────────────────────────────────────────

/**
 * Configuración visual asociada a cada estado de servidor.
 *
 * @remarks
 * Define etiquetas, colores, badges e íconos usados para representar
 * visualmente el estado operativo dentro de la tabla y el panel de detalle.
 */
const STATUS: Record<
  ServerStatus,
  { label: string; dot: string; badge: string; icon: React.ReactNode }
> = {
  online: {
    label: "Online",
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  },
  warning: {
    label: "Advertencia",
    dot: "bg-amber-400 animate-pulse",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />,
  },
  critical: {
    label: "Crítico",
    dot: "bg-red-500 animate-pulse",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" />,
  },
  maintenance: {
    label: "Mant.",
    dot: "bg-slate-400",
    badge: "bg-slate-100 text-slate-500 border-slate-200",
    icon: <RefreshCcw className="w-3.5 h-3.5 text-slate-400" />,
  },
  offline: {
    label: "Offline",
    dot: "bg-red-600",
    badge: "bg-red-50 text-red-700 border-red-200",
    icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" />,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Determina el estilo visual de una barra de porcentaje según su valor.
 *
 * @param v Valor porcentual a evaluar.
 * @returns Objeto con clases CSS para barra y texto.
 *
 * @remarks
 * Se usa para representar niveles de carga:
 * - Verde: carga normal
 * - Ámbar: carga media/alta
 * - Rojo: carga crítica
 */
function meterColor(v: number) {
  if (v >= 85) return { bar: "bg-red-500", text: "text-red-600" };
  if (v >= 65) return { bar: "bg-amber-400", text: "text-amber-600" };
  return { bar: "bg-emerald-400", text: "text-emerald-600" };
}

/**
 * Determina el color textual de temperatura según el valor recibido.
 *
 * @param v Temperatura del servidor en grados Celsius.
 * @returns Clase CSS asociada al nivel térmico.
 */
function tempColor(v: number) {
  if (v >= 65) return "text-red-600";
  if (v >= 55) return "text-amber-600";
  return "text-emerald-600";
}

/**
 * Props del componente {@link Meter}.
 *
 * @property label Etiqueta descriptiva del recurso monitoreado.
 * @property value Valor porcentual del recurso.
 * @property icon Ícono representativo del indicador.
 */
type MeterProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
};

/**
 * Indicador visual de porcentaje en formato barra.
 *
 * @param props Propiedades del componente.
 * @returns Barra compacta con porcentaje y estado visual.
 *
 * @remarks
 * Este componente se utiliza en el panel de detalle para representar
 * consumo de CPU, RAM y disco con una lectura rápida y compacta.
 */
function Meter({ label, value, icon }: MeterProps) {
  const c = meterColor(value);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          {icon}
          {label}
        </div>
        <span className={`text-[11px] font-extrabold ${c.text}`}>{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${c.bar}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// ── Detail panel ──────────────────────────────────────────────────────────────

/**
 * Props del componente {@link ServerDetail}.
 *
 * @property sv Servidor seleccionado para mostrar su información detallada.
 */
type ServerDetailProps = {
  sv: Server;
};

/**
 * Panel de detalle del servidor seleccionado.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con información ampliada del servidor.
 *
 * @remarks
 * Incluye información técnica, métricas actuales, ubicación, uptime,
 * última fecha de parche y una gráfica histórica de CPU y RAM.
 */
function ServerDetail({ sv }: ServerDetailProps) {
  const st = STATUS[sv.status];

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-extrabold text-slate-900 font-mono">{sv.name}</p>
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${st.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
              {st.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {sv.role} · {sv.os}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[10px] text-slate-400">IP</p>
          <p className="text-[11px] font-mono font-bold text-slate-700">{sv.ip}</p>
        </div>
      </div>

      {/* Meters */}
      <div className="space-y-2.5">
        <Meter label="CPU" value={sv.cpu} icon={<Cpu className="w-3 h-3 mr-0.5" />} />
        <Meter label="RAM" value={sv.ram} icon={<MemoryStick className="w-3 h-3 mr-0.5" />} />
        <Meter label="Disk" value={sv.disk} icon={<HardDrive className="w-3 h-3 mr-0.5" />} />
      </div>

      {/* Info row */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Temp.</p>
          <p className={`text-[13px] font-extrabold mt-0.5 ${tempColor(sv.temp)}`}>{sv.temp}°C</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Uptime</p>
          <p className="text-[12px] font-bold text-slate-700 mt-0.5">{sv.uptime}</p>
        </div>
        <div>
          <p className="text-[9px] text-slate-400 uppercase tracking-wide">Ubicación</p>
          <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{sv.location}</p>
        </div>
      </div>

      {/* Mini chart */}
      <div>
        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide mb-1.5">
          CPU & RAM — últimas 24 h
        </p>
        <ResponsiveContainer width="100%" height={90}>
          <LineChart data={sv.history} margin={{ top: 2, right: 4, left: -30, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#94a3b8" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{
                fontSize: 10,
                borderRadius: 6,
                border: "1px solid #e2e8f0",
                padding: "4px 8px",
              }}
            />
            <Line type="monotone" dataKey="cpu" name="CPU%" stroke="#6366f1" strokeWidth={1.5} dot={false} />
            <Line type="monotone" dataKey="ram" name="RAM%" stroke="#10b981" strokeWidth={1.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-[10px] text-slate-400">
          <Shield className="w-3 h-3" />
          Último parche:
          <span className="font-semibold text-slate-600 ml-0.5">{sv.lastPatch}</span>
        </div>
        <a
          href={`/it/servidores/${sv.id}`}
          className="flex items-center gap-0.5 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Detalle <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ── Summary row (table view) ──────────────────────────────────────────────────

/**
 * Props del componente {@link ServerRow}.
 *
 * @property sv Servidor representado en la fila.
 * @property selected Indica si la fila corresponde al servidor actualmente seleccionado.
 * @property onSelect Callback ejecutado al seleccionar la fila.
 */
type ServerRowProps = {
  sv: Server;
  selected: boolean;
  onSelect: () => void;
};

/**
 * Fila resumida de un servidor dentro de la tabla principal.
 *
 * @param props Propiedades del componente.
 * @returns Fila interactiva con métricas rápidas del servidor.
 *
 * @remarks
 * Este componente resume la información más relevante del servidor:
 * nombre, rol, estado, CPU, RAM, temperatura y uptime.
 * Permite además cambiar el servidor activo del panel.
 */
function ServerRow({ sv, selected, onSelect }: ServerRowProps) {
  const st = STATUS[sv.status];
  const cpu = meterColor(sv.cpu);
  const ram = meterColor(sv.ram);

  return (
    <tr
      onClick={onSelect}
      className={`cursor-pointer border-b border-slate-100 transition-colors ${
        selected ? "bg-indigo-50/60" : "hover:bg-slate-50"
      }`}
    >
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${st.dot}`} />
          <span className="font-mono text-[12px] font-bold text-slate-800">{sv.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[11px] text-slate-500 hidden sm:table-cell">{sv.role}</td>
      <td className="px-3 py-2.5 hidden md:table-cell">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${st.badge}`}>
          {st.label}
        </span>
      </td>

      {/* CPU bar */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
            <div className={`h-full rounded-full ${cpu.bar}`} style={{ width: `${sv.cpu}%` }} />
          </div>
          <span className={`text-[11px] font-bold w-8 ${cpu.text}`}>{sv.cpu}%</span>
        </div>
      </td>

      {/* RAM bar */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden hidden sm:block">
            <div className={`h-full rounded-full ${ram.bar}`} style={{ width: `${sv.ram}%` }} />
          </div>
          <span className={`text-[11px] font-bold w-8 ${ram.text}`}>{sv.ram}%</span>
        </div>
      </td>

      <td className={`px-3 py-2.5 text-[11px] font-bold hidden lg:table-cell ${tempColor(sv.temp)}`}>
        {sv.temp}°C
      </td>
      <td className="px-3 py-2.5 text-[11px] text-slate-400 hidden lg:table-cell">{sv.uptime}</td>
    </tr>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

/**
 * Panel principal de monitoreo de servidores.
 *
 * @returns Vista interactiva con tabla resumen, métricas globales y detalle del servidor seleccionado.
 *
 * @remarks
 * Este componente coordina toda la experiencia del módulo:
 * - Mantiene el servidor actualmente seleccionado
 * - Calcula contadores por estado
 * - Renderiza la tabla general
 * - Muestra el panel de detalle
 * - Presenta una gráfica adicional de tráfico de red
 *
 * @example
 * ```tsx
 * <ServerMonitorPanel />
 * ```
 */
export default function ServerMonitorPanel() {
  const [selected, setSelected] = useState<string>(SERVERS[0]?.id ?? "sv1");
  const selectedServer = SERVERS.find((s) => s.id === selected)!;

  const counts = {
    online: SERVERS.filter((s) => s.status === "online").length,
    warning: SERVERS.filter((s) => s.status === "warning").length,
    critical: SERVERS.filter((s) => s.status === "critical").length,
    maintenance: SERVERS.filter((s) => s.status === "maintenance").length,
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">Monitor de servidores</h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {SERVERS.length} servidores registrados · Selecciona uno para ver el detalle
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100 text-[10px] font-bold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {counts.online} Online
          </span>

          {counts.warning > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-700">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {counts.warning} Advertencia
            </span>
          )}

          {counts.critical > 0 && (
            <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 border border-red-100 text-[10px] font-bold text-red-700">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              {counts.critical} Crítico
            </span>
          )}

          <span className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            {counts.maintenance} Mant.
          </span>

          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[11px] font-semibold text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            EN VIVO
          </span>
        </div>
      </div>

      {/* ── Body: tabla + detail ─────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Tabla — col 8 */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-slate-100 overflow-hidden">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold">
                  <th className="text-left px-3 py-2">Servidor</th>
                  <th className="text-left px-3 py-2 hidden sm:table-cell">Rol</th>
                  <th className="text-left px-3 py-2 hidden md:table-cell">Estado</th>
                  <th className="text-left px-3 py-2">CPU</th>
                  <th className="text-left px-3 py-2">RAM</th>
                  <th className="text-left px-3 py-2 hidden lg:table-cell">Temp.</th>
                  <th className="text-left px-3 py-2 hidden lg:table-cell">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {SERVERS.map((sv) => (
                  <ServerRow
                    key={sv.id}
                    sv={sv}
                    selected={selected === sv.id}
                    onSelect={() => setSelected(sv.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Network throughput chart */}
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Tráfico de red — {selectedServer.name} · últimas 24 h
            </p>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={selectedServer.history} margin={{ top: 2, right: 8, left: -26, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="t" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} unit=" MB" />
                <Tooltip
                  contentStyle={{
                    fontSize: 10,
                    borderRadius: 6,
                    border: "1px solid #e2e8f0",
                    padding: "4px 8px",
                  }}
                />
                <Line type="monotone" dataKey="net" name="Red (MB/s)" stroke="#38bdf8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detail — col 4 */}
        <div className="lg:col-span-4">
          <ServerDetail sv={selectedServer} />
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Datos de Azure Monitor · actualización cada 2 min
        </p>
        <a
          href="/it/servidores"
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800"
        >
          Ver todos los servidores <ArrowUpRight className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}