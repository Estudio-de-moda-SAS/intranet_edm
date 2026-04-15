"use client";

/**
 * @module FinanceSearchBar
 * Barra de búsqueda contextual para el módulo financiero.
 *
 * @remarks
 * Este componente proporciona una experiencia de búsqueda rápida
 * dentro del ecosistema funcional de Finanzas, permitiendo localizar
 * recursos relevantes como:
 *
 * - reportes
 * - facturas
 * - documentos
 * - políticas
 * - presupuestos
 *
 * La barra integra:
 *
 * - filtrado por categorías
 * - búsqueda con retardo controlado
 * - dropdown contextual de resultados
 * - limpieza manual de consulta
 * - acceso directo a una vista extendida de resultados
 *
 * Su objetivo es reducir el tiempo de acceso a información operativa
 * y documental dentro del módulo.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search,
  X,
  FileText,
  Receipt,
  FolderOpen,
  BookOpen,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos de dominio                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Categorías disponibles para filtrado de búsqueda.
 *
 * @remarks
 * La categoría `all` representa una búsqueda transversal
 * sobre todo el conjunto de resultados disponibles.
 */
type Category = "all" | "reports" | "invoices" | "documents" | "policies" | "budgets";

/**
 * Representa un resultado de búsqueda dentro del módulo financiero.
 *
 * @property id Identificador único del resultado.
 * @property category Categoría funcional del recurso encontrado.
 * @property title Título principal del resultado.
 * @property subtitle Descripción secundaria o contexto del recurso.
 * @property href Ruta o enlace de navegación.
 * @property date Fecha opcional asociada al recurso.
 */
interface SearchResult {
  id: string;
  category: Exclude<Category, "all">;
  title: string;
  subtitle: string;
  href: string;
  date?: string;
}

/* -------------------------------------------------------------------------- */
/* Configuración de categorías                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Definición de categorías visibles en la barra.
 *
 * @remarks
 * Se utiliza para renderizar los filtros rápidos
 * mostrados en escritorio.
 */
const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all", label: "Todo" },
  { value: "reports", label: "Reportes" },
  { value: "invoices", label: "Facturas" },
  { value: "documents", label: "Documentos" },
  { value: "policies", label: "Políticas" },
  { value: "budgets", label: "Presupuestos" },
];

/**
 * Iconografía asociada a cada categoría específica.
 *
 * @remarks
 * Se utiliza en el listado de resultados del dropdown
 * para reforzar la identidad visual del recurso encontrado.
 */
const CATEGORY_ICON: Record<Exclude<Category, "all">, React.ElementType> = {
  reports: TrendingUp,
  invoices: Receipt,
  documents: FolderOpen,
  policies: BookOpen,
  budgets: FileText,
};

/**
 * Estilo visual por categoría específica.
 *
 * @remarks
 * Este mapa define la identidad cromática de los resultados
 * dentro del dropdown de búsqueda.
 */
const CATEGORY_COLOR: Record<Exclude<Category, "all">, string> = {
  reports: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/[0.12]",
  invoices: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/[0.12]",
  documents: "text-slate-600 bg-slate-100 dark:text-[#768390] dark:bg-[#21262d]",
  policies: "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/[0.12]",
  budgets: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/[0.12]",
};

/* -------------------------------------------------------------------------- */
/* Datos mock                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Colección simulada de resultados de búsqueda.
 *
 * @remarks
 * Esta estructura actúa como dataset temporal
 * para la experiencia de búsqueda en entorno de desarrollo.
 *
 * En producción, debería sustituirse por una fuente dinámica
 * proveniente de backend, motor de búsqueda o servicio indexado.
 */
