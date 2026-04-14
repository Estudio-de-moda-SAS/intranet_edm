"use client";

/**
 * @module FinanceExportToolbar
 * Barra de acciones para exportación, impresión y compartición de vistas financieras.
 *
 * @remarks
 * Este componente concentra acciones operativas de salida de información
 * dentro del módulo financiero.
 *
 * Su propósito es ofrecer un punto de acceso compacto para:
 *
 * - exportar paneles en distintos formatos
 * - imprimir la vista actual
 * - iniciar acciones de compartición
 *
 * El componente incorpora una experiencia de exportación controlada,
 * con retroalimentación visual de estado y un menú contextual
 * para selección de formato.
 */

import { useState, useRef, useEffect } from "react";
import {
  Download,
  FileText,
  Sheet,
  Share2,
  Printer,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos de dominio                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Formatos de exportación soportados por la barra.
 */
type ExportFormat = "pdf" | "excel" | "csv";

/**
 * Estados visuales del flujo de exportación.
 *
 * @remarks
 * Se utilizan para controlar la retroalimentación
 * mostrada en el botón principal de exportación.
 */
type ExportState = "idle" | "loading" | "success" | "error";

/**
 * Representa una opción disponible dentro del menú de exportación.
 *
 * @property format Formato interno de exportación.
 * @property label Etiqueta visible en la interfaz.
 * @property ext Extensión asociada al archivo generado.
 * @property Icon Ícono representativo del formato.
 * @property iconBg Fondo visual del contenedor del ícono.
 * @property iconColor Color del ícono.
 */
interface ExportOption {
  format: ExportFormat;
  label: string;
  ext: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

/* -------------------------------------------------------------------------- */
/* Configuración de opciones                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Colección de formatos disponibles para exportación.
 *
 * @remarks
 * Cada opción define tanto la semántica del formato
 * como su representación visual dentro del menú contextual.
 */
const EXPORT_OPTIONS: ExportOption[] = [
  {
    format: "pdf",
    label: "Exportar PDF",
    ext: ".pdf",
    Icon: FileText,
    iconBg: "bg-rose-50 dark:bg-rose-500/[0.10]",
    iconColor: "text-rose-600 dark:text-rose-400",
  },
  {
    format: "excel",
    label: "Exportar Excel",
    ext: ".xlsx",
    Icon: Sheet,
    iconBg: "bg-emerald-50 dark:bg-emerald-500/[0.10]",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    format: "csv",
    label: "Exportar CSV",
    ext: ".csv",
    Icon: FileText,
    iconBg: "bg-blue-50 dark:bg-blue-500/[0.10]",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
];

/* -------------------------------------------------------------------------- */
/* Utilidad temporal de exportación                                            */
/* -------------------------------------------------------------------------- */

/**
 * Simula un proceso asíncrono de exportación.
 *
 * @param _format Formato solicitado para exportación.
 * @returns Promesa resuelta tras un retardo artificial.
 *
 * @remarks
 * Esta función actúa como placeholder durante desarrollo.
 * En un escenario productivo, debe ser reemplazada por la invocación
 * al servicio real de generación o descarga de archivos.
 */
async function simulateExport(_format: ExportFormat): Promise<void> {
  await new Promise((res) => setTimeout(res, 1400));
}

/* -------------------------------------------------------------------------- */
/* Props                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link FinanceExportToolbar}.
 *
 * @property periodLabel Texto descriptivo del período o contexto exportado.
 * @property className Clases adicionales para personalización externa.
 */
interface ExportProps {
  periodLabel?: string;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Barra de exportación del módulo financiero.
 *
 * @param props Propiedades del componente.
 * @returns Grupo de acciones para compartir, imprimir y exportar datos.
 *
 * @remarks
 * Este componente administra:
 *
 * - la apertura y cierre del menú de exportación
 * - el estado del proceso de exportación
 * - el formato exportado más recientemente
 * - el cierre del dropdown por click externo
 * - la restauración automática del estado visual tras éxito
 *
 * El botón principal adapta su apariencia según el flujo:
 *
 * - `idle`: disponible para exportar
 * - `loading`: exportación en curso
 * - `success`: exportación completada
 *
 * @example
 * ```tsx
 * <FinanceExportToolbar />
 * ```
 *
 * @example
 * ```tsx
 * <FinanceExportToolbar periodLabel="Q1 2025" className="ml-auto" />
 * ```
 */
export function FinanceExportToolbar({
  periodLabel = "actual",
  className = "",
}: ExportProps) {
  /**
   * Indica si el menú desplegable se encuentra abierto.
   */
  const [open, setOpen] = useState(false);

  /**
   * Estado actual del flujo de exportación.
   */
  const [exportState, setExportState] = useState<ExportState>("idle");

  /**
   * Último formato exportado con éxito.
   *
   * @remarks
   * Se utiliza para mostrar retroalimentación contextual
   * en el botón principal.
   */
  const [lastFormat, setLastFormat] = useState<ExportFormat | null>(null);

  /**
   * Referencia al contenedor del dropdown.
   *
   * @remarks
   * Permite detectar clics externos para cerrar el menú.
   */
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Cierra el menú cuando el usuario hace clic fuera del contenedor.
   */
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /**
   * Restaura automáticamente el estado visual tras una exportación exitosa.
   *
   * @remarks
   * El componente vuelve a `idle` después de un breve intervalo,
   * manteniendo una confirmación temporal visible para el usuario.
   */
  useEffect(() => {
    if (exportState !== "success") {
      return;
    }

    const id = setTimeout(() => setExportState("idle"), 2500);
    return () => clearTimeout(id);
  }, [exportState]);

  /**
   * Ejecuta el flujo de exportación para un formato determinado.
   *
   * @param format Formato solicitado por el usuario.
   *
   * @remarks
   * Flujo interno:
   *
   * 1. Cierra el menú desplegable
   * 2. Registra el formato seleccionado
   * 3. Activa el estado de carga
   * 4. Ejecuta la exportación
   * 5. Marca éxito o error según el resultado
   */
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

  /**
   * Indica si actualmente se está procesando una exportación.
   */
  const isLoading = exportState === "loading";

  /**
   * Indica si la última exportación concluyó correctamente.
   */
  const isSuccess = exportState === "success";

  return (
    <div className={`flex items-center gap-2 ${className}`} ref={dropdownRef}>
      {/* Compartir / Imprimir */}
      <button
        className="flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm transition-all
                   border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600
                   dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#545d68] dark:hover:border-violet-500/40 dark:hover:text-violet-400"
        aria-label="Compartir reporte"
        title="Compartir"
      >
        <Share2 className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={() => typeof window !== "undefined" && window.print()}
        className="flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm transition-all
                   border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600
                   dark:border-[#30363d] dark:bg-[#21262d] dark:text-[#545d68] dark:hover:border-violet-500/40 dark:hover:text-violet-400"
        aria-label="Imprimir reporte"
        title="Imprimir"
      >
        <Printer className="h-3.5 w-3.5" />
      </button>

      <span className="h-4 w-px bg-slate-200 dark:bg-[#30363d]" aria-hidden />

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
              ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/[0.10] dark:border-emerald-500/25 dark:text-emerald-400"
              : isLoading
                ? "border-violet-200 bg-violet-50 text-violet-600 cursor-wait dark:bg-violet-500/[0.10] dark:border-violet-500/25 dark:text-violet-400"
                : "border-violet-200 bg-violet-600 text-white hover:bg-violet-700 dark:bg-violet-600/80 dark:border-violet-500/50 dark:hover:bg-violet-600"
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
              : "Exportar"}

          {!isLoading && !isSuccess && (
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          )}
        </button>

        {/* Dropdown */}
        {open && (
          <div
            className="absolute right-0 top-full mt-1.5 w-44 rounded-xl overflow-hidden z-50
                       border shadow-xl
                       border-slate-200 bg-white
                       dark:border-[#30363d] dark:bg-[#161b22] dark:shadow-black/40"
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
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors group
                             hover:bg-slate-50 dark:hover:bg-[#1c2128]"
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${opt.iconBg}`}>
                    <Icon className={`h-3 w-3 ${opt.iconColor}`} />
                  </span>

                  <div>
                    <p className="text-[12px] font-medium text-slate-700 dark:text-[#cdd9e5]">
                      {opt.label}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-[#545d68]">
                      Panel {periodLabel}{opt.ext}
                    </p>
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