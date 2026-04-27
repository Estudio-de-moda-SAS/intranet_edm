/**
 * @module StoresOpsCenter
 * Centro de operaciones de tiendas del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza un panel operativo orientado al monitoreo
 * de situaciones que requieren atención prioritaria en tiendas físicas.
 *
 * Su objetivo es centralizar, en una sola vista, dos frentes críticos
 * del canal de tiendas:
 * - incidencias activas en punto de venta
 * - cierres de caja pendientes o con desviación
 *
 * El componente está diseñado para ofrecer lectura rápida,
 * priorización visual y acceso directo a acciones de seguimiento.
 *
 * La información mostrada es estática y funciona como mock dentro
 * de la intranet. En una implementación productiva, estos datos
 * podrían integrarse con:
 * - sistemas de incidencias operativas
 * - plataformas de seguridad o CCTV
 * - herramientas POS
 * - sistemas de cierre y conciliación de caja
 * - módulos de operación de tiendas
 */

// app/product/components/StoresOpsCenter.tsx
"use client";

import { AlertTriangle, WifiOff, ShieldAlert, Clock, ChevronRight, Phone, Store } from "lucide-react";

/**
 * Representa una incidencia activa en una tienda.
 *
 * @remarks
 * Este tipo modela alertas operativas que afectan el funcionamiento
 * normal de un punto de venta.
 *
 * Cada incidencia contiene información suficiente para:
 * - identificar la tienda afectada
 * - clasificar la criticidad
 * - distinguir el tipo de incidente
 * - mostrar contexto operativo
 * - enlazar a una acción o detalle de resolución
 *
 * @property id Identificador numérico de la incidencia.
 * @property severity Nivel de severidad del incidente.
 * @property store Nombre de la tienda afectada.
 * @property city Ciudad donde se ubica la tienda.
 * @property type Tipo funcional de la incidencia.
 * @property title Título breve del incidente.
 * @property detail Descripción ampliada del contexto o impacto.
 * @property time Marca temporal relativa del evento.
 * @property action Texto de la acción sugerida o acceso rápido.
 * @property href Ruta asociada al detalle o gestión del incidente.
 */
type StoreAlert = {
  id: number;
  severity: "critical" | "warning";
  store: string;
  city: string;
  type: "pos" | "security" | "ops" | "staff";
  title: string;
  detail: string;
  time: string;
  action: string;
  href: string;
};

/**
 * Representa un cierre de caja pendiente de validación o resolución.
 *
 * @remarks
 * Este tipo modela el estado de cierres operativos de tienda
 * que aún no han sido completados o presentan novedad.
 *
 * Permite exponer información clave como:
 * - tienda y ciudad
 * - hora programada del cierre
 * - desviación o estado actual
 * - contacto asociado
 * - condición operativa del cierre
 *
 * @property id Identificador único del cierre.
 * @property store Nombre de la tienda.
 * @property city Ciudad correspondiente.
 * @property scheduled Hora programada del cierre.
 * @property deviation Novedad, diferencia o estado reportado.
 * @property contact Número de contacto asociado al punto de venta.
 * @property status Estado operativo del cierre.
 */
type PendingClose = {
  id: string;
  store: string;
  city: string;
  scheduled: string;
  deviation: string;
  contact: string;
  status: "overdue" | "pending";
};

/**
 * Dataset estático de incidencias activas en tiendas.
 *
 * @remarks
 * Este arreglo contiene incidentes representativos del canal físico,
 * utilizados para poblar la sección de incidencias del centro
 * de operaciones.
 *
 * Los ejemplos incluyen casos como:
 * - fallas de datafono o POS
 * - alertas de seguridad
 * - problemas de cobertura de personal
 * - incidencias operativas
 *
 * El objetivo es simular distintos niveles de severidad
 * y distintos tipos de afectación en tienda.
 */
