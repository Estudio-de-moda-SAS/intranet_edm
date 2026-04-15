/**
 * @module StoreGrid
 * Grid de estado operativo de tiendas del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza una vista en formato de tarjetas para monitorear
 * el estado operativo y comercial de la red de tiendas físicas.
 *
 * A diferencia de una tabla analítica detallada, esta vista está orientada
 * a una lectura más visual y rápida, permitiendo identificar de inmediato:
 * - estado de apertura de cada tienda
 * - cumplimiento frente al objetivo diario
 * - disponibilidad de personal
 * - alertas de stock
 * - incidencias operativas
 *
 * La interfaz incluye un sistema de filtros por:
 * - búsqueda textual
 * - estado operativo
 * - región
 *
 * Además, utiliza memoización para optimizar el cálculo del subconjunto
 * filtrado de tiendas.
 *
 * La información mostrada es estática y funciona como mock dentro
 * de la intranet. En una implementación productiva, estos datos podrían
 * integrarse con:
 * - sistemas POS
 * - operación de tiendas
 * - servicios de staffing
 * - módulos de inventario
 * - tableros comerciales retail
 */

"use client";

import { useState, useMemo } from "react";
import { Store, Users, Package, TrendingUp, TrendingDown, AlertTriangle, Search, X, SlidersHorizontal } from "lucide-react";

/**
 * Estados operativos admitidos para una tienda.
 *
 * @remarks
 * Estos estados determinan la representación visual de la card,
 * así como parte de los filtros disponibles en la interfaz.
 */
type StoreStatus = "open" | "incident" | "closed";

/**
 * Representa la información resumida de una tienda dentro del grid.
 *
 * @remarks
 * Este tipo modela los datos mínimos necesarios para renderizar
 * una tarjeta operativa por punto de venta.
 *
 * Incluye señales de desempeño y operación diaria como:
 * - ventas del día
 * - objetivo diario
 * - estado de personal
 * - alertas de inventario
 * - producto más vendido
 * - hora de apertura
 *
 * @property id Identificador único de la tienda.
 * @property name Nombre comercial del punto de venta.
 * @property city Ciudad en la que opera.
 * @property region Región comercial o geográfica.
 * @property status Estado operativo actual de la tienda.
 * @property salesDay Ventas acumuladas del día.
 * @property targetDay Objetivo diario de ventas.
 * @property staff Estado de cobertura de personal.
 * @property stockAlerts Número de alertas activas de stock.
 * @property topSeller Producto con mejor desempeño del día.
 * @property openSince Hora desde la cual la tienda está abierta.
 */
type StoreCard = {
  id:          string;
  name:        string;
  city:        string;
  region:      string;
  status:      StoreStatus;
  salesDay:    number;
  targetDay:   number;
  staff:       { current: number; scheduled: number };
  stockAlerts: number;
  topSeller:   string;
  openSince:   string;
};

/**
 * Dataset estático de tiendas EDM.
 *
 * @remarks
 * Este arreglo contiene tiendas representativas del portafolio EDM
 * ubicadas en principales centros comerciales de Colombia.
 *
 * El dataset incluye distintos escenarios operativos para validar
 * la interfaz:
 * - tiendas abiertas
 * - tiendas con incidencia
 * - tiendas cerradas
 * - distintos niveles de ventas vs objetivo
 * - diferencias en cobertura de personal
 * - alertas de stock activas
 */
