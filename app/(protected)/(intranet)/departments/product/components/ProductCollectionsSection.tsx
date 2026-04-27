/**
 * @module ProductCollectionsSection
 * Sección de colecciones del módulo de Producto.
 *
 * @remarks
 * Este componente renderiza una vista resumida de las colecciones activas
 * del área de Producto, mostrando para cada una:
 * - estado general de temporada
 * - porcentaje de avance por referencias aprobadas
 * - listado de referencias destacadas
 * - estado individual de cada referencia
 * - acceso a fichas técnicas según permisos
 *
 * Su propósito es ofrecer una lectura operativa del avance de las colecciones
 * en curso, permitiendo identificar rápidamente:
 * - qué colecciones están activas o en desarrollo
 * - cuántas referencias han sido aprobadas
 * - qué referencias requieren seguimiento
 * - si existe o no ficha técnica asociada
 *
 * La información mostrada es estática y funciona como mock dentro de la intranet.
 * En una implementación productiva, estos datos podrían provenir de:
 * - sistemas PLM
 * - servicios de desarrollo de producto
 * - módulos de fichas técnicas
 * - fuentes internas de planeación de colecciones
 */

// app/product/components/ProductCollectionsSection.tsx
"use client";

import { Shirt, ChevronRight, FileText, Lock } from "lucide-react";
import Link from "next/link";

/**
 * Representa una referencia individual dentro de una colección.
 *
 * @remarks
 * Este tipo modela una unidad de producto o referencia específica
 * perteneciente a una colección.
 *
 * Cada referencia incluye:
 * - código identificador
 * - nombre comercial o descriptivo
 * - categoría funcional
 * - estado actual dentro del flujo de desarrollo
 * - indicador de existencia de ficha técnica
 *
 * El campo `hasFiche` permite condicionar la navegación o creación
 * de documentación técnica asociada a la referencia.
 *
 * @property code Código único de la referencia.
 * @property name Nombre descriptivo de la referencia.
 * @property category Categoría comercial o funcional del producto.
 * @property status Estado actual de desarrollo de la referencia.
 * @property hasFiche Indica si la referencia ya tiene ficha técnica asociada.
 */
type Reference = {
  code:     string;
  name:     string;
  category: string;
  status:   "development" | "sample_sent" | "approved" | "production" | "launched";
  hasFiche: boolean;
};

/**
 * Representa una colección del área de Producto.
 *
 * @remarks
 * Este tipo modela una colección completa dentro del calendario
 * de temporadas del negocio.
 *
 * Cada colección contiene:
 * - información de identificación
 * - datos de temporada
 * - estado general
 * - métricas agregadas de avance
 * - listado resumido de referencias
 *
 * El campo `approved` permite calcular el porcentaje de avance
 * respecto al total planificado de referencias (`total`).
 *
 * @property id Identificador único de la colección.
 * @property name Nombre visible de la colección.
 * @property season Código o abreviatura de temporada.
 * @property year Año comercial de la colección.
 * @property status Estado general de la colección.
 * @property total Total de referencias planificadas.
 * @property approved Cantidad de referencias aprobadas.
 * @property refs Listado resumido de referencias asociadas.
 */
type Collection = {
  id:       string;
  name:     string;
  season:   string;
  year:     number;
  status:   "active" | "development" | "closed";
  total:    number;
  approved: number;
  refs:     Reference[];
};

/**
 * Dataset estático de colecciones del módulo de Producto.
 *
 * @remarks
 * Este arreglo contiene colecciones representativas utilizadas
 * para poblar la sección de colecciones activas del dashboard.
 *
 * Incluye distintos escenarios operativos:
 * - colecciones activas en ejecución
 * - colecciones en desarrollo
 * - colecciones cerradas
 *
 * También incorpora referencias internas para ilustrar:
 * - distintos estados de producto
 * - disponibilidad de ficha técnica
 * - variedad de categorías
 *
 * Este dataset sirve como mock de interfaz y validación visual
 * del comportamiento del componente.
 */