const MOCK_RESULTS: SearchResult[] = [
  {
    id: "r1",
    category: "reports",
    title: "Estado de Resultados Q4 2024",
    subtitle: "Reporte trimestral · PDF",
    href: "/finance/reports/q4-2024",
    date: "31 dic 2024",
  },
  {
    id: "r2",
    category: "reports",
    title: "Flujo de Caja Enero 2025",
    subtitle: "Reporte mensual · Excel",
    href: "/finance/reports/cashflow-jan25",
    date: "31 ene 2025",
  },
  {
    id: "r3",
    category: "budgets",
    title: "Presupuesto Anual 2025",
    subtitle: "Aprobado por Junta · Excel",
    href: "/finance/budgets/2025",
    date: "10 mar 2025",
  },
  {
    id: "r4",
    category: "budgets",
    title: "Presupuesto Marketing Q1",
    subtitle: "Centro de costo 402 · Draft",
    href: "/finance/budgets/mkt-q1",
    date: "5 feb 2025",
  },
  {
    id: "r5",
    category: "invoices",
    title: "Factura #INV-2025-0342",
    subtitle: "Proveedor: TechServ SAS",
    href: "/finance/invoices/2025-0342",
    date: "12 mar 2025",
  },
  {
    id: "r6",
    category: "invoices",
    title: "Factura #INV-2025-0318",
    subtitle: "Proveedor: CloudOps Ltda.",
    href: "/finance/invoices/2025-0318",
    date: "8 mar 2025",
  },
  {
    id: "r7",
    category: "policies",
    title: "Política de Gastos de Viaje v3",
    subtitle: "Vigente desde abril 2025",
    href: "/finance/policies/travel",
    date: "1 abr 2025",
  },
  {
    id: "r8",
    category: "policies",
    title: "Política de Reembolsos",
    subtitle: "Última actualización feb 2025",
    href: "/finance/policies/reimbursements",
    date: "3 feb 2025",
  },
  {
    id: "r9",
    category: "documents",
    title: "Conciliación Bancaria Febrero",
    subtitle: "Banco Popular · Cuenta corriente",
    href: "/finance/documents/recon-feb25",
    date: "28 feb 2025",
  },
];

/* -------------------------------------------------------------------------- */
/* Hook auxiliar de búsqueda                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Ejecuta una búsqueda local con retardo controlado.
 *
 * @param query Texto de búsqueda ingresado por el usuario.
 * @param category Categoría actualmente activa.
 * @param delay Retardo en milisegundos antes de aplicar el filtrado.
 * @returns Lista de resultados filtrados.
 *
 * @remarks
 * Este hook implementa una forma simple de debounce
 * para evitar recalcular resultados de manera inmediata
 * en cada pulsación del teclado.
 *
 * Reglas aplicadas:
 *
 * - si la consulta está vacía, no retorna resultados
 * - si la categoría es `all`, busca en todas las categorías
 * - filtra por coincidencia en `title` o `subtitle`
 * - limita la salida a un máximo de 6 elementos
 */
function useSearch(query: string, category: Category, delay = 200) {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const id = setTimeout(() => {
      const q = query.toLowerCase();

      setResults(
        MOCK_RESULTS.filter((r) => {
          const matchCat = category === "all" || r.category === category;
          const matchQ =
            r.title.toLowerCase().includes(q) ||
            r.subtitle.toLowerCase().includes(q);

          return matchCat && matchQ;
        }).slice(0, 6),
      );
    }, delay);

    return () => clearTimeout(id);
  }, [query, category, delay]);

  return results;
}

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link FinanceSearchBar}.
 *
 * @property className Clases adicionales para personalización externa.
 */
interface SearchBarProps {
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Barra de búsqueda del módulo financiero.
 *
 * @param props Propiedades del componente.
 * @returns Campo de búsqueda con filtros, dropdown contextual y navegación a resultados.
 *
 * @remarks
 * Este componente administra:
 *
 * - la consulta activa
 * - la categoría seleccionada
 * - la apertura del dropdown
 * - el cierre por click externo
 * - la limpieza rápida del input
 *
 * Flujo general:
 *
 * 1. El usuario escribe una consulta
 * 2. Se aplica búsqueda con debounce mediante `useSearch`
 * 3. Se muestran coincidencias contextuales en un dropdown
 * 4. El usuario puede navegar a un resultado específico
 * 5. También puede acceder a una vista completa de resultados
 *
 * @example
 * ```tsx
 * <FinanceSearchBar />
 * ```
 *
 * @example
 * ```tsx
 * <FinanceSearchBar className="w-full max-w-2xl" />
 * ```
 */
export function FinanceSearchBar({ className = "" }: SearchBarProps) {
  /**
   * Texto actual ingresado en la barra de búsqueda.
   */
  const [query, setQuery] = useState("");

  /**
   * Categoría activa para el filtrado.
   */
  const [category, setCategory] = useState<Category>("all");

  /**
   * Controla la visibilidad del dropdown de resultados.
   */
  const [open, setOpen] = useState(false);

  /**
   * Referencia al contenedor principal de la barra.
   *
   * @remarks
   * Se utiliza para detectar clics externos
   * y cerrar el dropdown cuando corresponde.
   */
  const wrapperRef = useRef<HTMLDivElement>(null);

  /**
   * Referencia directa al campo input.
   *
   * @remarks
   * Permite restaurar el foco tras limpiar la búsqueda.
   */
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Resultados filtrados de acuerdo con la consulta y categoría actual.
   */
  const results = useSearch(query, category);

  /**
   * Gestiona el cierre automático del dropdown
   * al detectar un click fuera del componente.
   */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /**
   * Limpia la consulta actual y devuelve el foco al input.
   *
   * @remarks
   * También cierra el dropdown contextual.
   */
  const clear = useCallback(() => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }, []);