const STORES: StoreCard[] = [
  { id: "EDM-01", name: "Diesel Andino",         city: "Bogotá",       region: "Bogotá",       status: "open",     salesDay: 8_420_000, targetDay: 7_800_000, staff: { current: 4, scheduled: 4 }, stockAlerts: 0, topSeller: "D-Strukt slim jeans",   openSince: "10:00" },
  { id: "EDM-02", name: "Diesel El Tesoro",      city: "Medellín",     region: "Antioquia",    status: "incident", salesDay: 6_910_000, targetDay: 6_500_000, staff: { current: 3, scheduled: 4 }, stockAlerts: 2, topSeller: "1DR Shoulder Bag",      openSince: "10:00" },
  { id: "EDM-03", name: "Pilatos Fontanar",      city: "Bogotá",       region: "Bogotá",       status: "open",     salesDay: 5_340_000, targetDay: 5_800_000, staff: { current: 5, scheduled: 5 }, stockAlerts: 1, topSeller: "New Balance 574",       openSince: "10:00" },
  { id: "EDM-04", name: "Kipling Unicentro",     city: "Bogotá",       region: "Bogotá",       status: "open",     salesDay: 4_780_000, targetDay: 4_200_000, staff: { current: 3, scheduled: 3 }, stockAlerts: 0, topSeller: "Seoul Large Backpack",  openSince: "10:00" },
  { id: "EDM-05", name: "Superdry Prime Outlet", city: "Medellín",     region: "Antioquia",    status: "open",     salesDay: 3_920_000, targetDay: 4_500_000, staff: { current: 2, scheduled: 3 }, stockAlerts: 3, topSeller: "Vintage Logo hoodie",   openSince: "10:00" },
  { id: "EDM-06", name: "Pilatos Mayorca",       city: "Medellín",     region: "Antioquia",    status: "open",     salesDay: 6_150_000, targetDay: 5_900_000, staff: { current: 6, scheduled: 6 }, stockAlerts: 0, topSeller: "Custo Barcelona tee",   openSince: "10:00" },
  { id: "EDM-07", name: "Kipling Buenavista",    city: "Barranquilla", region: "Caribe",       status: "open",     salesDay: 2_980_000, targetDay: 3_200_000, staff: { current: 2, scheduled: 2 }, stockAlerts: 1, topSeller: "City Pack medium",      openSince: "10:00" },
  { id: "EDM-08", name: "Diesel Chipichape",     city: "Cali",         region: "Pacífico",     status: "incident", salesDay: 4_210_000, targetDay: 5_000_000, staff: { current: 3, scheduled: 4 }, stockAlerts: 2, topSeller: "Bmbx-Wave swim shorts", openSince: "10:00" },
  { id: "EDM-09", name: "Superdry Cacique",      city: "Bucaramanga",  region: "Santanderes",  status: "open",     salesDay: 2_640_000, targetDay: 2_800_000, staff: { current: 2, scheduled: 2 }, stockAlerts: 0, topSeller: "Osaka 6 jacket",        openSince: "10:00" },
  { id: "EDM-10", name: "Pilatos Paseo Villa",   city: "Bogotá",       region: "Bogotá",       status: "closed",   salesDay: 0,         targetDay: 3_500_000, staff: { current: 0, scheduled: 3 }, stockAlerts: 0, topSeller: "—",                    openSince: "—"     },
];

/**
 * Regiones disponibles derivadas del dataset de tiendas.
 *
 * @remarks
 * Se construye dinámicamente a partir de las regiones existentes,
 * eliminando duplicados y ordenándolas alfabéticamente.
 *
 * Esto permite que el filtro de región refleje siempre
 * el contenido actual del dataset.
 */
const REGIONS = Array.from(new Set(STORES.map(s => s.region))).sort();

/**
 * Configuración visual asociada al estado de una tienda.
 *
 * @remarks
 * Este objeto define el estilo semántico utilizado para cada estado:
 * - color del borde o anillo visual
 * - color del punto indicador
 * - etiqueta visible
 * - clases visuales de la etiqueta
 *
 * Se utiliza dentro de cada card para reforzar visualmente
 * la condición operativa del punto de venta.
 */
const STATUS_META: Record<StoreStatus, { ring: string; dot: string; label: string; labelCls: string }> = {
  open:     { ring: "ring-emerald-200", dot: "bg-emerald-400", label: "Abierta",    labelCls: "text-emerald-600 bg-emerald-50" },
  incident: { ring: "ring-rose-300",    dot: "bg-rose-500",    label: "Incidencia", labelCls: "text-rose-600 bg-rose-50"      },
  closed:   { ring: "ring-slate-200",   dot: "bg-slate-400",   label: "Cerrada",    labelCls: "text-slate-500 bg-slate-100"   },
};

