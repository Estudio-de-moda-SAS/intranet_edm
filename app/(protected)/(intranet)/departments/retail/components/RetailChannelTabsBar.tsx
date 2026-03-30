"use client";

// RetailChannelTabsBar.tsx
// Cambios respecto al original:
//   1. RetailChannelTabsBar acepta props opcionales showCommercial/Ecommerce/Stores
//      para ocultar tabs según el nivel de acceso del usuario.
//   2. RetailChannelProvider acepta defaultChannel para iniciar en el primer
//      tab visible (evita que el canal activo sea uno que el usuario no ve).

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { TrendingUp, ShoppingCart, Store } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────

export type ChannelId = "comercial" | "ecommerce" | "tiendas";

type RetailChannelCtx = {
  active:    ChannelId;
  setActive: (id: ChannelId) => void;
};

// ── Context ───────────────────────────────────────────────────────

const RetailChannelContext = createContext<RetailChannelCtx>({
  active:    "comercial",
  setActive: () => {},
});

export function useRetailChannel() {
  return useContext(RetailChannelContext);
}

// ── Provider ──────────────────────────────────────────────────────

interface RetailChannelProviderProps {
  children:       ReactNode;
  defaultChannel?: ChannelId;   // primer canal visible — lo calcula el Server Component
}

export function RetailChannelProvider({
  children,
  defaultChannel = "comercial",
}: RetailChannelProviderProps) {
  const [active, setActive] = useState<ChannelId>(defaultChannel);
  return (
    <RetailChannelContext.Provider value={{ active, setActive }}>
      {children}
    </RetailChannelContext.Provider>
  );
}

// ── Config de tabs ────────────────────────────────────────────────

const TABS: {
  id:           ChannelId;
  label:        string;
  sublabel:     string;
  icon:         React.ElementType;
  activeText:   string;
  activeBg:     string;
  activeBorder: string;
  dot:          string;
  indicator:    string;
}[] = [
  {
    id:           "comercial",
    label:        "Comercial",
    sublabel:     "B2B · Pipeline · Pedidos",
    icon:         TrendingUp,
    activeText:   "text-emerald-700",
    activeBg:     "bg-emerald-50",
    activeBorder: "border-emerald-200",
    dot:          "bg-emerald-500",
    indicator:    "bg-emerald-500",
  },
  {
    id:           "ecommerce",
    label:        "E-Commerce",
    sublabel:     "Online · Catálogo · Órdenes",
    icon:         ShoppingCart,
    activeText:   "text-orange-700",
    activeBg:     "bg-orange-50",
    activeBorder: "border-orange-200",
    dot:          "bg-orange-500",
    indicator:    "bg-orange-500",
  },
  {
    id:           "tiendas",
    label:        "Tiendas",
    sublabel:     "Físico · Operaciones · Stock",
    icon:         Store,
    activeText:   "text-indigo-700",
    activeBg:     "bg-indigo-50",
    activeBorder: "border-indigo-200",
    dot:          "bg-indigo-500",
    indicator:    "bg-indigo-500",
  },
];

// ── Tab Bar Props ─────────────────────────────────────────────────

interface RetailChannelTabsBarProps {
  showCommercial?: boolean;
  showEcommerce?:  boolean;
  showStores?:     boolean;
}

// ── Tab Bar Component ─────────────────────────────────────────────

export function RetailChannelTabsBar({
  showCommercial = true,
  showEcommerce  = true,
  showStores     = true,
}: RetailChannelTabsBarProps) {
  const { active, setActive } = useRetailChannel();

  // Filtrar tabs según permisos
  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === "comercial") return showCommercial;
    if (tab.id === "ecommerce") return showEcommerce;
    if (tab.id === "tiendas")   return showStores;
    return true;
  });

  return (
    <div className="sticky top-0 z-20 -mx-4 lg:-mx-14 px-4 lg:px-14 mb-1">
      <div className="border-b border-slate-200 bg-[#f4f6f9]/95 backdrop-blur-sm">

        <div className="flex items-end gap-1 pt-3">

          <span className="hidden sm:inline-block pb-3 pr-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">
            Canal
          </span>

          {visibleTabs.map((tab) => {
            const Icon     = tab.icon;
            const isActive = active === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`
                  group relative flex items-center gap-2 px-4 pb-3 pt-2
                  text-[13px] font-semibold transition-all duration-200
                  focus-visible:outline-none
                  ${isActive ? tab.activeText : "text-slate-500 hover:text-slate-700"}
                `}
              >
                <span
                  className={`
                    flex h-6 w-6 items-center justify-center rounded-md transition-colors duration-200
                    ${isActive ? tab.activeBg : "group-hover:bg-slate-100"}
                  `}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>

                <span>{tab.label}</span>

                {isActive && (
                  <span className="hidden md:inline text-[11px] font-normal opacity-60">
                    · {tab.sublabel}
                  </span>
                )}

                {isActive && (
                  <span className={`ml-1 h-1.5 w-1.5 rounded-full ${tab.dot}`} />
                )}

                <span
                  className={`
                    absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full
                    transition-all duration-200
                    ${isActive ? tab.indicator : "bg-transparent group-hover:bg-slate-200"}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}