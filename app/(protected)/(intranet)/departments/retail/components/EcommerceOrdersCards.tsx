"use client";

import { useState } from "react";
import {
  ShoppingCart, ArrowRight, CheckCircle, Clock,
  Truck, XCircle, Package, RefreshCw,
} from "lucide-react";
import Link from "next/link";

type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

type Order = {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: OrderStatus;
  time: string;
  channel: "web" | "app" | "marketplace";
  city: string;
};

const STATUS_CONFIG: Record<OrderStatus, { icon: React.ElementType; text: string; bg: string; border: string; label: string }> = {
  pending:    { icon: Clock,       text: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-100", label: "Pendiente"   },
  confirmed:  { icon: CheckCircle, text: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100",label: "Confirmado"  },
  processing: { icon: Package,     text: "text-indigo-600",  bg: "bg-indigo-50",  border: "border-indigo-100", label: "Preparando"  },
  shipped:    { icon: Truck,       text: "text-sky-600",     bg: "bg-sky-50",     border: "border-sky-100",    label: "En camino"   },
  delivered:  { icon: CheckCircle, text: "text-teal-600",    bg: "bg-teal-50",    border: "border-teal-100",   label: "Entregado"   },
  cancelled:  { icon: XCircle,     text: "text-rose-500",    bg: "bg-rose-50",    border: "border-rose-100",   label: "Cancelado"   },
  returned:   { icon: RefreshCw,   text: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-100", label: "Devuelto"    },
};

const CHANNEL_BADGE: Record<"web" | "app" | "marketplace", string> = {
  web:         "bg-indigo-50 text-indigo-600 border-indigo-100",
  app:         "bg-violet-50 text-violet-600 border-violet-100",
  marketplace: "bg-amber-50 text-amber-600 border-amber-100",
};

const ORDERS: Order[] = [
  { id: "#48812", customer: "María Rodríguez",  items: 3,  total: 148500, status: "pending",    time: "Hace 4m",   channel: "web",         city: "Bogotá"     },
  { id: "#48811", customer: "Carlos Herrera",   items: 1,  total: 89900,  status: "processing", time: "Hace 18m",  channel: "app",         city: "Medellín"   },
  { id: "#48810", customer: "Ana González",     items: 5,  total: 212000, status: "shipped",    time: "Hace 1h",   channel: "web",         city: "Cali"       },
  { id: "#48809", customer: "Luisa Martínez",   items: 2,  total: 95000,  status: "confirmed",  time: "Hace 2h",   channel: "marketplace", city: "Barranquilla"},
  { id: "#48808", customer: "Pedro Jiménez",    items: 4,  total: 178000, status: "delivered",  time: "Hace 3h",   channel: "app",         city: "Bogotá"     },
  { id: "#48807", customer: "Sofía Vargas",     items: 1,  total: 45000,  status: "cancelled",  time: "Hace 4h",   channel: "web",         city: "Pereira"    },
  { id: "#48806", customer: "Diego Morales",    items: 2,  total: 132000, status: "returned",   time: "Ayer",      channel: "marketplace", city: "Manizales"  },
];

type Filter = "all" | "pending" | "processing" | "shipped" | "cancelled";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all",        label: "Todos"      },
  { key: "pending",    label: "Pendientes" },
  { key: "processing", label: "Preparando" },
  { key: "shipped",    label: "En camino"  },
  { key: "cancelled",  label: "Cancelados" },
];

const fmt = (n: number) =>
  new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 })
    .format(n).replace("COP\u00a0", "$");

export default function EcommerceOrdersCard() {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = filter === "all"
    ? ORDERS
    : ORDERS.filter((o) => o.status === filter);

  const pendingCount = ORDERS.filter((o) => o.status === "pending").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50">
            <ShoppingCart className="h-3.5 w-3.5 text-indigo-600" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">Pedidos en Tiempo Real</h2>
          {pendingCount > 0 && (
            <span className="rounded-full bg-amber-50 border border-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
              {pendingCount} sin atender
            </span>
          )}
        </div>
        <Link href="/ecommerce/pedidos" className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-indigo-600 transition-colors">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 px-5 py-3 border-b border-slate-100 overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-150 ${
              filter === f.key
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <ul className="divide-y divide-slate-50">
        {filtered.map((order) => {
          const cfg  = STATUS_CONFIG[order.status];
          const Icon = cfg.icon;
          return (
            <li key={order.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors cursor-pointer">

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-indigo-600 tabular-nums">{order.id}</span>
                  <p className="text-[13px] font-semibold text-slate-800 truncate">{order.customer}</p>
                  <span className={`shrink-0 rounded-full border px-2 py-px text-[10px] font-semibold ${CHANNEL_BADGE[order.channel]}`}>
                    {order.channel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {order.items} {order.items === 1 ? "producto" : "productos"} · {order.city} · {order.time}
                </p>
              </div>

              <span className="text-[13px] font-bold text-slate-800 tabular-nums shrink-0">
                {fmt(order.total)}
              </span>

              <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                <Icon className="h-3 w-3" />
                {cfg.label}
              </span>

            </li>
          );
        })}
      </ul>

    </div>
  );
}