const ALERTS: StoreAlert[] = [
  {
    id: 1, severity: "critical",
    store: "Diesel El Tesoro", city: "Medellín",
    type: "pos",
    title: "Datafono fuera de línea",
    detail: "Terminal Ingenico #2 sin conexión desde las 11:20 · Clientes redirigidos a caja 1 · Fila > 10 personas",
    time: "hace 18 min", action: "Ver ticket", href: "/tiendas/incidencias/INC-0088",
  },
  {
    id: 2, severity: "critical",
    store: "Diesel Chipichape", city: "Cali",
    type: "security",
    title: "Alarma antihurto activada",
    detail: "4 activaciones en 2 horas · Seguridad del CC notificada · Se revisa grabación CCTV",
    time: "hace 45 min", action: "Ver incidencia", href: "/tiendas/incidencias/INC-0087",
  },
  {
    id: 3, severity: "warning",
    store: "Superdry Prime Outlet", city: "Medellín",
    type: "staff",
    title: "Turno tarde sin cubrir",
    detail: "1 baja de última hora · Turno de 15:00 con solo 1 asesor · Se busca reemplazo",
    time: "hace 1h 10min", action: "Gestionar turno", href: "/tiendas/personal/turnos",
  },
];

/**
 * Dataset estático de cierres de caja pendientes.
 *
 * @remarks
 * Este arreglo contiene cierres de tienda aún no finalizados
 * o con alguna desviación reportada.
 *
 * Se utiliza para alimentar la sección de monitoreo de cierres
 * dentro del centro de operaciones, ayudando a identificar:
 * - cierres con diferencia de caja
 * - cierres pendientes de validación
 * - tiendas que requieren seguimiento inmediato
 */
const PENDING_CLOSES: PendingClose[] = [
  { id: "EDM-02", store: "Diesel El Tesoro",    city: "Medellín",     scheduled: "21:00", deviation: "+$142.000 diferencia caja",  contact: "310 512 3344", status: "overdue"  },
  { id: "EDM-08", store: "Diesel Chipichape",   city: "Cali",         scheduled: "21:00", deviation: "Pendiente cuadre",           contact: "315 788 9900", status: "pending"  },
  { id: "EDM-06", store: "Pilatos Mayorca",      city: "Medellín",     scheduled: "21:30", deviation: "Sin incidencias",            contact: "312 441 6677", status: "pending"  },
];

/**
 * Asociación entre tipo de incidencia e ícono representativo.
 *
 * @remarks
 * Este mapa permite seleccionar dinámicamente el ícono
 * que se mostrará para cada incidencia según su naturaleza:
 * - `pos`: fallas de punto de venta o conectividad
 * - `security`: incidentes de seguridad
 * - `ops`: novedades operativas generales
 * - `staff`: incidencias relacionadas con personal o turnos
 *
 * Esto mejora la legibilidad del listado y refuerza el reconocimiento
 * visual del tipo de problema.
 */
const TYPE_ICON = {
  pos:      WifiOff,
  security: ShieldAlert,
  ops:      AlertTriangle,
  staff:    Clock,
};

/**
 * Centro de operaciones del canal de tiendas.
 *
 * @returns Un panel visual con incidencias activas y cierres de caja pendientes.
 *
 * @remarks
 * Este componente actúa como un bloque de supervisión operativa
 * para el canal de tiendas físicas.
 *
 * La interfaz se divide en dos paneles principales:
 *
 * 1. **Incidencias activas en tienda**
 *    Muestra alertas en curso con foco en:
 *    - criticidad
 *    - tipo de incidente
 *    - tienda afectada
 *    - contexto operativo
 *    - acceso rápido al detalle
 *
 * 2. **Cierres de caja pendientes**
 *    Muestra cierres aún no resueltos o con desviación,
 *    incluyendo:
 *    - punto de venta
 *    - hora programada
 *    - estado del cierre
 *    - contacto directo
 *    - acceso al detalle del cierre
 *
 * Además, el encabezado del componente expone indicadores resumidos
 * calculados dinámicamente a partir de los datasets:
 * - cantidad de incidencias críticas
 * - cantidad de cierres con desviación
 *
 * Este componente resulta especialmente útil para:
 * - monitoreo operativo en tiempo real
 * - seguimiento de riesgos en tienda
 * - control de cierres de caja
 * - visibilidad ejecutiva del canal físico
 *
 * @example
 * ```tsx
 * <StoresOpsCenter />
 * ```
 */
