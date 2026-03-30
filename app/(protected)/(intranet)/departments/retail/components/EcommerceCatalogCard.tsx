import { Package, ArrowRight, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type ProductStatus = "active" | "low_stock" | "out_of_stock" | "draft";

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

const STATUS_CONFIG: Record<ProductStatus, { bg: string; text: string; label: string }> = {
  active:       { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", label: "Activo"       },
  low_stock:    { bg: "bg-amber-50 border-amber-100",     text: "text-amber-700",   label: "Stock bajo"   },
  out_of_stock: { bg: "bg-rose-50 border-rose-100",       text: "text-rose-700",    label: "Sin stock"    },
  draft:        { bg: "bg-slate-50 border-slate-200",     text: "text-slate-500",   label: "Borrador"     },
};

const PRODUCTS: Product[] = [
  { name: "Camisa Lino Premium",        sku: "CAM-LIN-001", category: "Camisas",    price: 89900,  stock: 142, sold: 284, status: "active",       trend: +22 },
  { name: "Jean Skinny Azul Oscuro",    sku: "JEA-SKN-004", category: "Denim",      price: 129900, stock: 8,   sold: 196, status: "low_stock",    trend: +15 },
  { name: "Vestido Floral Midi",        sku: "VES-FLO-012", category: "Vestidos",   price: 149900, stock: 0,   sold: 167, status: "out_of_stock", trend: -5  },
  { name: "Blazer Estructurado Negro",  sku: "BLZ-EST-002", category: "Outerwear",  price: 219900, stock: 54,  sold: 128, status: "active",       trend: +8  },
  { name: "Pantalón Cargo Verde",       sku: "PAN-CAR-007", category: "Pantalones", price: 109900, stock: 3,   sold: 112, status: "low_stock",    trend: +31 },
];

type CatalogStat = { label: string; value: string; color: string };

const CATALOG_STATS: CatalogStat[] = [
  { label: "Productos activos",   value: "843",  color: "text-emerald-600" },
  { label: "Stock bajo",          value: "38",   color: "text-amber-600"   },
  { label: "Sin stock",           value: "12",   color: "text-rose-500"    },
  { label: "Borradores",          value: "24",   color: "text-slate-400"   },
];

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