/**
 * @module RetailDashboardTabs
 * Navegación por tabs para dashboards analíticos del módulo de Retail.
 *
 * @remarks
 * Este componente renderiza una barra de pestañas para alternar
 * entre los dashboards analíticos de los distintos canales del área
 * de Retail:
 * - Comercial
 * - E-Commerce
 * - Tiendas
 *
 * Su función principal es gestionar el estado local del canal activo
 * y renderizar exclusivamente el dashboard correspondiente.
 *
 * A nivel de experiencia de usuario, este componente permite:
 * - cambiar de contexto analítico sin salir de la vista actual
 * - mantener una navegación simple y directa por canal
 * - reutilizar una misma estructura contenedora para distintos dashboards
 *
 * Este componente se ejecuta en cliente porque utiliza `useState`
 * para controlar la pestaña activa.
 */

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

/**
 * Identificadores válidos de los tabs del dashboard Retail.
 *
 * @remarks
 * Este tipo restringe los canales disponibles en la navegación
 * y garantiza consistencia entre:
 * - estado local del componente
 * - configuración de tabs
 * - render condicional del panel activo
 */
type Tab = "comercial" | "ecommerce" | "tiendas";

/**
 * Configuración visual y funcional de los tabs del dashboard.
 *
 * @remarks
 * Este arreglo define las opciones disponibles en la barra de navegación
 * del componente.
 *
 * Cada elemento contiene:
 * - identificador interno del canal
 * - etiqueta visible
 * - ícono representativo
 * - estilos visuales para estado normal
 * - estilos visuales para estado activo
 *
 * Centralizar esta configuración permite:
 * - evitar repetición en el render
 * - facilitar mantenimiento de la barra
 * - mantener consistencia visual entre tabs
 */
const TABS: {
  id: Tab;
  label: string;
  icon: React.ElementType;
  color: string;
  activeColor: string;
  activeBg: string;
}[] = [
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

/**
 * Componente de tabs para navegación entre dashboards de Retail.
 *
 * @returns Una interfaz con barra de tabs y el dashboard del canal seleccionado.
 *
 * @remarks
 * Este componente mantiene el estado local del tab activo
 * y utiliza renderizado condicional para mostrar únicamente
 * el dashboard correspondiente al canal seleccionado.
 *
 * Flujo general:
 *
 * 1. Inicializa el canal activo en `comercial`
 * 2. Renderiza la barra de navegación a partir de {@link TABS}
 * 3. Permite cambiar el tab activo mediante interacción del usuario
 * 4. Muestra el dashboard asociado al canal seleccionado
 *
 * La estructura se divide en dos bloques:
 * - **Tab bar**: navegación visual entre canales
 * - **Panel activo**: contenedor del dashboard actualmente visible
 *
 * Esta aproximación resulta útil para:
 * - dashboards analíticos multicanal
 * - comparación por canal dentro de una misma vista
 * - navegación ligera sin routing adicional
 *
 * @example
 * ```tsx
 * <RetailDashboardTabs />
 * ```
 */
export function RetailDashboardTabs() {
  /**
   * Tab actualmente activo en la navegación del dashboard.
   *
   * @remarks
   * Controla qué panel analítico se renderiza dentro del contenedor principal.
   * El valor inicial corresponde al canal comercial.
   */
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