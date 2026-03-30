"use client";

import { useState } from "react";
import { Truck, Search, Filter, ChevronRight, Clock, CheckCircle2, Loader2 } from "lucide-react";

type Shipment = {
  id:        string;
  client:    string;
  origin:    string;
  dest:      string;
  carrier:   string;
  status:    "transit" | "delivered" | "delayed" | "processing";
  eta:       string;
  packages:  number;
  weight:    string;
};

const SHIPMENTS: Shipment[] = [
  { id: "SHP-00921", client: "Distribuciones Norte S.L.",  origin: "Madrid",   dest: "Bilbao",     carrier: "MRW",      status: "transit",    eta: "14 Mar",  packages: 8,  weight: "42 kg"  },
  { id: "SHP-00920", client: "Ferretería Central",         origin: "Valencia", dest: "Murcia",     carrier: "Correos",  status: "delivered",  eta: "Entregado",packages: 3, weight: "11 kg"  },
  { id: "SHP-00919", client: "Almacenes del Sur",          origin: "Sevilla",  dest: "Cádiz",      carrier: "GLS",      status: "delayed",    eta: "15 Mar",  packages: 12, weight: "78 kg"  },
  { id: "SHP-00918", client: "Tecno Hogar S.A.",           origin: "Barcelona",dest: "Tarragona",  carrier: "SEUR",     status: "processing", eta: "13 Mar",  packages: 5,  weight: "29 kg"  },
  { id: "SHP-00917", client: "Moda Express",               origin: "Zaragoza", dest: "Huesca",     carrier: "DHL",      status: "transit",    eta: "13 Mar",  packages: 22, weight: "15 kg"  },
  { id: "SHP-00916", client: "Grupo Alimentario Ibérico",  origin: "Burgos",   dest: "Valladolid", carrier: "MRW",      status: "delivered",  eta: "Entregado",packages: 7, weight: "95 kg"  },
  { id: "SHP-00915", client: "Electrodomésticos Plus",     origin: "Madrid",   dest: "Toledo",     carrier: "SEUR",     status: "transit",    eta: "14 Mar",  packages: 4,  weight: "63 kg"  },
  { id: "SHP-00914", client: "Papelería Norma",            origin: "Alicante", dest: "Benidorm",   carrier: "Correos",  status: "delayed",    eta: "16 Mar",  packages: 9,  weight: "22 kg"  },
];

const STATUS_CONFIG = {
  transit:    { label: "En tránsito",  color: "bg-sky-50 text-sky-700 border-sky-100",      icon: Truck        },
  delivered:  { label: "Entregado",    color: "bg-emerald-50 text-emerald-700 border-emerald-100", icon: CheckCircle2 },
  delayed:    { label: "Retrasado",    color: "bg-rose-50 text-rose-700 border-rose-100",   icon: Clock        },
  processing: { label: "Procesando",   color: "bg-amber-50 text-amber-700 border-amber-100", icon: Loader2     },
};

const FILTERS = ["Todos", "En tránsito", "Retrasados", "Entregados", "Procesando"] as const;
type FilterKey = typeof FILTERS[number];

const filterMap: Record<FilterKey, Shipment["status"] | null> = {
  "Todos":        null,
  "En tránsito":  "transit",
  "Retrasados":   "delayed",
  "Entregados":   "delivered",
  "Procesando":   "processing",
};

export default function LogisticaShipmentsCard() {
  const [search, setSearch]       = useState("");
  const [activeFilter, setFilter] = useState<FilterKey>("Todos");

  const filtered = SHIPMENTS.filter((s) => {
    const matchStatus = filterMap[activeFilter] ? s.status === filterMap[activeFilter] : true;
    const q = search.toLowerCase();
    const matchSearch = !q || s.id.toLowerCase().includes(q) || s.client.toLowerCase().includes(q) || s.dest.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50">
            <Truck className="h-3.5 w-3.5 text-sky-600" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Envíos activos</p>
            <p className="text-[11px] text-slate-400">{filtered.length} de {SHIPMENTS.length} registros</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar envío..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-[12px] rounded-lg border border-slate-200 bg-slate-50 text-slate-700 placeholder-slate-400 outline-none focus:border-sky-300 focus:bg-white transition w-44"
            />
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-[12px] font-medium text-slate-600 hover:bg-slate-100 transition">
            <Filter className="h-3.5 w-3.5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all ${
              activeFilter === f
                ? "bg-sky-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/40">
              {["ID Envío", "Cliente", "Origen → Destino", "Transportista", "Estado", "ETA", "Bultos", ""].map((h) => (
                <th key={h} className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map((s) => {
              const cfg = STATUS_CONFIG[s.status];
              const Icon = cfg.icon;
              return (
                <tr key={s.id} className="hover:bg-slate-50/70 transition-colors group">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-600 whitespace-nowrap">{s.id}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium max-w-[180px] truncate">{s.client}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    <span className="text-slate-400">{s.origin}</span>
                    <span className="mx-1 text-slate-300">→</span>
                    <span className="font-medium">{s.dest}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{s.carrier}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${cfg.color}`}>
                      <Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{s.eta}</td>
                  <td className="px-4 py-3 text-slate-500">{s.packages} bultos · {s.weight}</td>
                  <td className="px-4 py-3">
                    <button className="flex items-center gap-0.5 text-sky-500 opacity-0 group-hover:opacity-100 transition text-[11px] font-medium">
                      Ver <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-400">
            No se encontraron envíos con ese criterio.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
        <p className="text-[11px] text-slate-400">Mostrando {filtered.length} envíos</p>
        <a href="/logistica/envios" className="text-[12px] font-medium text-sky-600 hover:text-sky-700 transition-colors">
          Ver todos los envíos →
        </a>
      </div>
    </div>
  );
}