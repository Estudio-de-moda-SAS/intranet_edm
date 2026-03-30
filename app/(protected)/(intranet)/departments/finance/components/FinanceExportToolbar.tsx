// app/finance/components/FinanceExportToolbar.tsx
// CLIENT COMPONENT (maneja estados de descarga)
//
// Guard: finance:create_report
// Posición: header del Panel Financiero (FinanceDashboard), lado derecho
//
// Toolbar de exportación para el panel financiero:
//   - Exportar a PDF, Excel, CSV
//   - Compartir reporte por enlace / correo
//   - Imprimir
//   - Estado de descarga (loading, success, error)

"use client";

import { useState, useRef, useEffect } from "react";
import { Download, FileText, Sheet, Share2, Printer, Check, Loader2, ChevronDown } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

type ExportFormat = "pdf" | "excel" | "csv";
type ExportState  = "idle" | "loading" | "success" | "error";

interface ExportOption {
  format:  ExportFormat;
  label:   string;
  ext:     string;
  Icon:    React.ElementType;
  iconBg:  string;
  iconColor: string;
}

// ── Config ────────────────────────────────────────────────────────────────────

const EXPORT_OPTIONS: ExportOption[] = [
  { format: "pdf",   label: "Exportar PDF",   ext: ".pdf",  Icon: FileText, iconBg: "bg-rose-50",   iconColor: "text-rose-600"   },
  { format: "excel", label: "Exportar Excel",  ext: ".xlsx", Icon: Sheet,    iconBg: "bg-emerald-50",iconColor: "text-emerald-600" },
  { format: "csv",   label: "Exportar CSV",    ext: ".csv",  Icon: FileText, iconBg: "bg-blue-50",   iconColor: "text-blue-600"   },
];

// ── Simulated export (reemplazar con handler real) ────────────────────────────
async function simulateExport(_format: ExportFormat): Promise<void> {
  await new Promise((res) => setTimeout(res, 1400));
  // En producción: llamar a /api/finance/export?format=pdf&period=...

}
// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  periodLabel?: string;   // e.g. "Q1 2025" — se incluye en el nombre del archivo
  className?:   string;
}

export function FinanceExportToolbar({ periodLabel = "actual", className = "" }: Props) {
  const [open,        setOpen]       = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const [lastFormat,  setLastFormat]  = useState<ExportFormat | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra dropdown al click fuera
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Reset success state
useEffect(() => {
  if (exportState !== "success") return;  // ✅ retorno explícito
  const id = setTimeout(() => setExportState("idle"), 2500);
  return () => clearTimeout(id);
}, [exportState]);

  async function handleExport(format: ExportFormat) {
    setOpen(false);
    setLastFormat(format);
    setExportState("loading");
    try {
      await simulateExport(format);
      setExportState("success");
    } catch {
      setExportState("error");
    }
  }

  // ── Botón principal ────────────────────────────────────────────────────────

  const isLoading = exportState === "loading";
  const isSuccess = exportState === "success";

  return (
    <div className={`flex items-center gap-2 ${className}`} ref={dropdownRef}>

      {/* Share / Imprimir — compactos */}
      <button
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600 transition-all shadow-sm"
        aria-label="Compartir reporte"
        title="Compartir"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={() => typeof window !== "undefined" && window.print()}
        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600 transition-all shadow-sm"
        aria-label="Imprimir reporte"
        title="Imprimir"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>

      {/* Divider */}
      <span className="h-4 w-px bg-slate-200" aria-hidden />

      {/* Export dropdown */}
      <div className="relative">
        <button
          onClick={() => !isLoading && setOpen((o) => !o)}
          disabled={isLoading}
          aria-expanded={open}
          aria-haspopup="true"
          className={`
            flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] font-semibold
            shadow-sm transition-all
            ${isSuccess
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : isLoading
                ? "border-violet-200 bg-violet-50 text-violet-600 cursor-wait"
                : "border-violet-200 bg-violet-600 text-white hover:bg-violet-700"
            }
          `}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isSuccess ? (
            <Check className="h-3 w-3" />
          ) : (
            <Download className="h-3 w-3" />
          )}
          {isLoading
            ? "Exportando…"
            : isSuccess
              ? `${lastFormat?.toUpperCase()} listo`
              : "Exportar"
          }
          {!isLoading && !isSuccess && (
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
            role="menu"
            aria-label="Opciones de exportación"
          >
            {EXPORT_OPTIONS.map((opt) => {
              const { Icon } = opt;
              return (
                <button
                  key={opt.format}
                  role="menuitem"
                  onClick={() => handleExport(opt.format)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-slate-50 transition-colors group"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${opt.iconBg}`}>
                    <Icon className={`h-3 w-3 ${opt.iconColor}`} />
                  </span>
                  <div>
                    <p className="text-[12px] font-medium text-slate-700">{opt.label}</p>
                    <p className="text-[10px] text-slate-400">Panel {periodLabel}{opt.ext}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
