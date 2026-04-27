/**
 * @module StoreSalesTable
 * Tabla de ventas por tienda del canal físico dentro del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza una vista tabular para monitorear el desempeño
 * comercial de la red de tiendas físicas, con foco en indicadores diarios
 * y mensuales.
 *
 * La tabla permite:
 * - consultar ventas por tienda
 * - comparar el resultado diario contra el objetivo
 * - visualizar el avance mensual
 * - revisar ticket promedio, conversión y dotación
 * - filtrar por región
 * - buscar tiendas por nombre o ciudad
 * - ordenar por distintos indicadores
 *
 * La información mostrada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - sistemas POS
 * - ERP comercial
 * - tableros de performance retail
 * - servicios internos de operación de tiendas
 */

"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Search, ChevronRight, Minus } from "lucide-react";

/**
 * Representa una tienda dentro de la tabla de desempeño comercial.
 *
 * @remarks
 * Este tipo modela los principales indicadores de negocio y operación
 * necesarios para mostrar el estado de una tienda dentro del dashboard.
 *
 * Incluye métricas de:
 * - ventas del día
 * - cumplimiento contra presupuesto diario
 * - ventas acumuladas del mes
 * - ticket promedio
 * - conversión
 * - disponibilidad de personal
 * - estado operativo del punto de venta
 *
 * @property id Identificador único de la tienda.
 * @property name Nombre comercial del punto de venta.
 * @property city Ciudad donde opera la tienda.
 * @property region Región comercial o geográfica.
 * @property salesDay Ventas acumuladas del día.
 * @property targetDay Objetivo diario de ventas.
 * @property salesMonth Ventas acumuladas del mes.
 * @property targetMonth Objetivo mensual de ventas.
 * @property transactions Número de transacciones registradas.
 * @property avgTicket Valor promedio por transacción.
 * @property conversion Porcentaje de conversión comercial.
 * @property staff Cantidad de personal operativo presente.
 * @property status Estado operativo actual de la tienda.
 */
type Store = {
  id: string;
  name: string;
  city: string;
  region: string;
  salesDay: number;
  targetDay: number;
  salesMonth: number;
  targetMonth: number;
  transactions: number;
  avgTicket: number;
  conversion: number;
  staff: number;
  status: "open" | "closed" | "incident";
};

/**
 * Dataset estático de tiendas del canal físico.
 *
 * @remarks
 * Este arreglo contiene puntos de venta representativos del portafolio
 * de marcas del grupo EDM, junto con métricas comerciales y operativas.
 *
 * Permite simular distintos escenarios de desempeño, incluyendo:
 * - tiendas sobre objetivo
 * - tiendas bajo meta
 * - tiendas con incidencias
 * - tiendas cerradas
 *
 * Las cifras monetarias están expresadas en COP.
 */