const COLLECTIONS: Collection[] = [
  {
    id:       "ss25-principal",
    name:     "Primavera Verano 2025",
    season:   "SS-25",
    year:     2025,
    status:   "active",
    total:    128,
    approved: 84,
    refs: [
      { code: "BL-2501", name: "Blusa lino perforada",       category: "Blusas",     status: "approved",    hasFiche: true  },
      { code: "PA-2517", name: "Pantalón palazzo crêpe",      category: "Pantalones", status: "production",  hasFiche: true  },
      { code: "VE-2508", name: "Vestido lencero midi",        category: "Vestidos",   status: "sample_sent", hasFiche: true  },
      { code: "FA-2503", name: "Falda plisada organza",       category: "Faldas",     status: "development", hasFiche: false },
      { code: "AC-2511", name: "Cinturón macramé artesanal",  category: "Accesorios", status: "approved",    hasFiche: true  },
    ],
  },
  {
    id:       "resort25",
    name:     "Resort 2025",
    season:   "RST-25",
    year:     2025,
    status:   "development",
    total:    64,
    approved: 21,
    refs: [
      { code: "TR-2540", name: "Traje de baño entero cut-out", category: "Baño",      status: "sample_sent", hasFiche: true  },
      { code: "CU-2542", name: "Cubre-bikini kimono",          category: "Blusas",    status: "development", hasFiche: false },
      { code: "SH-2545", name: "Short bordado a mano",         category: "Pantalones",status: "approved",    hasFiche: true  },
    ],
  },
  {
    id:       "fw24-cierre",
    name:     "Otoño Invierno 2024",
    season:   "FW-24",
    year:     2024,
    status:   "closed",
    total:    112,
    approved: 112,
    refs: [],
  },
];

/**
 * Metadatos visuales asociados al estado de una referencia.
 *
 * @remarks
 * Este objeto centraliza la configuración visual de cada estado
 * del flujo de desarrollo de referencia.
 *
 * Para cada estado se define:
 * - una etiqueta legible para el usuario
 * - un color de indicador puntual
 * - clases CSS del badge correspondiente
 *
 * Esto permite mantener consistencia visual entre referencias
 * y simplifica el renderizado condicional dentro del listado.
 */
