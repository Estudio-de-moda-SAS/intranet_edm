// app/finance/components/FinanceSearchBar.tsx
// CLIENT COMPONENT
//
// Guard: employee+ (todos)
// Posición: entre Hero y AnnouncementBanner
//
// Búsqueda contextual rápida dentro del módulo de Finanzas.
// Permite encontrar reportes, documentos, transacciones y políticas.
// Soporta búsqueda por texto libre + filtros por categoría.

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, FileText, Receipt, FolderOpen, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Category = "all" | "reports" | "invoices" | "documents" | "policies" | "budgets";

interface SearchResult {
  id:       string;
  category: Exclude<Category, "all">;
  title:    string;
  subtitle: string;
  href:     string;
  date?:    string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "all",       label: "Todo"         },
  { value: "reports",   label: "Reportes"     },
  { value: "invoices",  label: "Facturas"     },
  { value: "documents", label: "Documentos"   },
  { value: "policies",  label: "Políticas"    },
  { value: "budgets",   label: "Presupuestos" },
];

const CATEGORY_ICON: Record<Exclude<Category, "all">, React.ElementType> = {
  reports:   TrendingUp,
  invoices:  Receipt,
  documents: FolderOpen,
  policies:  BookOpen,
  budgets:   FileText,
};

const CATEGORY_COLOR: Record<Exclude<Category, "all">, string> = {
  reports:   "text-violet-600 bg-violet-50",
  invoices:  "text-blue-600 bg-blue-50",
  documents: "text-slate-600 bg-slate-100",
  policies:  "text-amber-600 bg-amber-50",
  budgets:   "text-emerald-600 bg-emerald-50",
};

// ── Mock data (reemplazar con fetch real) ─────────────────────────────────────

const MOCK_RESULTS: SearchResult[] = [
  { id: "r1", category: "reports",   title: "Estado de Resultados Q4 2024",   subtitle: "Reporte trimestral · PDF",          href: "/finance/reports/q4-2024",         date: "31 dic 2024" },
  { id: "r2", category: "reports",   title: "Flujo de Caja Enero 2025",        subtitle: "Reporte mensual · Excel",          href: "/finance/reports/cashflow-jan25",  date: "31 ene 2025" },
  { id: "r3", category: "budgets",   title: "Presupuesto Anual 2025",          subtitle: "Aprobado por Junta · Excel",       href: "/finance/budgets/2025",            date: "10 mar 2025" },
  { id: "r4", category: "budgets",   title: "Presupuesto Marketing Q1",        subtitle: "Centro de costo 402 · Draft",      href: "/finance/budgets/mkt-q1",          date: "5 feb 2025"  },
  { id: "r5", category: "invoices",  title: "Factura #INV-2025-0342",          subtitle: "Proveedor: TechServ SAS",          href: "/finance/invoices/2025-0342",      date: "12 mar 2025" },
  { id: "r6", category: "invoices",  title: "Factura #INV-2025-0318",          subtitle: "Proveedor: CloudOps Ltda.",        href: "/finance/invoices/2025-0318",      date: "8 mar 2025"  },
  { id: "r7", category: "policies",  title: "Política de Gastos de Viaje v3",  subtitle: "Vigente desde abril 2025",         href: "/finance/policies/travel",         date: "1 abr 2025"  },
  { id: "r8", category: "policies",  title: "Política de Reembolsos",          subtitle: "Última actualización feb 2025",    href: "/finance/policies/reimbursements", date: "3 feb 2025"  },
  { id: "r9", category: "documents", title: "Conciliación Bancaria Febrero",   subtitle: "Banco Popular · Cuenta corriente", href: "/finance/documents/recon-feb25",   date: "28 feb 2025" },
];

// ── Hook: debounced search ────────────────────────────────────────────────────

function useSearch(query: string, category: Category, delay = 200) {
  const [results, setResults] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const id = setTimeout(() => {
      const q = query.toLowerCase();
      const filtered = MOCK_RESULTS.filter((r) => {
        const matchCat = category === "all" || r.category === category;
        const matchQ   = r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q);
        return matchCat && matchQ;
      });
      setResults(filtered.slice(0, 6));
    }, delay);
    return () => clearTimeout(id);
  }, [query, category, delay]);

  return results;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  className?: string;
}

export function FinanceSearchBar({ className = "" }: Props) {
  const [query,    setQuery]    = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [open,     setOpen]     = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLInputElement>(null);

  const results = useSearch(query, category);

  // Cierra dropdown al click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clear = useCallback(() => {
    setQuery("");
    setOpen(false);
    inputRef.current?.focus();
  }, []);

  const showDropdown = open && (results.length > 0 || query.trim().length > 0);

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* ── Barra principal ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-violet-300 focus-within:ring-2 focus-within:ring-violet-100">

        {/* Icono */}
        <Search className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Buscar reportes, facturas, documentos, políticas…"
          className="flex-1 bg-transparent text-[13px] text-slate-700 placeholder:text-slate-400 outline-none min-w-0"
          aria-label="Buscar en Finanzas"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />

        {/* Clear */}
        {query && (
          <button
            onClick={clear}
            aria-label="Limpiar búsqueda"
            className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="h-3 w-3 text-slate-400" />
          </button>
        )}

        {/* Divider */}
        <span className="h-4 w-px bg-slate-200 shrink-0" aria-hidden />

        {/* Category pills */}
        <div className="hidden sm:flex items-center gap-1" role="group" aria-label="Filtrar por categoría">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              className={`
                rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-all
                ${category === cat.value
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-slate-500 hover:bg-slate-100"
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dropdown de resultados ───────────────────────────────────── */}
      {showDropdown && (
        <div
          className="absolute z-50 mt-1.5 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
          role="listbox"
          aria-label="Resultados de búsqueda"
        >
          {results.length === 0 ? (
            <div className="px-4 py-5 text-center">
              <p className="text-[12px] text-slate-500">
                Sin resultados para <span className="font-semibold text-slate-700">"{query}"</span>
              </p>
            </div>
          ) : (
            <>
              <ul className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {results.map((r) => {
                  const Icon  = CATEGORY_ICON[r.category];
                  const color = CATEGORY_COLOR[r.category];
                  return (
                    <li key={r.id} role="option" aria-selected={false}>
                      <a
                        href={r.href}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 transition-colors group"
                        onClick={() => setOpen(false)}
                      >
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[12.5px] font-medium text-slate-800 truncate">{r.title}</p>
                          <p className="text-[11px] text-slate-400 truncate">{r.subtitle}</p>
                        </div>
                        {r.date && (
                          <span className="text-[10px] text-slate-400 shrink-0">{r.date}</span>
                        )}
                        <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-violet-400 transition-colors shrink-0" />
                      </a>
                    </li>
                  );
                })}
              </ul>
              <div className="border-t border-slate-100 px-3 py-2">
                <a
                  href={`/finance/search?q=${encodeURIComponent(query)}&cat=${category}`}
                  className="flex items-center gap-1.5 text-[11.5px] font-medium text-violet-600 hover:text-violet-700 transition-colors"
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
