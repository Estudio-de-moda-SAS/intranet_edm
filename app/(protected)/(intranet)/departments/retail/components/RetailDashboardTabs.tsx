"use client";

// RetailDashboardTabs.tsx
// Client Component — gestiona el tab activo con useState.
// Renderiza el dashboard del canal seleccionado.
// Los dashboards hijos (Commercial, Ecommerce, Tiendas) son Server Components
// pero aquí se importan en un contexto cliente; Next.js los trata como
// Client Components en este árbol — si necesitas SSR puro, usa dynamic() con ssr:true.

import { useState } from "react";
import { TrendingUp, ShoppingCart, Store } from "lucide-react";

// ── Dashboards de canal (existentes) ─────────────────────────────
import CommercialDashboard from "./CommercialDashboard";
import EcommerceDashboard  from "./EcommerceDashboard";
import TiendasDashboard    from "./StoreDashboard";

// ── Types ─────────────────────────────────────────────────────────

type Tab = "comercial" | "ecommerce" | "tiendas";

const TABS: { id: Tab; label: string; icon: React.ElementType; color: string; activeColor: string; activeBg: string }[] = [
  {
    id:          "comercial",
    label:       "Comercial",
    icon:        TrendingUp,
    color:       "text-slate-500",
    activeColor: "text-emerald-700",
    activeBg:    "bg-emerald-50 border-emerald-200",
  },
  {
    id:          "ecommerce",
    label:       "E-Commerce",
    icon:        ShoppingCart,
    color:       "text-slate-500",
    activeColor: "text-orange-700",
    activeBg:    "bg-orange-50 border-orange-200",
  },
  {
    id:          "tiendas",
    label:       "Tiendas",
    icon:        Store,
    color:       "text-slate-500",
    activeColor: "text-indigo-700",
    activeBg:    "bg-indigo-50 border-indigo-200",
  },
];

// ── Component ─────────────────────────────────────────────────────

export function RetailDashboardTabs() {
  const [active, setActive] = useState<Tab>("comercial");

  return (
    <div>

      {/* ── Tab bar ─────────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 border-b border-slate-100 pb-3">
        {TABS.map((tab) => {
          const Icon     = tab.icon;
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActive(tab.id)}
              className={`
                inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5
                text-[12px] font-semibold transition-all duration-150
                ${isActive
                  ? `${tab.activeBg} ${tab.activeColor} shadow-sm`
                  : "border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                }
              `}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Panel activo ─────────────────────────────────────────── */}
      <div className="min-h-[320px]">
        {active === "comercial"  && <CommercialDashboard />}
        {active === "ecommerce"  && <EcommerceDashboard  />}
        {active === "tiendas"    && <TiendasDashboard    />}
      </div>

    </div>
  );
}