const STORES: Store[] = [
  { id: "EDM-01", name: "Diesel Andino",         city: "Bogotá",       region: "Bogotá",       salesDay: 8_420_000, targetDay: 7_800_000, salesMonth: 198_400_000, targetMonth: 185_000_000, transactions: 112, avgTicket: 75_178, conversion: 5.8, staff: 4, status: "open"     },
  { id: "EDM-02", name: "Diesel El Tesoro",      city: "Medellín",     region: "Antioquia",    salesDay: 6_910_000, targetDay: 6_500_000, salesMonth: 162_800_000, targetMonth: 158_000_000, transactions: 89,  avgTicket: 77_640, conversion: 5.1, staff: 3, status: "incident" },
  { id: "EDM-03", name: "Pilatos Fontanar",      city: "Bogotá",       region: "Bogotá",       salesDay: 5_340_000, targetDay: 5_800_000, salesMonth: 124_200_000, targetMonth: 140_000_000, transactions: 143, avgTicket: 37_342, conversion: 4.2, staff: 5, status: "open"     },
  { id: "EDM-04", name: "Kipling Unicentro",     city: "Bogotá",       region: "Bogotá",       salesDay: 4_780_000, targetDay: 4_200_000, salesMonth: 112_600_000, targetMonth: 105_000_000, transactions: 98,  avgTicket: 48_775, conversion: 4.9, staff: 3, status: "open"     },
  { id: "EDM-05", name: "Superdry Prime Outlet", city: "Medellín",     region: "Antioquia",    salesDay: 3_920_000, targetDay: 4_500_000, salesMonth: 91_400_000,  targetMonth: 108_000_000, transactions: 74,  avgTicket: 52_972, conversion: 3.6, staff: 2, status: "open"     },
  { id: "EDM-06", name: "Pilatos Mayorca",       city: "Medellín",     region: "Antioquia",    salesDay: 6_150_000, targetDay: 5_900_000, salesMonth: 144_800_000, targetMonth: 142_000_000, transactions: 168, avgTicket: 36_607, conversion: 4.7, staff: 6, status: "open"     },
  { id: "EDM-07", name: "Kipling Buenavista",    city: "Barranquilla", region: "Caribe",       salesDay: 2_980_000, targetDay: 3_200_000, salesMonth: 68_400_000,  targetMonth: 76_000_000,  transactions: 61,  avgTicket: 48_852, conversion: 3.4, staff: 2, status: "open"     },
  { id: "EDM-08", name: "Diesel Chipichape",     city: "Cali",         region: "Pacífico",     salesDay: 4_210_000, targetDay: 5_000_000, salesMonth: 98_600_000,  targetMonth: 120_000_000, transactions: 55,  avgTicket: 76_545, conversion: 3.1, staff: 3, status: "incident" },
  { id: "EDM-09", name: "Superdry Cacique",      city: "Bucaramanga",  region: "Santanderes",  salesDay: 2_640_000, targetDay: 2_800_000, salesMonth: 61_200_000,  targetMonth: 67_000_000,  transactions: 48,  avgTicket: 55_000, conversion: 3.8, staff: 2, status: "open"     },
  { id: "EDM-10", name: "Pilatos Paseo Villa",   city: "Bogotá",       region: "Bogotá",       salesDay: 0,         targetDay: 3_500_000, salesMonth: 72_800_000,  targetMonth: 84_000_000,  transactions: 0,   avgTicket: 0,      conversion: 0,   staff: 0, status: "closed"   },
];

/**
 * Regiones disponibles para filtrado de la tabla.
 *
 * @remarks
 * Este arreglo define los filtros rápidos de región disponibles
 * en la interfaz de consulta.
 */
const REGIONS = ["Todas", "Bogotá", "Antioquia", "Caribe", "Pacífico", "Santanderes"];

/**
 * Configuración visual asociada al estado operativo de una tienda.
 *
 * @remarks
 * Este objeto centraliza:
 * - la etiqueta visible
 * - el color del indicador puntual
 * - el color del texto del estado
 *
 * Se utiliza para representar de forma consistente estados como:
 * - abierta
 * - cerrada
 * - con incidencia
 */
const STATUS_CONFIG = {
  open:     { label: "Abierta",    dot: "bg-emerald-400", text: "text-emerald-600" },
  closed:   { label: "Cerrada",    dot: "bg-slate-400",   text: "text-slate-500"   },
  incident: { label: "Incidencia", dot: "bg-rose-500",    text: "text-rose-600"    },
};

/**
 * Formatea un valor numérico como moneda en pesos colombianos.
 *
 * @param n Valor a formatear.
 * @returns Cadena formateada en COP sin decimales.
 *
 * @example
 * ```ts
 * fmt(75178);
 * ```
 */
function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(n);
}

/**
 * Formatea un valor numérico abreviándolo en millones.
 *
 * @param n Valor a formatear.
 * @returns Cadena abreviada en millones o un guion largo si el valor es cero.
 *
 * @remarks
 * Esta función se utiliza para mantener una lectura compacta
 * en columnas de ventas diarias y mensuales.
 *
 * @example
 * ```ts
 * fmtK(8420000); // "$8.4M"
 * ```
 */
