"use client";
/**
 * @module SharePointVersionsModal
 * Modal de historial de versiones de un archivo de SharePoint.
 *
 * @remarks
 * Muestra todas las versiones del archivo con fecha, autor y tamaño.
 * Permite restaurar cualquier versión anterior si el usuario tiene
 * `legal:manage_documents`. Usa el componente base {@link Modal}.
 */

import { useState, useEffect } from "react";
import { Modal }               from "@/app/components/ui/Modal";
import {
  Clock, User, Download, RotateCcw,
  CheckCircle2, Loader2, AlertTriangle, History,
} from "lucide-react";
import type { FileVersion }  from "@/lib/graph/departments/legal.sharepoint.versions";
import type { AccessLevel }  from "@/lib/roles";
import { can }               from "@/lib/roles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("es-CO", {
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  open:        boolean;
  onClose:     () => void;
  itemId:      string;
  fileName:    string;
  accessLevel: AccessLevel;
  /** Callback para notificar que se restauró una versión */
  onRestored?: () => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function SharePointVersionsModal({
  open,
  onClose,
  itemId,
  fileName,
  accessLevel,
  onRestored,
}: Props) {
  const canWrite = can(accessLevel, "legal:manage_documents");

  const [versions,    setVersions]    = useState<FileVersion[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [restoring,   setRestoring]   = useState<string | null>(null);
  const [toast,       setToast]       = useState<{ message: string; kind: "success" | "error" } | null>(null);
  const [confirmId,   setConfirmId]   = useState<string | null>(null);

  // Cargar versiones al abrir
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    import("@/lib/graph/departments/legal.sharepoint.versions")
      .then(({ getFileVersions }) => getFileVersions(itemId))
      .then((data) => setVersions(data))
      .finally(() => setLoading(false));
  }, [open, itemId]);

  function showToast(message: string, kind: "success" | "error") {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleRestore(version: FileVersion) {
    setConfirmId(null);
    setRestoring(version.id);
    try {
      const { restoreVersion } = await import("@/lib/graph/departments/legal.sharepoint.versions");
      const result = await restoreVersion(itemId, version.id);
      if (result.success) {
        // Actualizar estado local: marcar la versión restaurada como current
        // y crear una nueva entrada "5.0 (restaurada)" al inicio
        setVersions((prev) => {
          const newVersion: FileVersion = {
            id:           `${prev.length + 1}.0`,
            versionLabel: `${prev.length + 1}.0`,
            size:         version.size,
            modifiedAt:   new Date().toISOString(),
            modifiedBy:   "Tú",
            isCurrent:    true,
            downloadUrl:  undefined,
          };
          return [
            newVersion,
            ...prev.map((v) => ({ ...v, isCurrent: false })),
          ];
        });
        showToast(`Versión ${version.versionLabel} restaurada correctamente`, "success");
        onRestored?.();
      } else {
        showToast("Error al restaurar la versión", "error");
      }
    } finally {
      setRestoring(null);
    }
  }

  const footer = (
    <div className="flex items-center justify-between">
      <p className="text-[11px] text-slate-400">
        {versions.length} versión{versions.length !== 1 ? "es" : ""} · SharePoint mantiene el historial automáticamente
      </p>
      <button
        onClick={onClose}
        className="rounded-lg px-4 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 transition-colors"
      >
        Cerrar
      </button>
    </div>
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Historial de versiones"
      subtitle={fileName}
      size="md"
      accentColor="bg-emerald-700"
      footer={footer}
    >
      {/* Banner de solo lectura si no tiene permisos de escritura */}
      {!canWrite && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <History size={13} className="shrink-0 text-slate-400" />
          <p className="text-[11px] text-slate-500">
            Solo puedes consultar el historial. La restauración requiere permisos de gestión.
          </p>
        </div>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 size={16} className="animate-spin" />
          <p className="text-[12px]">Cargando versiones...</p>
        </div>
      )}

      {/* Lista de versiones */}
      {!loading && versions.length > 0 && (
        <div className="flex flex-col gap-2">
          {versions.map((version) => {
            const isRestoring = restoring === version.id;
            const isConfirming = confirmId === version.id;

            return (
              <div
                key={version.id}
                className={`rounded-xl border p-3 transition-colors
                  ${version.isCurrent
                    ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-950/20"
                    : "border-slate-100 bg-white hover:bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800"
                  }`}
              >
                <div className="flex items-start gap-3">
                  {/* Badge versión */}
                  <div className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold
                    ${version.isCurrent
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
                    }`}
                  >
                    v{version.versionLabel}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {version.isCurrent && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                          <CheckCircle2 size={9} />
                          Versión actual
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                        {formatSize(version.size)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <User size={9} />{version.modifiedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={9} />
                        {formatDate(version.modifiedAt)} · {formatTime(version.modifiedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1 shrink-0">
                    {version.downloadUrl && (
                      <a
                        href={version.downloadUrl}
                        download
                        title="Descargar esta versión"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download size={13} />
                      </a>
                    )}

                    {canWrite && !version.isCurrent && (
                      isConfirming ? (
                        // Confirmación inline
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-amber-600 font-medium">¿Restaurar?</span>
                          <button
                            onClick={() => handleRestore(version)}
                            disabled={!!restoring}
                            className="rounded-lg px-2 py-1 text-[10px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                          >
                            {isRestoring ? <Loader2 size={10} className="animate-spin" /> : "Sí"}
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            No
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmId(version.id)}
                          disabled={!!restoring}
                          title="Restaurar esta versión"
                          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-slate-400 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 disabled:opacity-40 transition-colors"
                        >
                          <RotateCcw size={12} />
                          Restaurar
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sin versiones */}
      {!loading && versions.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
          <History size={24} className="opacity-40" />
          <p className="text-[12px]">No hay versiones registradas</p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[10000] flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg text-[12px] font-medium
          ${toast.kind === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
            : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {toast.kind === "success"
            ? <CheckCircle2 size={14} />
            : <AlertTriangle size={14} />
          }
          {toast.message}
        </div>
      )}
    </Modal>
  );
}