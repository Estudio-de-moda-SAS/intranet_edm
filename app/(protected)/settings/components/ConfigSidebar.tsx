/**
 * @module app/settings/ConfigSidebar
 * Sidebar de navegación entre pestañas de la página de configuración
 * personal de la intranet EDM.
 *
 * @remarks
 * Renderiza la lista de pestañas disponibles como botones navegables,
 * destacando visualmente la pestaña activa con el color de acento
 * corporativo. Soporta modo oscuro mediante clases `dark:` de Tailwind.
 *
 * Es un componente controlado — no gestiona estado propio. La pestaña
 * activa y el callback de cambio se reciben desde {@link ConfigShell}
 * que actúa como coordinador del estado de la página de configuración.
 */

"use client";

import { Bell, Palette, Accessibility, Plug } from "lucide-react";
import type { ConfigTab } from "@/config/settings";

// ── Constantes ────────────────────────────────────────────────────────────────

/**
 * Definición de las pestañas disponibles en la página de configuración.
 *
 * @remarks
 * Cada entrada define el identificador de la pestaña, su etiqueta
 * visible, el ícono de Lucide React y una descripción corta mostrada
 * como subtítulo en el botón del sidebar.
 *
 * El orden de este array determina el orden visual de los botones
 * en el sidebar — modificarlo cambia directamente la UI sin necesidad
 * de tocar el componente.
 */
const TABS: {
  /** Identificador de la pestaña según {@link ConfigTab}. */
  id: ConfigTab;
  /** Etiqueta visible en el botón del sidebar. */
  label: string;
  /** Componente de ícono de Lucide React. */
  Icon: React.ElementType;
  /** Descripción corta mostrada como subtítulo del botón. */
  description: string;
}[] = [
  {
    id:          "notifications",
    label:       "Notificaciones",
    Icon:        Bell,
    description: "Canales y eventos",
  },
  {
    id:          "appearance",
    label:       "Apariencia",
    Icon:        Palette,
    description: "Tema y densidad",
  },
  {
    id:          "accessibility",
    label:       "Accesibilidad",
    Icon:        Accessibility,
    description: "Fuente y contraste",
  },
  {
    id:          "integrations",
    label:       "Integraciones",
    Icon:        Plug,
    description: "Apps conectadas",
  },
];

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link ConfigSidebar}.
 */
interface Props {
  /**
   * Identificador de la pestaña actualmente activa.
   * Determina qué botón se resalta con el color de acento.
   */
  activeTab: ConfigTab;

  /**
   * Callback invocado cuando el colaborador selecciona una pestaña.
   * El padre ({@link ConfigShell}) actualiza `activeTab` en respuesta.
   *
   * @param tab - Identificador de la pestaña seleccionada.
   */
  onTabChange: (tab: ConfigTab) => void;
}

// ── Componente ────────────────────────────────────────────────────────────────

/**
 * Sidebar de navegación de la página de configuración personal.
 *
 * @remarks
 * Renderiza un `<nav>` con un botón por cada pestaña definida en
 * {@link TABS}. El botón activo se distingue visualmente con fondo
 * violeta, texto blanco y sombra de color. Los botones inactivos
 * muestran un estado hover con fondo slate.
 *
 * Cada botón incluye `aria-current="page"` cuando está activo para
 * mejorar la accesibilidad con lectores de pantalla.
 *
 * La posición sticky del sidebar se calcula dinámicamente usando
 * `var(--header-h)` publicada por `useHeaderHeight` en
 * {@link ConfigShell}, con fallback a `64px` para SSR.
 *
 * @param props - Ver {@link Props}.
 *
 * @example
 * ```tsx
 * <ConfigSidebar
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 * />
 * ```
 */
export function ConfigSidebar({ activeTab, onTabChange }: Props) {
  return (
    <aside className="w-full lg:w-56 shrink-0">
      <nav
        className="space-y-1"
        style={{ top: "calc(var(--header-h, 64px) + 1.5rem)" }}
        aria-label="Secciones de configuración"
      >
        {TABS.map(({ id, label, Icon, description }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={active ? "page" : undefined}
              className={`
                w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all
                ${active
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                  : "text-slate-600 hover:bg-slate-100 hover:shadow-sm hover:text-slate-900 dark:text-[#adbac7] dark:hover:bg-[#21262d] dark:hover:text-[#e6edf3]"
                }
              `}
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors ${
                active
                  ? "bg-white/20"
                  : "bg-slate-100 dark:bg-[#21262d]"
              }`}>
                <Icon className={`h-3.5 w-3.5 ${
                  active
                    ? "text-white"
                    : "text-slate-500 dark:text-[#768390]"
                }`} />
              </div>
              <div className="min-w-0">
                <p className={`text-[13px] font-semibold truncate ${
                  active
                    ? "text-white"
                    : "text-slate-700 dark:text-[#cdd9e5]"
                }`}>
                  {label}
                </p>
                <p className={`text-[10px] truncate ${
                  active
                    ? "text-violet-200"
                    : "text-slate-400 dark:text-[#545d68]"
                }`}>
                  {description}
                </p>
              </div>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}