function fmtK(n: number) {
  if (n === 0) return "—";
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

/**
 * Indicador visual de variación frente al presupuesto.
 *
 * @param props Propiedades del componente.
 * @param props.sales Venta o valor actual.
 * @param props.target Meta o presupuesto de referencia.
 * @returns Un indicador textual con iconografía de tendencia.
 *
 * @remarks
 * Este subcomponente calcula la diferencia porcentual entre el valor actual
 * y el objetivo, mostrando:
 * - tendencia positiva
 * - tendencia negativa
 * - neutralidad
 * - ausencia de dato cuando no hay ventas
 *
 * Se utiliza en la columna de desempeño diario.
 */
function VsBudget({ sales, target }: { sales: number; target: number }) {
  if (sales === 0) return <span className="text-[10px] text-slate-400">—</span>;

  const pct = Math.round(((sales - target) / target) * 100);

  if (pct > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
        <TrendingUp className="h-3 w-3" />+{pct}%
      </span>
    );
  }

  if (pct < 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-500">
        <TrendingDown className="h-3 w-3" />{pct}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-400">
      <Minus className="h-3 w-3" />0%
    </span>
  );
}

/**
 * Barra de progreso para expresar cumplimiento frente a una meta.
 *
 * @param props Propiedades del componente.
 * @param props.value Valor actual alcanzado.
 * @param props.target Meta o valor objetivo.
 * @returns Una barra horizontal con porcentaje de cumplimiento.
 *
 * @remarks
 * El color de la barra cambia según el nivel de cumplimiento:
 * - verde: meta alcanzada o superada
 * - ámbar: cumplimiento intermedio
 * - rojo: bajo cumplimiento
 *
 * Si el valor actual es cero, se muestra una barra vacía
 * con indicador neutral.
 */
function ProgressBar({ value, target }: { value: number; target: number }) {
  if (value === 0) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full bg-slate-100" />
        <span className="text-[10px] font-semibold text-slate-400 w-6 text-right">—</span>
      </div>
    );
  }

  const pct = Math.min(Math.round((value / target) * 100), 100);
  const color = pct >= 100 ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-rose-400";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-semibold text-slate-500 w-6 text-right">{pct}%</span>
    </div>
  );
}

/**
 * Tabla principal de ventas por tienda del canal físico.
 *
 * @returns Un componente interactivo con filtros, ordenamiento y métricas por tienda.
 *
 * @remarks
 * Este componente actúa como una vista analítica resumida
 * del desempeño comercial de tiendas físicas.
 *
 * Incluye tres capacidades principales de interacción:
 *
 * 1. **Búsqueda**
 *    Permite filtrar tiendas por nombre o ciudad.
 *
 * 2. **Filtro por región**
 *    Permite limitar la tabla a una zona geográfica específica.
 *
 * 3. **Ordenamiento**
 *    Permite organizar la vista por:
 *    - ventas del día
 *    - ventas del mes
 *    - conversión
 *
 * A partir del subconjunto filtrado se calculan métricas agregadas
 * para el encabezado:
 * - acumulado del día
 * - acumulado del mes
 *
 * También se calculan indicadores de resumen en el pie:
 * - número de tiendas abiertas
 * - número de tiendas sobre objetivo diario
 *
 * La tabla expone columnas clave para seguimiento retail:
 * - tienda
 * - estado operativo
 * - ventas del día vs objetivo
 * - ventas del mes
 * - ticket medio
 * - conversión
 * - staff
 * - acceso al detalle
 *
 * @example
 * ```tsx
 * <TiendasSalesTable />
 * ```
 */
