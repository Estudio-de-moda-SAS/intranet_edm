/**
 * @module RetailChannelTabsBar
 * Sistema de navegación por canales del módulo de Retail.
 *
 * @remarks
 * Este archivo define la infraestructura de navegación entre los
 * distintos canales operativos del módulo de Retail:
 * - Comercial
 * - E-Commerce
 * - Tiendas
 *
 * Su responsabilidad se divide en tres capas:
 *
 * 1. **Modelo de canal**
 *    Define el tipo de identificadores válidos para la navegación.
 *
 * 2. **Estado compartido**
 *    Implementa un contexto React para exponer el canal activo
 *    y la función de cambio de canal a cualquier componente descendiente.
 *
 * 3. **Interfaz de navegación**
 *    Renderiza la barra de tabs visible para el usuario y permite
 *    alternar entre canales disponibles según permisos.
 *
 * Este diseño permite desacoplar:
 * - la lógica de estado del canal activo
 * - la configuración visual de cada tab
 * - el renderizado condicional de los paneles de contenido
 *
 * Además, incorpora soporte para:
 * - ocultar tabs según permisos
 * - iniciar el contexto en el primer canal visible
 *
 * Esto evita inconsistencias como mostrar un canal activo
 * que el usuario no tiene permitido visualizar.
 */

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

/**
 * Identificadores válidos de canal dentro del módulo de Retail.
 *
 * @remarks
 * Este tipo limita los valores posibles del canal activo y asegura
 * consistencia entre:
 * - el contexto de navegación
 * - la configuración visual de tabs
 * - los paneles condicionales del módulo
 */
export type ChannelId = "comercial" | "ecommerce" | "tiendas";

/**
 * Estructura del contexto de canal de Retail.
 *
 * @property active Canal actualmente activo.
 * @property setActive Función para actualizar el canal activo.
 *
 * @remarks
 * Este tipo representa el contrato interno del contexto compartido
 * entre la barra de navegación y los paneles de contenido.
 */
type RetailChannelCtx = {
  active:    ChannelId;
  setActive: (id: ChannelId) => void;
};

// ── Context ───────────────────────────────────────────────────────

/**
 * Contexto React que almacena el canal activo del módulo de Retail.
 *
 * @remarks
 * Proporciona el estado compartido necesario para sincronizar:
 * - la barra de tabs
 * - los paneles condicionales de contenido
 *
 * Se inicializa con el canal `comercial` como valor por defecto,
 * aunque el valor real puede ser reemplazado por el provider
 * según el canal inicial visible.
 */
const RetailChannelContext = createContext<RetailChannelCtx>({
  active:    "comercial",
  setActive: () => {},
});

/**
 * Hook de acceso al contexto de canal de Retail.
 *
 * @returns El contexto actual con el canal activo y su actualizador.
 *
 * @remarks
 * Este hook simplifica el consumo del contexto y permite que
 * componentes internos del módulo accedan al estado de navegación
 * sin interactuar directamente con `useContext`.
 *
 * @example
 * ```tsx
 * const { active, setActive } = useRetailChannel();
 * ```
 */
export function useRetailChannel() {
  return useContext(RetailChannelContext);
}

// ── Provider ──────────────────────────────────────────────────────

/**
 * Propiedades del componente {@link RetailChannelProvider}.
 *
 * @property children Contenido descendiente que consumirá el contexto.
 * @property defaultChannel Canal inicial del contexto.
 *
 * @remarks
 * `defaultChannel` debe corresponder idealmente al primer canal
 * realmente visible para el usuario, lo cual suele resolverse
 * desde un componente superior en servidor.
 */
interface RetailChannelProviderProps {
  children:       ReactNode;
  defaultChannel?: ChannelId;   // primer canal visible — lo calcula el Server Component
}

/**
 * Provider del contexto de navegación entre canales de Retail.
 *
 * @param props Propiedades del componente.
 * @param props.children Árbol descendiente que consumirá el contexto.
 * @param props.defaultChannel Canal inicial visible.
 * @returns Un provider de contexto para navegación de canales.
 *
 * @remarks
 * Este componente encapsula el estado del canal activo y lo expone
 * a través de {@link RetailChannelContext}.
 *
 * Su función principal es garantizar que todos los componentes
 * relacionados con la navegación de canales compartan una fuente
 * única de verdad.
 *
 * Es especialmente útil cuando:
 * - los tabs visibles dependen de permisos
 * - el canal inicial no siempre es el mismo
 * - varios componentes necesitan reaccionar al canal activo
 */
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

/**
 * Configuración visual y semántica de los tabs de canal.
 *
 * @remarks
 * Este arreglo centraliza toda la información necesaria para renderizar
 * la barra de navegación entre canales.
 *
 * Cada elemento define:
 * - identificador del canal
 * - etiqueta visible
 * - subtítulo contextual
 * - ícono
 * - colores y estilos del estado activo
 * - indicador visual inferior
 *
 * Centralizar esta configuración permite:
 * - evitar lógica repetida en el render
 * - mantener consistencia entre tabs
 * - facilitar mantenimiento y escalabilidad
 */
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

/**
 * Propiedades del componente {@link RetailChannelTabsBar}.
 *
 * @property showCommercial Indica si debe mostrarse el tab de Comercial.
 * @property showEcommerce Indica si debe mostrarse el tab de E-Commerce.
 * @property showStores Indica si debe mostrarse el tab de Tiendas.
 *
 * @remarks
 * Estas banderas permiten adaptar la barra de navegación
 * al nivel de acceso del usuario.
 *
 * La visibilidad de los tabs se controla externamente,
 * mientras que el estado activo se mantiene dentro del contexto.
 */
interface RetailChannelTabsBarProps {
  showCommercial?: boolean;
  showEcommerce?:  boolean;
  showStores?:     boolean;
}

// ── Tab Bar Component ─────────────────────────────────────────────

/**
 * Barra de tabs para navegación entre canales del módulo de Retail.
 *
 * @param props Propiedades del componente.
 * @param props.showCommercial Controla visibilidad del canal Comercial.
 * @param props.showEcommerce Controla visibilidad del canal E-Commerce.
 * @param props.showStores Controla visibilidad del canal Tiendas.
 * @returns Una barra de navegación visual entre canales disponibles.
 *
 * @remarks
 * Este componente renderiza la interfaz de navegación superior
 * para alternar entre los canales operativos del módulo.
 *
 * Su comportamiento general es:
 *
 * 1. Obtiene el canal activo desde {@link useRetailChannel}
 * 2. Filtra los tabs visibles según las props recibidas
 * 3. Renderiza únicamente los tabs permitidos para el usuario
 * 4. Actualiza el contexto al seleccionar un nuevo tab
 *
 * La interfaz incluye:
 * - ícono por canal
 * - etiqueta principal
 * - subtítulo contextual en estado activo
 * - punto indicador
 * - línea inferior animada
 *
 * Esto proporciona una navegación clara, compacta y consistente
 * con el diseño general del módulo.
 *
 * @example
 * ```tsx
 * <RetailChannelTabsBar
 *   showCommercial={true}
 *   showEcommerce={true}
 *   showStores={false}
 * />
 * ```
 */
export function RetailChannelTabsBar({
  showCommercial = true,
  showEcommerce  = true,
  showStores     = true,
}: RetailChannelTabsBarProps) {
  const { active, setActive } = useRetailChannel();

  /**
   * Tabs realmente visibles para el usuario actual.
   *
   * @remarks
   * Este subconjunto se obtiene filtrando la configuración base
   * según las banderas de visibilidad recibidas por props.
   */
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