export default function TiendasOpsCenter() {
  /**
   * Número de incidencias críticas actualmente activas.
   *
   * @remarks
   * Se calcula a partir del conjunto de alertas para mostrar
   * un resumen ejecutivo en el encabezado del centro de operaciones.
   */
  const criticalCount = ALERTS.filter(a => a.severity === "critical").length;

  return (
    <div className="rounded-2xl border-2 border-rose-200/70 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-gradient-to-r from-rose-50 to-orange-50/60 border-b border-rose-100">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
          </span>
          <p className="text-sm font-bold text-slate-800">Centro de operaciones · Atención requerida</p>
          <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[11px] font-bold text-rose-600">
            {criticalCount} críticas · {PENDING_CLOSES.filter(c => c.status === "overdue").length} cierres con desviación
          </span>
        </div>
        <a href="/tiendas/incidencias" className="text-[12px] font-medium text-rose-600 hover:text-rose-700 transition-colors">
          Ver todas las incidencias →
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">

        {/* Incidencias activas */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Incidencias activas en tienda</p>
          <ul className="flex flex-col gap-3">
            {ALERTS.map(alert => {
              const isCritical = alert.severity === "critical";
              const TypeIcon = TYPE_ICON[alert.type];

              return (
                <li key={alert.id} className={`flex items-start gap-3 rounded-xl p-3 border transition-all hover:shadow-sm ${isCritical ? "border-rose-200 bg-rose-50/60" : "border-amber-200 bg-amber-50/40"}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isCritical ? "bg-rose-100" : "bg-amber-100"}`}>
                    <TypeIcon className={`h-3.5 w-3.5 ${isCritical ? "text-rose-500" : "text-amber-500"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="text-[12px] font-bold text-slate-800">{alert.title}</p>
                          <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${isCritical ? "bg-rose-200 text-rose-700" : "bg-amber-200 text-amber-700"}`}>
                            {isCritical ? "Crítico" : "Aviso"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Store className="h-3 w-3 text-slate-400 shrink-0" />
                          <p className="text-[11px] font-semibold text-slate-500">{alert.store} · {alert.city}</p>
                        </div>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-400">{alert.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 leading-snug">{alert.detail}</p>
                    <div className="mt-2 flex justify-end">
                      <a href={alert.href} className={`flex items-center gap-0.5 text-[11px] font-semibold transition-colors ${isCritical ? "text-rose-600 hover:text-rose-700" : "text-amber-600 hover:text-amber-700"}`}>
                        {alert.action} <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Cierres de caja */}
        <div className="p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Cierres de caja pendientes</p>
          <ul className="flex flex-col gap-3">
            {PENDING_CLOSES.map(c => {
              const isOverdue = c.status === "overdue";

              return (
                <li key={c.id} className={`flex items-start gap-3 rounded-xl border p-3 transition-all hover:shadow-sm ${isOverdue ? "border-rose-200 bg-rose-50/40" : "border-slate-200 bg-slate-50/60"}`}>
                  <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${isOverdue ? "bg-rose-100" : "bg-slate-100"}`}>
                    <Clock className={`h-3.5 w-3.5 ${isOverdue ? "text-rose-500" : "text-slate-400"}`} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">{c.store}</p>
                        <p className="text-[11px] text-slate-500">{c.city} · Cierre programado {c.scheduled}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${isOverdue ? "bg-rose-100 text-rose-600" : "bg-slate-200 text-slate-500"}`}>
                        {isOverdue ? "Con desviación" : "Pendiente"}
                      </span>
                    </div>
                    <p className={`text-[11px] mt-1 font-semibold ${isOverdue ? "text-rose-600" : "text-slate-400"}`}>{c.deviation}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-[11px] text-slate-400">
                        <Phone className="h-3 w-3" />
                        <a href={`tel:${c.contact}`} className="hover:text-sky-600 transition-colors font-medium">{c.contact}</a>
                      </div>
                      <a href={`/tiendas/cierres/${c.id}`} className="flex items-center gap-0.5 text-[11px] font-semibold text-sky-600 hover:text-sky-700 transition-colors">
                        Ver cierre <ChevronRight className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <a href="/tiendas/cierres" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
              Ver todos los cierres de hoy →
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}