export default function TiendasSalesTable() {
  /**
   * Texto actual de búsqueda para filtrar tiendas por nombre o ciudad.
   */
  const [search, setSearch] = useState("");

  /**
   * Región actualmente seleccionada para filtrar resultados.
   */
  const [region, setRegion] = useState("Todas");

  /**
   * Clave de ordenamiento activa de la tabla.
   *
   * @remarks
   * Permite reorganizar el listado por ventas del día,
   * ventas del mes o conversión.
   */
  const [sortKey, setSortKey] = useState<"salesDay" | "salesMonth" | "conversion">("salesDay");

  /**
   * Conjunto de tiendas visible tras aplicar filtros y ordenamiento.
   *
   * @remarks
   * La lógica aplicada incluye:
   * - filtro por región
   * - búsqueda por nombre o ciudad
   * - orden descendente según la métrica seleccionada
   */
  const filtered = STORES
    .filter(s => {
      const matchRegion = region === "Todas" || s.region === region;
      const q = search.toLowerCase();
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.city.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    })
    .sort((a, b) => b[sortKey] - a[sortKey]);

  /**
   * Acumulado de ventas diarias del subconjunto filtrado.
   */
  const totalDay = filtered.reduce((acc, s) => acc + s.salesDay, 0);

  /**
   * Acumulado de ventas mensuales del subconjunto filtrado.
   */
  const totalMonth = filtered.reduce((acc, s) => acc + s.salesMonth, 0);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-slate-800">Ventas por tienda · hoy</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {filtered.length} tiendas · acumulado día{" "}
            <span className="font-bold text-slate-700">{fmtK(totalDay)}</span>
            {" "}· mes{" "}
            <span className="font-bold text-slate-700">{fmtK(totalMonth)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar tienda..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-orange-300 focus:bg-white transition w-40"
            />
          </div>

          <select
            value={sortKey}
            onChange={e => setSortKey(e.target.value as typeof sortKey)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[12px] text-slate-600 outline-none focus:border-orange-300 cursor-pointer"
          >
            <option value="salesDay">Ordenar: Ventas hoy</option>
            <option value="salesMonth">Ordenar: Ventas mes</option>
            <option value="conversion">Ordenar: Conversión</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
        {REGIONS.map(r => (
          <button
            key={r}
            onClick={() => setRegion(r)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${region === r ? "bg-orange-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"}`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40">
              {["Tienda", "Estado", "Ventas hoy vs obj.", "Ventas mes", "Ticket medio", "Conversión", "Staff", ""].map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50">
            {filtered.map(s => {
              const sc = STATUS_CONFIG[s.status];
              const monthPct = s.salesMonth > 0 ? Math.min(Math.round((s.salesMonth / s.targetMonth) * 100), 100) : 0;
              const monthColor = monthPct >= 100 ? "bg-emerald-500" : monthPct >= 80 ? "bg-amber-400" : "bg-rose-400";

              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.city} · {s.id}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${sc.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${s.status === "open" ? "animate-pulse" : ""}`} />
                      {sc.label}
                    </span>
                  </td>

                  <td className="px-4 py-3 min-w-[160px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800">{s.salesDay > 0 ? fmtK(s.salesDay) : "—"}</span>
                      <VsBudget sales={s.salesDay} target={s.targetDay} />
                    </div>
                    <ProgressBar value={s.salesDay} target={s.targetDay} />
                  </td>

                  <td className="px-4 py-3 min-w-[140px]">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700">{fmtK(s.salesMonth)}</span>
                      <span className="text-[10px] text-slate-400">{monthPct > 0 ? `${monthPct}%` : "—"}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                      {monthPct > 0 && <div className={`h-full rounded-full ${monthColor}`} style={{ width: `${monthPct}%` }} />}
                    </div>
                  </td>

                  <td className="px-4 py-3 text-slate-700 font-medium">
                    {s.avgTicket > 0 ? fmt(s.avgTicket) : "—"}
                  </td>

                  <td className="px-4 py-3">
                    {s.conversion > 0 ? (
                      <span className={`font-bold ${s.conversion >= 4.5 ? "text-emerald-600" : s.conversion >= 3.5 ? "text-amber-600" : "text-rose-500"}`}>
                        {s.conversion}%
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-slate-500 text-center">
                    {s.staff > 0 ? s.staff : "—"}
                  </td>

                  <td className="px-4 py-3">
                    <a href={`/tiendas/${s.id}`} className="flex items-center gap-0.5 text-orange-500 opacity-0 group-hover:opacity-100 transition text-[11px] font-semibold">
                      Ver <ChevronRight className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[11px] text-slate-400">
          {filtered.filter(s => s.status === "open").length} abiertas ·{" "}
          {filtered.filter(s => s.salesDay >= s.targetDay && s.salesDay > 0).length} sobre objetivo
        </p>
        <a href="/tiendas/ventas" className="text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Ver informe completo →
        </a>
      </div>
    </div>
  );
}