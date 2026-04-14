/**
 * @module ProductPanelComponents
 * Componentes de panel del módulo de Producto.
 *
 * @remarks
 * Este archivo agrupa componentes visuales orientados al seguimiento operativo
 * y ejecutivo del área de Producto dentro de la intranet.
 *
 * Actualmente incluye:
 * - {@link ProductLaunchPanel}: tabla de seguimiento de lanzamientos por colección y tienda
 * - {@link ProductStoreDistributionCard}: resumen visual de distribución de referencias por punto de venta
 *
 * Ambos componentes consumen datasets estáticos definidos localmente como mock,
 * los cuales representan escenarios típicos del flujo de lanzamiento y abastecimiento
 * de colecciones en tiendas.
 *
 * En un entorno productivo, esta información podría integrarse con:
 * - Sistemas PLM
 * - Herramientas de abastecimiento o supply chain
 * - Servicios internos de distribución
 * - APIs de seguimiento comercial y logístico
 */

// app/product/components/ProductPanelComponents.tsx
"use client";

import { CheckCircle2, Clock, AlertCircle, Loader2, Store } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// ProductLaunchPanel
// Panel ejecutivo: estado de lanzamiento por colección y por tienda
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Representa un registro de lanzamiento de colección por tienda.
 *
 * @remarks
 * Este tipo modela el estado operativo de una colección específica
 * dentro de un punto de venta determinado.
 *
 * Permite reflejar información relevante para el seguimiento de despliegue:
 * - colección asociada
 * - temporada comercial
 * - tienda o sede de destino
 * - volumen total de referencias
 * - cantidad de referencias listas
 * - estado general del lanzamiento
 * - fecha estimada de disponibilidad
 *
 * @property collection Nombre de la colección asociada al lanzamiento.
 * @property season Código o abreviatura de la temporada comercial.
 * @property store Nombre del punto de venta o tienda.
 * @property refs Total de referencias planificadas para la tienda.
 * @property ready Cantidad de referencias ya listas o confirmadas.
 * @property status Estado general del lanzamiento.
 * @property eta Fecha estimada de disponibilidad o salida.
 */
type LaunchRecord = {
  collection: string;
  season:     string;
  store:      string;
  refs:       number;
  ready:      number;
  status:     "ready" | "in_progress" | "delayed" | "not_started";
  eta:        string;
};

/**
 * Dataset estático de lanzamientos por colección y tienda.
 *
 * @remarks
 * Este arreglo contiene registros mock utilizados para poblar
 * el panel ejecutivo de lanzamientos.
 *
 * Cada elemento representa el avance de una colección en una tienda específica,
 * lo que permite visualizar:
 * - cobertura por punto de venta
 * - nivel de preparación de cada lanzamiento
 * - diferencias entre tiendas
 * - posibles retrasos operativos
 *
 * Este dataset es útil para prototipos, pruebas de interfaz
 * y validación de visualizaciones antes de conectarse a una fuente real.
 */
const LAUNCHES: LaunchRecord[] = [
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Bogotá · Andino",          refs: 128, ready: 98,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Bogotá · Gran Estación",    refs: 128, ready: 84,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Medellín · El Tesoro",      refs: 128, ready: 91,  status: "in_progress", eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Cali · Jardín Plaza",       refs: 96,  ready: 96,  status: "ready",       eta: "15 jul" },
  { collection: "Primavera Verano 2025", season: "SS-25",  store: "Barranquilla · Buenavista", refs: 80,  ready: 48,  status: "delayed",     eta: "22 jul" },
  { collection: "Resort 2025",           season: "RST-25", store: "Bogotá · Andino",           refs: 64,  ready: 21,  status: "in_progress", eta: "01 sep" },
  { collection: "Resort 2025",           season: "RST-25", store: "Cartagena · San Pedro",     refs: 48,  ready: 12,  status: "not_started", eta: "01 sep" },
];