/**
 * Configuración de los filtros de estado disponibles en la barra de filtros.
 *
 * @remarks
 * Incluye tanto el filtro global (`all`) como los estados operativos
 * específicos de tienda.
 *
 * El punto de color es opcional y se utiliza para reforzar
 * el reconocimiento visual del filtro.
 */
const STATUS_FILTERS: { value: StoreStatus | "all"; label: string; dot?: string }[] = [
  { value: "all",      label: "Todas"       },
  { value: "open",     label: "Abiertas",   dot: "bg-emerald-400" },
  { value: "incident", label: "Incidencia", dot: "bg-rose-500"    },
  { value: "closed",   label: "Cerradas",   dot: "bg-slate-400"   },
];

/**
 * Formatea un valor numérico como moneda en pesos colombianos.
 *
 * @param n Valor a formatear.
 * @returns Cadena formateada en COP sin decimales.
 *
 * @example
 * ```ts
 * fmt(8420000);
 * ```
 */
function fmt(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

/**
 * Propiedades del componente interno {@link FilterBar}.
 *
 * @property search Texto actual de búsqueda.
 * @property onSearch Callback para actualizar la búsqueda.
 * @property statusFilter Filtro actual por estado.
 * @property onStatus Callback para cambiar el estado filtrado.
 * @property regionFilter Región actualmente seleccionada.
 * @property onRegion Callback para cambiar la región filtrada.
 * @property resultCount Número de resultados visibles.
 * @property totalCount Número total de tiendas del dataset.
 * @property onClear Acción para limpiar todos los filtros.
 */
interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: StoreStatus | "all";
  onStatus: (v: StoreStatus | "all") => void;
  regionFilter: string;
  onRegion: (v: string) => void;
  resultCount: number;
  totalCount: number;
  onClear: () => void;
}

/**
 * Barra de filtros del grid de tiendas.
 *
 * @param props Propiedades del componente.
 * @returns Controles de búsqueda y filtrado del grid.
 *
 * @remarks
 * Este subcomponente centraliza la interacción de filtrado,
 * permitiendo combinar:
 * - búsqueda por texto
 * - filtro por estado
 * - filtro por región
 *
 * También muestra:
 * - número de resultados actuales
 * - número total de tiendas
 * - chips de filtros activos
 * - acción rápida para limpiar todos los filtros
 */