  /**
   * Determina si el dropdown debe mostrarse.
   *
   * @remarks
   * Se muestra cuando:
   *
   * - el componente está abierto
   * - existe una consulta activa
   * - hay resultados o se requiere mostrar el estado vacío
   */
  const showDropdown = open && (results.length > 0 || query.trim().length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* Barra principal */}
      <div
        className="flex items-center gap-2 rounded-xl border px-3 py-2 shadow-sm transition-all
                      border-slate-200 bg-white
                      focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100
                      dark:border-[#30363d] dark:bg-[#1c2128]
                      dark:focus-within:border-violet-500/50 dark:focus-within:ring-violet-500/15"
      >
        <Search
          className="h-4 w-4 shrink-0 text-slate-400 dark:text-[#545d68]"
          aria-hidden
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar reportes, facturas, documentos, políticas…"
          className="flex-1 bg-transparent text-[13px] outline-none min-w-0
                     text-slate-700 placeholder:text-slate-400
                     dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]"
          aria-label="Buscar en Finanzas"
        />

        {query && (
          <button
            onClick={clear}
            aria-label="Limpiar búsqueda"
            className="flex h-5 w-5 items-center justify-center rounded-full transition-colors
                             hover:bg-slate-100 dark:hover:bg-[#30363d]"
          >
            <X className="h-3 w-3 text-slate-400 dark:text-[#545d68]" />
          </button>
        )}

        <span
          className="h-4 w-px bg-slate-200 dark:bg-[#30363d] shrink-0"
          aria-hidden
        />

        {/* Category pills */}
        <div className="hidden sm:flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all ${
                category === cat.value
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100 dark:text-[#545d68] dark:hover:bg-[#30363d] dark:hover:text-[#adbac7]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl overflow-hidden
                        border shadow-xl
                        border-slate-200 bg-white
                        dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-black/40"
        >
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[12px] text-slate-500 dark:text-[#768390]">
                Sin resultados para{" "}
                <span className="font-semibold text-slate-700 dark:text-[#adbac7]">
                  "{query}"
                </span>
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-50 dark:divide-[#21262d] max-h-72 overflow-y-auto">
                {results.map((r) => {
                  /**
                   * Ícono asociado a la categoría del resultado.
                   */
                  const Icon = CATEGORY_ICON[r.category];

                  /**
                   * Configuración cromática del resultado según su categoría.
                   */
                  const color = CATEGORY_COLOR[r.category];

                  return (
                    <li key={r.id}>
                      <a
                        href={r.href}
                        className="flex items-center gap-3 px-3 py-2.5 transition-colors group
                                   hover:bg-slate-50 dark:hover:bg-[#1c2128]"
                        onClick={() => setOpen(false)}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>

                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium truncate text-slate-800 dark:text-[#e6edf3]">
                            {r.title}
                          </p>
                          <p className="text-[11px] truncate text-slate-400 dark:text-[#545d68]">
                            {r.subtitle}
                          </p>
                        </div>

                        {r.date && (
                          <span className="text-[10px] shrink-0 text-slate-400 dark:text-[#545d68]">
                            {r.date}
                          </span>
                        )}

                        <ArrowRight
                          className="h-3 w-3 shrink-0 transition-colors
                                               text-slate-300 group-hover:text-violet-400
                                               dark:text-[#444c56] dark:group-hover:text-violet-400"
                        />
                      </a>
                    </li>
                  );
                })}
              </ul>

              <div
                className="border-t px-3 py-2
                              border-slate-100 dark:border-[#21262d]"
              >
                <a
                  href={`/finance/search?q=${encodeURIComponent(query)}&cat=${category}`}
                  className="flex items-center gap-1.5 text-[11.5px] font-medium transition-colors
                             text-violet-600 hover:text-violet-700
                             dark:text-violet-400 dark:hover:text-violet-300"
                  onClick={() => setOpen(false)}
                >
                  <Search className="h-3 w-3" />
                  Ver todos los resultados para "{query}"
                </a>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}