/**
 * Metadatos visuales asociados al estado de lanzamiento.
 *
 * @remarks
 * Este objeto centraliza la configuración de presentación para cada estado
 * de un lanzamiento, permitiendo mantener consistencia visual en la interfaz.
 *
 * Para cada estado se define:
 * - `label`: texto visible para el usuario
 * - `icon`: ícono representativo del estado
 * - `badge`: clases visuales para el badge
 *
 * Esto facilita la reutilización de estilos y evita lógica repetida
 * dentro del renderizado de la tabla.
 */
const LAUNCH_STATUS_META = {
  ready:       { label: "Lista",       icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />, badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  in_progress: { label: "En proceso",  icon: <Loader2      className="h-3.5 w-3.5 text-sky-500"     />, badge: "bg-sky-50     text-sky-700    border-sky-200"     },
  delayed:     { label: "Con retraso", icon: <AlertCircle  className="h-3.5 w-3.5 text-rose-500"    />, badge: "bg-rose-50    text-rose-700   border-rose-200"    },
  not_started: { label: "Sin iniciar", icon: <Clock        className="h-3.5 w-3.5 text-stone-400"   />, badge: "bg-stone-50   text-stone-500  border-stone-200"   },
};

/**
 * Panel ejecutivo de lanzamientos por colección y tienda.
 *
 * @returns Tabla visual con el estado de preparación de lanzamientos.
 *
 * @remarks
 * Este componente presenta una vista tabular enfocada en el seguimiento
 * operativo del lanzamiento de colecciones en diferentes puntos de venta.
 *
 * La tabla expone información relevante para monitoreo ejecutivo:
 * - colección
 * - temporada
 * - tienda
 * - total de referencias planificadas
 * - cantidad de referencias listas
 * - porcentaje de avance
 * - ETA estimada
 * - estado general del lanzamiento
 *
 * El porcentaje de avance se calcula dinámicamente a partir de la relación
 * entre referencias listas (`ready`) y referencias totales (`refs`).
 *
 * Este componente resulta útil para:
 * - seguimiento comercial de colecciones
 * - control de despliegue por sede
 * - detección temprana de retrasos
 * - revisión operativa previa a salida a tiendas
 *
 * @example
 * ```tsx
 * <ProductLaunchPanel />
 * ```
 */
export function ProductLaunchPanel() {
  return (
    <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="border-b border-stone-100 bg-stone-50">
            {["Colección", "Temporada", "Tienda", "Refs totales", "Listas", "% avance", "ETA", "Estado"].map((h) => (
              <th
                key={h}
                className="px-4 py-2.5 text-left text-[10px] font-semibold text-stone-400 uppercase tracking-wide whitespace-nowrap"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {LAUNCHES.map((r, i) => {
            const pct  = Math.round((r.ready / r.refs) * 100);
            const meta = LAUNCH_STATUS_META[r.status];

            return (
              <tr key={i} className="hover:bg-stone-50/60 transition-colors">
                <td className="px-4 py-3 text-slate-700 font-medium whitespace-nowrap">{r.collection}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                    {r.season}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{r.store}</td>
                <td className="px-4 py-3 text-center font-semibold text-slate-600 tabular-nums">{r.refs}</td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-600 tabular-nums">{r.ready}</td>
                <td className="px-4 py-3 min-w-[96px]">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-400 w-7 text-right tabular-nums">{pct}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-stone-500 whitespace-nowrap">{r.eta}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${meta.badge}`}>
                    {meta.icon}
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductStoreDistributionCard
// Resumen de distribución de referencias por punto de venta
// Visible para: product + retail + manager + admin
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Representa el estado de distribución de referencias en una tienda.
 *
 * @remarks
 * Este tipo modela el avance de abastecimiento o recepción de referencias
 * en un punto de venta específico.
 *
 * Se utiliza para mostrar una visión resumida del estado de cobertura
 * de cada tienda en relación con una colección o temporada.
 *
 * @property name Nombre del punto de venta.
 * @property city Ciudad a la que pertenece la tienda.
 * @property total Total de referencias planificadas para la tienda.
 * @property received Cantidad de referencias ya recibidas o confirmadas.
 * @property missing Cantidad de referencias pendientes por recibir.
 */
type StoreRow = {
  name:     string;
  city:     string;
  total:    number;
  received: number;
  missing:  number;
};

/**
 * Dataset estático de distribución por tienda.
 *
 * @remarks
 * Este arreglo contiene información mock sobre la distribución
 * de referencias por punto de venta.
 *
 * Permite visualizar:
 * - nivel de recepción por tienda
 * - porcentaje de cobertura
 * - referencias pendientes
 * - puntos con distribución completa o parcial
 *
 * Es especialmente útil para dashboards de monitoreo comercial
 * y logístico dentro del módulo de Producto.
 */
const STORES: StoreRow[] = [
  { name: "Andino",        city: "Bogotá",       total: 128, received: 98,  missing: 30 },
  { name: "Gran Estación", city: "Bogotá",       total: 128, received: 84,  missing: 44 },
  { name: "El Tesoro",     city: "Medellín",     total: 128, received: 91,  missing: 37 },
  { name: "Jardín Plaza",  city: "Cali",         total: 96,  received: 96,  missing: 0  },
  { name: "Buenavista",    city: "Barranquilla", total: 80,  received: 48,  missing: 32 },
  { name: "San Pedro",     city: "Cartagena",    total: 48,  received: 12,  missing: 36 },
];

/**
 * Tarjeta de distribución de referencias por tienda.
 *
 * @returns Componente visual con tarjetas resumen por punto de venta.
 *
 * @remarks
 * Este componente muestra un resumen del estado de distribución
 * de referencias por tienda, utilizando tarjetas individuales
 * para cada punto de venta.
 *
 * Cada tarjeta presenta:
 * - nombre de la tienda
 * - ciudad
 * - porcentaje de cobertura
 * - barra de avance
 * - referencias recibidas
 * - referencias pendientes o estado completo
 *
 * El porcentaje de distribución se calcula dinámicamente a partir
 * de la relación entre referencias recibidas (`received`) y referencias
 * totales (`total`).
 *
 * La interfaz distingue visualmente los puntos de venta completos
 * de aquellos que aún tienen pendientes, facilitando una lectura rápida
 * del estado logístico de la colección.
 *
 * Este componente resulta útil para:
 * - monitoreo de cobertura comercial
 * - seguimiento de distribución por tienda
 * - validación previa a lanzamientos
 * - análisis rápido del avance de abastecimiento
 *
 * @example
 * ```tsx
 * <ProductStoreDistributionCard />
 * ```
 */
export function ProductStoreDistributionCard() {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-stone-100">
          <Store className="h-3.5 w-3.5 text-stone-600" />
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-800">Distribución por tienda</h2>
          <p className="text-[11px] text-slate-400">Referencias SS-25 confirmadas por punto de venta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STORES.map((s) => {
          const pct   = Math.round((s.received / s.total) * 100);
          const allOk = s.missing === 0;

          return (
            <div
              key={s.name}
              className={`rounded-xl border p-4 ${allOk ? "border-emerald-200 bg-emerald-50/30" : "border-stone-100 bg-stone-50/50"}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-[13px] font-semibold text-slate-800">{s.name}</p>
                  <p className="text-[11px] text-stone-400">{s.city}</p>
                </div>
                <span className="text-lg font-bold text-slate-700 tabular-nums">{pct}%</span>
              </div>

              <div className="mb-2 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${allOk ? "bg-emerald-400" : "bg-gradient-to-r from-amber-400 to-orange-400"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[10px]">
                <span className="text-emerald-700 font-semibold">{s.received} recibidas</span>
                {s.missing > 0 ? (
                  <span className="text-rose-600 font-semibold">{s.missing} pendientes</span>
                ) : (
                  <span className="text-emerald-600 font-semibold">✓ Completo</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}