const STATUS_META = {
  development: { label: "En desarrollo",   dot: "bg-amber-400",   badge: "bg-amber-50   text-amber-700  border-amber-200"  },
  sample_sent: { label: "Muestra enviada", dot: "bg-sky-400",     badge: "bg-sky-50     text-sky-700    border-sky-200"    },
  approved:    { label: "Aprobada",        dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200"},
  production:  { label: "En producción",   dot: "bg-violet-400",  badge: "bg-violet-50  text-violet-700 border-violet-200" },
  launched:    { label: "Lanzada",         dot: "bg-slate-400",   badge: "bg-slate-50   text-slate-600  border-slate-200"  },
};

/**
 * Metadatos visuales asociados al estado general de una colección.
 *
 * @remarks
 * A diferencia de {@link STATUS_META}, este objeto describe
 * el estado global de la colección como unidad de negocio,
 * no el estado individual de sus referencias.
 *
 * Se utiliza en el encabezado de cada bloque de colección
 * para indicar si la temporada está:
 * - activa
 * - en desarrollo
 * - cerrada
 */
const SEASON_STATUS = {
  active:      { label: "Activa",      cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  development: { label: "Desarrollo",  cls: "bg-amber-50   text-amber-700   border-amber-200"   },
  closed:      { label: "Cerrada",     cls: "bg-slate-50   text-slate-500   border-slate-200"   },
};

/**
 * Propiedades del componente {@link ProductCollectionsSection}.
 *
 * @property showTechSheets Indica si el usuario puede acceder a la funcionalidad de fichas técnicas.
 *
 * @remarks
 * Este permiso no oculta la sección completa, pero sí condiciona
 * la interacción disponible sobre cada referencia:
 * - visualizar ficha existente
 * - crear ficha nueva
 * - o mostrar restricción visual de acceso
 */
type Props = { showTechSheets: boolean };

/**
 * Sección de colecciones activas del módulo de Producto.
 *
 * @param props Propiedades del componente.
 * @param props.showTechSheets Indica si se deben habilitar acciones relacionadas con fichas técnicas.
 * @returns Un bloque visual con colecciones activas, progreso y referencias.
 *
 * @remarks
 * Este componente organiza la información de colecciones en curso
 * y presenta para cada una un resumen operativo del estado de avance.
 *
 * Su comportamiento puede resumirse en los siguientes pasos:
 *
 * 1. **Clasificación de colecciones**
 *    Se separan las colecciones activas o en desarrollo
 *    de aquellas que ya fueron cerradas.
 *
 * 2. **Cálculo de avance**
 *    Para cada colección visible, se calcula el porcentaje
 *    de referencias aprobadas con base en `approved / total`.
 *
 * 3. **Render del encabezado de colección**
 *    Se muestra nombre, estado global, resumen cuantitativo
 *    y porcentaje de avance.
 *
 * 4. **Render del listado de referencias**
 *    Se muestra cada referencia con:
 *    - código
 *    - nombre
 *    - categoría
 *    - estado operativo
 *    - acceso o restricción a ficha técnica
 *
 * 5. **Control de permisos sobre fichas técnicas**
 *    El comportamiento del ícono final depende de `showTechSheets`:
 *    - si el usuario tiene acceso y existe ficha, puede verla
 *    - si tiene acceso pero no existe ficha, puede crearla
 *    - si no tiene acceso, se muestra un ícono de bloqueo
 *
 * Este componente es especialmente útil para:
 * - monitorear el avance de las colecciones
 * - detectar referencias sin ficha técnica
 * - revisar el estado de desarrollo por producto
 * - ofrecer acceso contextual a documentación técnica
 *
 * @example
 * ```tsx
 * <ProductCollectionsSection showTechSheets={true} />
 * ```
 */
export default function ProductCollectionsSection({ showTechSheets }: Props) {
  /**
   * Colecciones visibles que aún no se consideran cerradas.
   *
   * @remarks
   * Incluye colecciones activas y en desarrollo, que son
   * las que se muestran en la sección principal del componente.
   */
  const activeCols = COLLECTIONS.filter((c) => c.status !== "closed");

  /**
   * Colecciones ya cerradas.
   *
   * @remarks
   * No se renderizan como bloques principales dentro de la lista,
   * pero sí se tienen en cuenta para el resumen superior del encabezado.
   */
  const closedCols = COLLECTIONS.filter((c) => c.status === "closed");

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50">
            <Shirt className="h-3.5 w-3.5 text-amber-600" />
          </span>
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Colecciones activas</h2>
            <p className="text-[11px] text-slate-400">
              {activeCols.length} en curso · {closedCols.length} cerrada{closedCols.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Link
          href="/product/collections"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 hover:text-amber-700"
        >
          Ver todas <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Collections */}
      <div className="space-y-4">
        {activeCols.map((col) => {
          const pct = col.total > 0 ? Math.round((col.approved / col.total) * 100) : 0;
          const seasonMeta = SEASON_STATUS[col.status];

          return (
            <div
              key={col.id}
              className="rounded-xl border border-stone-100 bg-stone-50/50 p-4"
            >
              {/* Collection header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-semibold text-slate-800">{col.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${seasonMeta.cls}`}>
                      {seasonMeta.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    {col.season} · {col.total} referencias · {col.approved} aprobadas
                  </p>
                </div>
                <span className="text-lg font-bold text-slate-700 tabular-nums">{pct}%</span>
              </div>

              {/* Progress */}
              <div className="mb-3 h-1.5 w-full rounded-full bg-stone-200 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>

              {/* References list */}
              {col.refs.length > 0 && (
                <div className="space-y-1.5">
                  {col.refs.map((ref) => {
                    const sm = STATUS_META[ref.status];
                    return (
                      <div
                        key={ref.code}
                        className="group flex items-center gap-2.5 rounded-lg border border-stone-100 bg-white px-3 py-2 hover:border-amber-200 transition-colors"
                      >
                        <span className={`h-2 w-2 shrink-0 rounded-full ${sm.dot}`} />
                        <span className="w-16 shrink-0 text-[10px] font-mono font-semibold text-stone-400">
                          {ref.code}
                        </span>
                        <span className="flex-1 text-[12px] font-medium text-slate-700 truncate">
                          {ref.name}
                        </span>
                        <span className="text-[10px] text-stone-400 hidden sm:block">{ref.category}</span>
                        <span className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold ${sm.badge}`}>
                          {sm.label}
                        </span>

                        {/* Ficha técnica */}
                        {showTechSheets ? (
                          ref.hasFiche ? (
                            <Link
                              href={`/product/techsheets/${ref.code}`}
                              className="shrink-0 flex items-center gap-1 text-[10px] font-medium text-amber-600 hover:text-amber-700"
                              title="Ver ficha técnica"
                            >
                              <FileText className="h-3 w-3" />
                            </Link>
                          ) : (
                            <Link
                              href={`/product/techsheets/new?ref=${ref.code}`}
                              className="shrink-0 text-[10px] text-stone-300 hover:text-amber-500 transition-colors"
                              title="Crear ficha técnica"
                            >
                              <FileText className="h-3 w-3" />
                            </Link>
                          )
                        ) : (
                          <span title="Sin acceso a fichas técnicas">
                            <Lock className="h-3 w-3 shrink-0 text-stone-200" />
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}