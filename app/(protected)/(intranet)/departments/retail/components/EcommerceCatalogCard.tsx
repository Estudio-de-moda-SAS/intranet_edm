/**
 * @module EcommerceCatalogCard
 * Tarjeta de catálogo e inventario del canal E-Commerce.
 *
 * @remarks
 * Este componente renderiza una vista resumida del estado del catálogo
 * digital, combinando indicadores generales de inventario con un listado
 * de productos destacados por ventas del mes.
 *
 * Su propósito es ofrecer una lectura rápida del estado del surtido online,
 * permitiendo identificar:
 * - volumen general del catálogo activo
 * - productos con stock bajo o agotado
 * - borradores pendientes de publicación
 * - desempeño comercial de referencias destacadas
 *
 * La información presentada es estática y funciona como mock de interfaz.
 * En una implementación productiva, estos datos podrían provenir de:
 * - PIM (Product Information Management)
 * - plataforma de e-commerce
 * - sistemas de inventario
 * - analítica de ventas por SKU
 */

import { Package, ArrowRight, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

/**
 * Estados posibles de una referencia dentro del catálogo digital.
 *
 * @remarks
 * Este tipo representa la condición operativa de una referencia
 * dentro del canal e-commerce, considerando disponibilidad y publicación.
 */
type ProductStatus = "active" | "low_stock" | "out_of_stock" | "draft";

/**
 * Representa un producto destacado dentro del catálogo e-commerce.
 *
 * @remarks
 * Este tipo modela una referencia del catálogo con datos mínimos
 * para mostrar su estado comercial e inventario.
 *
 * Incluye:
 * - identificación del producto
 * - categoría
 * - precio
 * - stock disponible
 * - volumen vendido
 * - estado actual
 * - tendencia de desempeño
 *
 * @property name Nombre del producto.
 * @property sku Identificador único de la referencia.
 * @property category Categoría comercial del producto.
 * @property price Precio unitario.
 * @property stock Unidades disponibles en inventario.
 * @property sold Cantidad vendida en el período analizado.
 * @property status Estado operativo del producto.
 * @property trend Variación porcentual del desempeño comercial.
 */
type Product = {
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  sold: number;
  status: ProductStatus;
  trend: number;
};

/**
 * Configuración visual asociada a cada estado de producto.
 *
 * @remarks
 * Este objeto centraliza la semántica visual de los estados
 * de una referencia del catálogo.
 *
 * Para cada estado se define:
 * - fondo del badge
 * - color de texto
 * - etiqueta visible
 *
 * Esto permite representar de forma consistente estados como:
 * - activo
 * - stock bajo
 * - sin stock
 * - borrador
 */
const STATUS_CONFIG: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  active:       { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Activo"     },
  low_stock:    { bg: "bg-amber-50 border-amber-100",     text: "text-amber-700",   label: "Stock bajo" },
  out_of_stock: { bg: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Sin stock"  },
  draft:        { bg: "bg-slate-50 border-slate-200",     text: "text-slate-500",   label: "Borrador"   },
};

/**
 * Dataset estático de productos destacados del catálogo.
 *
 * @remarks
 * Este arreglo contiene referencias representativas del catálogo online
 * utilizadas para poblar el bloque de productos más vendidos del mes.
 *
 * Incluye distintos escenarios operativos para validar la interfaz:
 * - productos activos con buen desempeño
 * - referencias con stock bajo
 * - productos agotados
 * - tendencias positivas y negativas
 */
const PRODUCTS: Product[] = [
  { name: "Camisa Lino Premium",       sku: "CAM-LIN-001", category: "Camisas",    price: 89900,  stock: 142, sold: 284, status: "active",       trend: +22 },
  { name: "Jean Skinny Azul Oscuro",   sku: "JEA-SKN-004", category: "Denim",      price: 129900, stock: 8,   sold: 196, status: "low_stock",    trend: +15 },
  { name: "Vestido Floral Midi",       sku: "VES-FLO-012", category: "Vestidos",   price: 149900, stock: 0,   sold: 167, status: "out_of_stock", trend: -5  },
  { name: "Blazer Estructurado Negro", sku: "BLZ-EST-002", category: "Outerwear",  price: 219900, stock: 54,  sold: 128, status: "active",       trend: +8  },
  { name: "Pantalón Cargo Verde",      sku: "PAN-CAR-007", category: "Pantalones", price: 109900, stock: 3,   sold: 112, status: "low_stock",    trend: +31 },
];

/**
 * Representa una métrica resumida del catálogo.
 *
 * @property label Etiqueta descriptiva del indicador.
 * @property value Valor visible de la métrica.
 * @property color Clase visual aplicada al valor.
 *
 * @remarks
 * Este tipo se utiliza para modelar los KPIs compactos
 * mostrados en la franja superior del componente.
 */
type CatalogStat = {
  label: string;
  value: string;
  color: string;
};

/**
 * KPIs resumidos del estado del catálogo.
 *
 * @remarks
 * Este arreglo define los indicadores visibles en la franja superior
 * de la tarjeta, proporcionando una lectura rápida del inventario:
 * - productos activos
 * - referencias con stock bajo
 * - referencias agotadas
 * - borradores
 */
const CATALOG_STATS: CatalogStat[] = [
  { label: "Productos activos", value: "843", color: "text-emerald-600" },
  { label: "Stock bajo",        value: "38",  color: "text-amber-600"   },
  { label: "Sin stock",         value: "12",  color: "text-rose-500"    },
  { label: "Borradores",        value: "24",  color: "text-slate-400"   },
];

/**
 * Tarjeta de catálogo y stock del canal e-commerce.
 *
 * @returns Un componente visual con métricas de catálogo, alerta operativa y productos destacados.
 *
 * @remarks
 * Este componente organiza la información del catálogo digital
 * en tres bloques principales:
 *
 * 1. **Header**
 *    - presenta el título del panel
 *    - ofrece acceso directo a la gestión del catálogo
 *
 * 2. **Franja de métricas**
 *    - resume el estado global del catálogo
 *    - destaca activos, stock bajo, agotados y borradores
 *
 * 3. **Contenido operativo**
 *    - muestra una alerta rápida de productos agotados con visitas activas
 *    - presenta el listado de productos más vendidos del mes
 *    - combina desempeño comercial con estado de inventario
 *
 * Esta tarjeta resulta útil para:
 * - monitoreo rápido del surtido online
 * - detección de quiebres de stock
 * - seguimiento de referencias de alto impacto
 * - coordinación entre catálogo, inventario y ventas
 *
 * @example
 * ```tsx
 * <EcommerceCatalogCard />
 * ```
 */
export default function EcommerceCatalogCard() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
            <Package className="h-3.5 w-3.5 text-violet-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Catálogo y Stock</h2>
        </div>
        <Link href="/ecommerce/catalogo" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">
          Gestionar <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Catalog stats strip */}
      <div className="grid grid-cols-4 divide-x divide-slate-100 border-b border-slate-100">
        {CATALOG_STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center gap-0.5 py-3 hover:bg-slate-50 transition-colors">
            <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 text-center leading-tight px-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alert banner */}
      <div className="mx-4 mt-3 flex items-center gap-2 rounded-lg bg-rose-50 border border-rose-100 px-3 py-2">
        <AlertCircle className="h-3.5 w-3.5 text-rose-500 shrink-0" />
        <p className="text-[12px] text-rose-700">
          <span className="font-semibold">12 productos sin stock</span> están recibiendo visitas actualmente
        </p>
      </div>

      {/* Top products */}
      <div className="p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">Más vendidos — este mes</p>
        <ul className="space-y-2">
          {PRODUCTS.map((p, i) => {
            const cfg = STATUS_CONFIG[p.status];

            return (
              <li key={p.sku} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5 hover:border-indigo-200 hover:bg-indigo-50/20 transition-all cursor-pointer">
                <span className="w-5 shrink-0 text-center text-[12px] font-bold text-slate-300 tabular-nums">
                  {i + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-400">{p.category} · SKU: {p.sku}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${p.trend >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {p.trend >= 0
                      ? <TrendingUp className="h-3 w-3" />
                      : <TrendingDown className="h-3 w-3" />}
                    {p.trend > 0 ? "+" : ""}{p.trend}%
                  </span>
                  <span className={`rounded-full border px-2 py-px text-[10px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    {cfg.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

    </div>
  );
}