function FilterBar({ search, onSearch, statusFilter, onStatus, regionFilter, onRegion, resultCount, totalCount, onClear }: FilterBarProps) {
  const isDirty = search !== "" || statusFilter !== "all" || regionFilter !== "all";
  const activeFilters = [
    search !== "" && "búsqueda",
    statusFilter !== "all" && "estado",
    regionFilter !== "all" && "región"
  ].filter(Boolean);

  return (
    <div className="px-4 pt-3 pb-3 border-b border-slate-100 bg-slate-50/60">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 min-w-[160px] flex-1 max-w-[220px]">
          <Search className="h-3 w-3 text-slate-400 shrink-0" />
          <input
            value={search}
            onChange={e => onSearch(e.target.value)}
            placeholder="Buscar tienda o ciudad…"
            className="flex-1 bg-transparent text-[11px] text-slate-700 placeholder:text-slate-400 outline-none"
          />
          {search && (
            <button onClick={() => onSearch("")} className="text-slate-400 hover:text-slate-600 transition-colors">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1">
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => onStatus(f.value as StoreStatus | "all")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-all ${statusFilter === f.value ? "bg-slate-800 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"}`}
            >
              {f.dot && <span className={`h-1.5 w-1.5 rounded-full ${statusFilter === f.value ? "bg-white/70" : f.dot}`} />}
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <select
            value={regionFilter}
            onChange={e => onRegion(e.target.value)}
            className={`appearance-none rounded-lg border px-3 py-1.5 pr-7 text-[11px] font-semibold outline-none transition-all cursor-pointer ${regionFilter !== "all" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
          >
            <option value="all">Todas las regiones</option>
            {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <SlidersHorizontal className={`pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 ${regionFilter !== "all" ? "text-orange-400" : "text-slate-400"}`} />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {isDirty ? (
            <>
              <span className="text-[11px] text-slate-500">
                <span className="font-bold text-slate-700">{resultCount}</span> de {totalCount} tiendas
              </span>
              <button
                onClick={onClear}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all"
              >
                <X className="h-3 w-3" />Limpiar
              </button>
            </>
          ) : (
            <span className="text-[11px] text-slate-400">{totalCount} tiendas</span>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
          <span className="text-[10px] text-slate-400 font-medium">Filtros activos:</span>

          {search && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
              "{search}"
              <button onClick={() => onSearch("")}>
                <X className="h-2.5 w-2.5 text-slate-400 hover:text-slate-600" />
              </button>
            </span>
          )}

          {statusFilter !== "all" && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] text-slate-600 font-medium">
              {STATUS_FILTERS.find(f => f.value === statusFilter)?.label}
              <button onClick={() => onStatus("all")}>
                <X className="h-2.5 w-2.5 text-slate-400 hover:text-slate-600" />
              </button>
            </span>
          )}

          {regionFilter !== "all" && (
            <span className="flex items-center gap-1 rounded-full bg-orange-50 border border-orange-200 px-2 py-0.5 text-[10px] text-orange-700 font-medium">
              {regionFilter}
              <button onClick={() => onRegion("all")}>
                <X className="h-2.5 w-2.5 text-orange-400 hover:text-orange-600" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Estado vacío del grid cuando no hay resultados.
 *
 * @param props Propiedades del componente.
 * @param props.onClear Acción para limpiar todos los filtros.
 * @returns Un bloque visual de estado vacío.
 *
 * @remarks
 * Este subcomponente se muestra cuando la combinación de filtros
 * no devuelve coincidencias.
 *
 * Ofrece una acción directa para restablecer el estado del grid.
 */
function EmptyGrid({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4">
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        <Store className="h-5 w-5 text-slate-400" />
      </span>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-slate-600">Sin resultados</p>
        <p className="text-[11px] text-slate-400 mt-0.5">No hay tiendas que coincidan con los filtros aplicados</p>
      </div>
      <button
        onClick={onClear}
        className="rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-[12px] font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all"
      >
        Limpiar filtros
      </button>
    </div>
  );
}

/**
 * Grid principal de estado operativo de tiendas.
 *
 * @returns Un componente visual con tarjetas filtrables de tiendas.
 *
 * @remarks
 * Este componente presenta la red de tiendas en formato de cards,
 * priorizando una lectura rápida del estado operativo y comercial
 * de cada punto de venta.
 *
 * El flujo general del componente es:
 *
 * 1. Mantener el estado de filtros:
 *    - búsqueda
 *    - estado
 *    - región
 *
 * 2. Derivar el subconjunto visible de tiendas mediante `useMemo`
 *    para evitar recomputaciones innecesarias.
 *
 * 3. Renderizar:
 *    - cabecera general con métricas resumidas
 *    - barra de filtros
 *    - estado vacío si no hay resultados
 *    - grid de tarjetas si existen coincidencias
 *
 * Cada card muestra:
 * - nombre y ubicación
 * - estado operativo
 * - ventas del día frente al objetivo
 * - nivel de cumplimiento
 * - dotación de personal
 * - alertas de stock
 * - incidencia activa cuando aplica
 *
 * Esta vista resulta útil para:
 * - seguimiento rápido de tiendas
 * - supervisión regional
 * - monitoreo de incidencias
 * - revisión de cumplimiento diario
 *
 * @example
 * ```tsx
 * <TiendasStoreGrid />
 * ```
 */
export default function TiendasStoreGrid() {
  /**
   * Texto de búsqueda aplicado al grid.
   */
  const [search, setSearch] = useState("");

  /**
   * Estado operativo actualmente filtrado.
   */
  const [statusFilter, setStatusFilter] = useState<StoreStatus | "all">("all");

  /**
   * Región actualmente seleccionada.
   */
  const [regionFilter, setRegionFilter] = useState("all");

  /**
   * Subconjunto de tiendas visible tras aplicar filtros.
   *
   * @remarks
   * Se calcula mediante `useMemo` para optimizar el rendimiento
   * del componente y evitar filtrados innecesarios en cada render.
   */
  const filtered = useMemo(() => STORES.filter(s => {
    const matchSearch = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const matchRegion = regionFilter === "all" || s.region === regionFilter;
    return matchSearch && matchStatus && matchRegion;
  }), [search, statusFilter, regionFilter]);

  /**
   * Restablece todos los filtros a su estado inicial.
   */
  function clearAll() {
    setSearch("");
    setStatusFilter("all");
    setRegionFilter("all");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50">
            <Store className="h-3.5 w-3.5 text-orange-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Estado operativo de tiendas</p>
            <p className="text-[11px] text-slate-400">
              {STORES.filter(s => s.status === "open").length} abiertas ·{" "}
              <span className="text-rose-500 font-semibold">{STORES.filter(s => s.status === "incident").length} con incidencia</span>
            </p>
          </div>
        </div>
        <a href="/tiendas" className="text-[12px] font-medium text-orange-600 hover:text-orange-700 transition-colors">
          Ver todas →
        </a>
      </div>

      <FilterBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatus={setStatusFilter}
        regionFilter={regionFilter}
        onRegion={setRegionFilter}
        resultCount={filtered.length}
        totalCount={STORES.length}
        onClear={clearAll}
      />

      {filtered.length === 0 ? (
        <EmptyGrid onClear={clearAll} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4">
          {filtered.map(store => {
            const sc = STATUS_META[store.status];
            const pct = store.status === "closed" ? 0 : Math.min(Math.round((store.salesDay / store.targetDay) * 100), 100);
            const above = store.salesDay >= store.targetDay;
            const staffOk = store.staff.current >= store.staff.scheduled;

            return (
              <a
                key={store.id}
                href={`/tiendas/${store.id}`}
                className={`group flex flex-col gap-3 rounded-xl border bg-white p-4 ring-1 ${sc.ring} transition-all hover:shadow-md hover:-translate-y-0.5`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${sc.dot} ${store.status === "open" ? "animate-pulse" : ""}`} />
                      <p className="text-[12px] font-bold text-slate-800">{store.name}</p>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{store.city} · {store.region}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${sc.labelCls}`}>{sc.label}</span>
                </div>

                <div>
                  <div className="flex items-end justify-between mb-1">
                    <p className="text-[15px] font-bold text-slate-800 leading-none">
                      {store.status === "closed" ? "—" : fmt(store.salesDay)}
                    </p>
                    {store.status !== "closed" && (
                      <span className={`flex items-center gap-0.5 text-[10px] font-bold ${above ? "text-emerald-600" : "text-rose-500"}`}>
                        {above ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                        {pct}%
                      </span>
                    )}
                  </div>

                  <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${above ? "bg-emerald-500" : pct >= 80 ? "bg-amber-400" : "bg-rose-400"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-slate-400 mt-1">objetivo {fmt(store.targetDay)}</p>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <div className={`flex items-center gap-1 text-[11px] font-medium ${staffOk ? "text-slate-500" : "text-amber-600"}`}>
                    <Users className="h-3 w-3" />
                    <span>{store.staff.current}/{store.staff.scheduled}</span>
                  </div>

                  {store.stockAlerts > 0 && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500">
                      <Package className="h-3 w-3" />
                      <span>{store.stockAlerts} stock</span>
                    </div>
                  )}

                  {store.status === "incident" && (
                    <div className="flex items-center gap-1 text-[11px] font-medium text-rose-500 ml-auto">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Incidencia</span>
                    </div>
                  )}

                  <TrendingUp className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 ml-auto transition" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}