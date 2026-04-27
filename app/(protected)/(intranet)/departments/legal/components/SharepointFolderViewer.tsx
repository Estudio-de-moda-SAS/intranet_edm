"use client";
/**
 * @module SharePointFolderViewer
 * Visor de documentos para una carpeta de SharePoint con navegación
 * de subcarpetas y operaciones CRUD según permisos del usuario.
 *
 * @remarks
 * - Lectura: todos los usuarios con acceso a la página jurídica
 * - Escritura (subir, nueva carpeta, renombrar, reemplazar, eliminar):
 *   requiere `legal:manage_documents`
 *
 * Compatible con modo bypass (datos mock). Usa PdfViewerModal para vista previa.
 */

import { useState, useMemo, useTransition, useRef } from "react";
import { SharePointVersionsModal } from "./SharepointVersionModal";
import {
  FileText, FileSpreadsheet, File,
  Search, Download, Eye, ChevronLeft,
  FolderOpen, FolderClosed, FolderPlus, Archive, ShieldCheck, ShieldAlert,
  Clock, User, X, ChevronRight, Home, Loader2,
  Upload, Trash2, Pencil, RefreshCw, Plus, AlertTriangle, History,
  CheckCircle2,
} from "lucide-react";
import PdfViewerModal from "@/app/components/pdf/PdfViewerModal";
import type { PdfMetadata } from "@/app/components/pdf/types";
import type { SharePointDocument }          from "@/types/sharepoint";
import type { SharePointFolder }            from "../config/legalSharepointFolders";
import { can, type AccessLevel }            from "@/lib/roles";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  FileText, Archive, FolderOpen, ShieldCheck, ShieldAlert,
};

const EXT_COLORS: Record<string, string> = {
  pdf:  "bg-red-50 text-red-600 border-red-200",
  docx: "bg-blue-50 text-blue-600 border-blue-200",
  xlsx: "bg-green-50 text-green-600 border-green-200",
  pptx: "bg-orange-50 text-orange-600 border-orange-200",
  doc:  "bg-blue-50 text-blue-600 border-blue-200",
  xls:  "bg-green-50 text-green-600 border-green-200",
};

const ACCENT_COLORS: Record<string, { header: string; text: string; badge: string }> = {
  emerald: { header: "from-emerald-900 to-emerald-700", text: "text-emerald-300", badge: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" },
  teal:    { header: "from-teal-900 to-teal-700",       text: "text-teal-300",    badge: "bg-teal-500/20 text-teal-300 border-teal-500/30"          },
  cyan:    { header: "from-cyan-900 to-cyan-700",       text: "text-cyan-300",    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"           },
  sky:     { header: "from-sky-900 to-sky-700",         text: "text-sky-300",     badge: "bg-sky-500/20 text-sky-300 border-sky-500/30"              },
  violet:  { header: "from-violet-900 to-violet-700",   text: "text-violet-300",  badge: "bg-violet-500/20 text-violet-300 border-violet-500/30"     },
};

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

function getFileIcon(ext: string) {
  if (["xlsx", "xls"].includes(ext)) return <FileSpreadsheet size={15} className="shrink-0" />;
  if (["pdf", "docx", "doc", "pptx"].includes(ext)) return <FileText size={15} className="shrink-0" />;
  return <File size={15} className="shrink-0" />;
}

function toViewerMetadata(doc: SharePointDocument): PdfMetadata {
  return {
    id:     doc.id,
    title:  doc.name,
    author: doc.modifiedBy,
    ...(doc.previewUrl  !== undefined && { previewUrl:  doc.previewUrl  }),
    ...(doc.downloadUrl !== "#"       && { downloadUrl: doc.downloadUrl }),
  };
}

// ─── Tipos internos ───────────────────────────────────────────────────────────

type ModalState =
  | { type: "none"          }
  | { type: "upload"        }
  | { type: "create_folder" }
  | { type: "rename";  item: SharePointDocument }
  | { type: "replace"; item: SharePointDocument }
  | { type: "delete";  item: SharePointDocument };

type ToastState = { message: string; kind: "success" | "error" } | null;

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  folder:      SharePointFolder;
  documents:   SharePointDocument[];
  accessLevel: AccessLevel;
}

// ─── Componente principal ─────────────────────────────────────────────────────

export function SharePointFolderViewer({ folder, documents: rootDocuments, accessLevel }: Props) {
  const canWrite = can(accessLevel, "legal:manage_documents");

  // Pila de navegación: cada entrada es { path, name, items }
  const [navStack, setNavStack] = useState<{ path: string; name: string; items: SharePointDocument[] }[]>([
    { path: folder.siteRelativePath, name: folder.label, items: rootDocuments },
  ]);

  const [search,      setSearch]      = useState("");
  const [filterExt,   setFilterExt]   = useState<string>("all");
  const [page,        setPage]        = useState(1);
  const [viewerOpen,  setViewerOpen]  = useState(false);
  const [viewerMeta,  setViewerMeta]  = useState<PdfMetadata | null>(null);
  const [versionsOpen,  setVersionsOpen]  = useState(false);
  const [versionsItem,  setVersionsItem]  = useState<SharePointDocument | null>(null);
  const [modal,       setModal]       = useState<ModalState>({ type: "none" });
  const [toast,       setToast]       = useState<ToastState>(null);
  const [isPending,   startTransition] = useTransition();

  // Items locales del nivel raíz (optimistic UI)
  const [localRootItems, setLocalRootItems] = useState<SharePointDocument[]>(rootDocuments);

  const accent     = ACCENT_COLORS[folder.accentColor] ?? ACCENT_COLORS["emerald"]!;
  const HeaderIcon = ICON_MAP[folder.iconName] ?? FolderOpen;

  const currentLevel = navStack[navStack.length - 1]!;
  const isRoot       = navStack.length === 1;

  // Items del nivel actual — raíz usa localRootItems para optimistic UI
  const displayItems = isRoot ? localRootItems : currentLevel.items;

  function showToast(message: string, kind: "success" | "error") {
    setToast({ message, kind });
    setTimeout(() => setToast(null), 3500);
  }

  // Extensiones únicas del nivel actual (solo archivos)
  const extensions = useMemo(() => {
    const exts = new Set(
      displayItems.filter((d) => d.kind === "file").map((d) => d.extension.toLowerCase())
    );
    return Array.from(exts).sort();
  }, [displayItems]);

  // Items filtrados — carpetas siempre primero, búsqueda solo sobre archivos
  const filtered = useMemo(() => {
    const folders = displayItems.filter((d) => d.kind === "folder");
    const files   = displayItems
      .filter((d) => d.kind === "file")
      .filter((d) => {
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                            d.modifiedBy.toLowerCase().includes(search.toLowerCase());
        const matchExt    = filterExt === "all" || d.extension.toLowerCase() === filterExt;
        return matchSearch && matchExt;
      });
    return search ? files : [...folders, ...files];
  }, [displayItems, search, filterExt]);

  const fileCount   = displayItems.filter((d) => d.kind === "file").length;
  const folderCount = displayItems.filter((d) => d.kind === "folder").length;

  const PAGE_SIZE   = 15;
  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated   = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Navegación ───────────────────────────────────────────────────────────

  async function enterFolder(item: SharePointDocument) {
    const subPath = `${currentLevel.path}/${item.name}`;
    startTransition(async () => {
      const { getLegalFolderDocuments } = await import("@/lib/graph/departments/legal.sharepoint.service");
      const items = await getLegalFolderDocuments(subPath);
      setNavStack((prev) => [...prev, { path: subPath, name: item.name, items }]);
      setSearch("");
      setFilterExt("all");
      setPage(1);
    });
  }

  function goToLevel(index: number) {
    setNavStack((prev) => prev.slice(0, index + 1));
    setSearch("");
    setFilterExt("all");
    setPage(1);
  }

  function openViewer(doc: SharePointDocument) {
    setViewerMeta(toViewerMetadata(doc));
    setViewerOpen(true);
  }

  // ── Helpers optimistic UI ────────────────────────────────────────────────

  function addItem(newItem: SharePointDocument) {
    if (isRoot) {
      setLocalRootItems((prev) =>
        newItem.kind === "folder" ? [newItem, ...prev] : [...prev, newItem]
      );
    } else {
      setNavStack((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]!;
        const items = newItem.kind === "folder"
          ? [newItem, ...last.items]
          : [...last.items, newItem];
        next[next.length - 1] = { ...last, items };
        return next;
      });
    }
  }

  function updateItem(id: string, patch: Partial<SharePointDocument>) {
    const apply = (items: SharePointDocument[]) =>
      items.map((d) => d.id === id ? { ...d, ...patch } : d);
    if (isRoot) {
      setLocalRootItems(apply);
    } else {
      setNavStack((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]!;
        next[next.length - 1] = { ...last, items: apply(last.items) };
        return next;
      });
    }
  }

  function removeItem(id: string) {
    const apply = (items: SharePointDocument[]) => items.filter((d) => d.id !== id);
    if (isRoot) {
      setLocalRootItems(apply);
    } else {
      setNavStack((prev) => {
        const next = [...prev];
        const last = next[next.length - 1]!;
        next[next.length - 1] = { ...last, items: apply(last.items) };
        return next;
      });
    }
  }

  // ── Handlers CRUD ────────────────────────────────────────────────────────

  async function handleUpload(file: File) {
    const { uploadFile } = await import("@/lib/graph/departments/legal.sharepoint.mutations");
    const result = await uploadFile(currentLevel.path, file);
    if (result.success) {
      addItem({
        id:          `local-file-${Date.now()}`,
        name:        file.name,
        kind:        "file",
        extension:   file.name.split(".").pop()?.toLowerCase() ?? "",
        size:        file.size,
        modifiedAt:  new Date().toISOString(),
        modifiedBy:  "Tú",
        webUrl:      "#",
        downloadUrl: "#",
        previewUrl:  undefined,
      });
      showToast(`"${file.name}" subido correctamente`, "success");
    } else {
      showToast("Error al subir el archivo", "error");
    }
    setModal({ type: "none" });
  }

  async function handleCreateFolder(name: string) {
    const { createFolder } = await import("@/lib/graph/departments/legal.sharepoint.mutations");
    const result = await createFolder(currentLevel.path, name);
    if (result.success) {
      addItem({
        id:          `local-folder-${Date.now()}`,
        name,
        kind:        "folder",
        extension:   "",
        size:        0,
        modifiedAt:  new Date().toISOString(),
        modifiedBy:  "Tú",
        webUrl:      "#",
        downloadUrl: "",
        previewUrl:  undefined,
        childCount:  0,
      });
      showToast(`Carpeta "${name}" creada`, "success");
    } else {
      showToast("Error al crear la carpeta", "error");
    }
    setModal({ type: "none" });
  }

  async function handleRename(item: SharePointDocument, newName: string) {
    if (!newName.trim() || newName === item.name) { setModal({ type: "none" }); return; }
    const { renameItem } = await import("@/lib/graph/departments/legal.sharepoint.mutations");
    const result = await renameItem(item, newName.trim());
    if (result.success) {
      updateItem(item.id, { name: newName.trim() });
      showToast(`Renombrado a "${newName.trim()}"`, "success");
    } else {
      showToast("Error al renombrar", "error");
    }
    setModal({ type: "none" });
  }

  async function handleReplace(item: SharePointDocument, file: File) {
    const { replaceFile } = await import("@/lib/graph/departments/legal.sharepoint.mutations");
    const result = await replaceFile(item, file);
    if (result.success) {
      updateItem(item.id, {
        size:       file.size,
        modifiedAt: new Date().toISOString(),
        modifiedBy: "Tú",
      });
      showToast(`"${item.name}" reemplazado correctamente`, "success");
    } else {
      showToast("Error al reemplazar el archivo", "error");
    }
    setModal({ type: "none" });
  }

  async function handleDelete(item: SharePointDocument) {
    const { deleteItem } = await import("@/lib/graph/departments/legal.sharepoint.mutations");
    const result = await deleteItem(item);
    if (result.success) {
      removeItem(item.id);
      showToast(`"${item.name}" eliminado`, "success");
    } else {
      showToast("Error al eliminar", "error");
    }
    setModal({ type: "none" });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">

      {/* ── Encabezado ── */}
      <div className={`bg-gradient-to-r ${accent.header} px-4 py-3 flex items-center gap-3`}>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <HeaderIcon size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold text-white leading-tight">{folder.label}</p>
          <p className={`truncate text-[11px] ${accent.text} leading-tight`}>{folder.description}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {canWrite && (
            <>
              <button
                onClick={() => setModal({ type: "create_folder" })}
                title="Nueva carpeta"
                className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
              >
                <FolderPlus size={12} />
                Carpeta
              </button>
              <button
                onClick={() => setModal({ type: "upload" })}
                title="Subir archivo"
                className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-white/25 transition-colors"
              >
                <Plus size={12} />
                Subir
              </button>
            </>
          )}
          <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium ${accent.badge}`}>
            {rootDocuments.filter(d => d.kind === "file").length} archivos
          </span>
        </div>
      </div>

      {/* ── Breadcrumb ── */}
      {!isRoot && (
        <div className="flex items-center gap-1 border-b border-slate-100 bg-slate-50 px-3 py-1.5 dark:border-slate-700 dark:bg-slate-800/60 overflow-x-auto">
          {navStack.map((level, idx) => (
            <div key={idx} className="flex items-center gap-1 shrink-0">
              {idx === 0 ? (
                <button
                  onClick={() => goToLevel(0)}
                  className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-700 transition-colors"
                >
                  <Home size={10} /><span>Raíz</span>
                </button>
              ) : (
                <button
                  onClick={() => goToLevel(idx)}
                  className={`rounded px-1.5 py-0.5 text-[11px] transition-colors ${
                    idx === navStack.length - 1
                      ? "font-semibold text-slate-700 dark:text-slate-200"
                      : "text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-700"
                  }`}
                >
                  {level.name}
                </button>
              )}
              {idx < navStack.length - 1 && (
                <ChevronRight size={10} className="text-slate-300" />
              )}
            </div>
          ))}
          {isPending && <Loader2 size={11} className="ml-1 animate-spin text-slate-400" />}
        </div>
      )}

      {/* ── Barra búsqueda + filtro ── */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-3 py-2 dark:border-slate-700">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Buscar en esta carpeta..."
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-7 pr-7 text-[12px] text-slate-700 placeholder-slate-400 outline-none focus:border-slate-400 focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:placeholder-slate-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
        {extensions.length > 1 && !search && (
          <select
            value={filterExt}
            onChange={(e) => { setFilterExt(e.target.value); setPage(1); }}
            className="rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-2 pr-6 text-[12px] text-slate-600 outline-none focus:border-slate-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300"
          >
            <option value="all">Todos</option>
            {extensions.map((ext) => (
              <option key={ext} value={ext}>{ext.toUpperCase()}</option>
            ))}
          </select>
        )}
        <span className="shrink-0 text-[10px] text-slate-400">
          {filtered.length > 0
            ? `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length}`
            : `${!search && folderCount > 0 ? `${folderCount} carpeta${folderCount > 1 ? "s" : ""} · ` : ""}${fileCount} archivo${fileCount !== 1 ? "s" : ""}`
          }
        </span>
      </div>

      {/* ── Lista de items ── */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "360px" }}>
        {isPending ? (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            <p className="text-[12px]">Cargando carpeta...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-slate-400">
            <FolderOpen size={28} className="opacity-40" />
            <p className="text-[12px]">
              {search ? "Sin resultados para la búsqueda" : "Carpeta vacía"}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {paginated.map((item) => {

              // ── Carpeta ──
              if (item.kind === "folder") {
                return (
                  <li key={item.id}>
                    <div className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-amber-50/60 dark:hover:bg-amber-900/10">
                      <button
                        onClick={() => enterFolder(item)}
                        className="flex flex-1 items-center gap-3 min-w-0 text-left"
                      >
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 dark:border-amber-700/40 dark:bg-amber-900/20">
                          <FolderClosed size={14} className="text-amber-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {item.childCount !== undefined ? `${item.childCount} items` : "Carpeta"}
                            {" · "}{formatDate(item.modifiedAt)}
                          </p>
                        </div>
                        <ChevronRight size={13} className="shrink-0 text-slate-300 group-hover:text-amber-400 transition-colors" />
                      </button>
                      {/* Acciones sobre carpeta */}
                      {canWrite && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1">
                          <button
                            onClick={() => setModal({ type: "rename", item })}
                            title="Renombrar carpeta"
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setModal({ type: "delete", item })}
                            title="Eliminar carpeta"
                            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              }

              // ── Archivo ──
              const extClass = EXT_COLORS[item.extension.toLowerCase()] ?? "bg-slate-50 text-slate-500 border-slate-200";
              return (
                <li
                  key={item.id}
                  className="group flex items-center gap-3 px-3 py-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${extClass}`}>
                    {getFileIcon(item.extension)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[12px] font-medium text-slate-700 dark:text-slate-200 leading-tight">
                      {item.name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1"><User size={9} />{item.modifiedBy}</span>
                      <span className="flex items-center gap-1"><Clock size={9} />{formatDate(item.modifiedAt)}</span>
                      <span>{formatSize(item.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {/* Lectura — siempre */}
                    <button
                      onClick={() => openViewer(item)}
                      title="Vista previa"
                      className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    >
                      <Eye size={12} />Ver
                    </button>
                    {item.downloadUrl !== "#" && (
                      <a
                        href={item.downloadUrl}
                        download
                        title="Descargar"
                        className="flex items-center gap-1 rounded px-2 py-1 text-[11px] font-medium text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Download size={12} />
                      </a>
                    )}
                    {/* Escritura — solo legal:manage_documents */}
                    {canWrite && (
                      <>
                        <button
                          onClick={() => setModal({ type: "rename", item })}
                          title="Renombrar"
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => { setVersionsItem(item); setVersionsOpen(true); }}
                          title="Historial de versiones"
                          className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 transition-colors"
                        >
                          <History size={12} />
                        </button>
                        <button
                          onClick={() => setModal({ type: "replace", item })}
                          title="Reemplazar versión"
                          className="rounded p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 transition-colors"
                        >
                          <RefreshCw size={12} />
                        </button>
                        <button
                          onClick={() => setModal({ type: "delete", item })}
                          title="Eliminar"
                          className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 size={12} />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Paginación ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 dark:border-slate-700">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={13} />
            Anterior
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
              const isActive  = p === page;
              const showPage  = p === 1 || p === totalPages || Math.abs(p - page) <= 1;
              const showEllipsisBefore = p === page - 2 && p > 2;
              const showEllipsisAfter  = p === page + 2 && p < totalPages - 1;

              if (showEllipsisBefore || showEllipsisAfter) {
                return <span key={p} className="px-1 text-[11px] text-slate-300">…</span>;
              }
              if (!showPage) return null;

              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`flex h-6 w-6 items-center justify-center rounded-md text-[11px] font-medium transition-colors
                    ${isActive
                      ? "bg-emerald-700 text-white"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                    }`}
                >
                  {p}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed dark:hover:bg-slate-700 transition-colors"
          >
            Siguiente
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="flex items-center gap-1.5 border-t border-slate-100 px-3 py-1.5 dark:border-slate-700">
        <ChevronRight size={10} className="text-slate-300 shrink-0" />
        <p className="truncate font-mono text-[10px] text-slate-400">{currentLevel.path}</p>
        {process.env.NEXT_PUBLIC_AUTH_BYPASS === "true" && (
          <span className="ml-auto shrink-0 rounded bg-amber-50 px-1.5 py-0.5 text-[9px] font-medium text-amber-600 border border-amber-200">
            MOCK
          </span>
        )}
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 shadow-lg text-[12px] font-medium
          ${toast.kind === "success"
            ? "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300"
            : "bg-red-50 border-red-200 text-red-700 dark:bg-red-950/60 dark:border-red-800 dark:text-red-300"
          }`}
        >
          {toast.kind === "success"
            ? <CheckCircle2 size={14} />
            : <AlertTriangle size={14} />
          }
          {toast.message}
        </div>
      )}

      {/* ── Modales CRUD ── */}
      {modal.type !== "none" && (
        <CrudModal
          modal={modal}
          onClose={() => setModal({ type: "none" })}
          onUpload={handleUpload}
          onCreateFolder={handleCreateFolder}
          onRename={handleRename}
          onReplace={handleReplace}
          onDelete={handleDelete}
        />
      )}

      {versionsItem && (
        <SharePointVersionsModal
          open={versionsOpen}
          onClose={() => setVersionsOpen(false)}
          itemId={versionsItem.id}
          fileName={versionsItem.name}
          accessLevel={accessLevel}
          onRestored={() => setVersionsOpen(false)}
        />
      )}

      <PdfViewerModal
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        metadata={viewerMeta}
      />
    </div>
  );
}

// ─── Modal CRUD ───────────────────────────────────────────────────────────────

interface CrudModalProps {
  modal:          ModalState;
  onClose:        () => void;
  onUpload:       (file: File) => Promise<void>;
  onCreateFolder: (name: string) => Promise<void>;
  onRename:       (item: SharePointDocument, newName: string) => Promise<void>;
  onReplace:      (item: SharePointDocument, file: File) => Promise<void>;
  onDelete:       (item: SharePointDocument) => Promise<void>;
}

function CrudModal({
  modal, onClose, onUpload, onCreateFolder, onRename, onReplace, onDelete,
}: CrudModalProps) {
  const [loading,      setLoading]      = useState(false);
  const [inputVal,     setInputVal]     = useState(
    modal.type === "rename" ? modal.item.name : ""
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function submit() {
    setLoading(true);
    try {
      if (modal.type === "upload"        && selectedFile)  await onUpload(selectedFile);
      if (modal.type === "create_folder")                  await onCreateFolder(inputVal);
      if (modal.type === "rename")                         await onRename(modal.item, inputVal);
      if (modal.type === "replace"       && selectedFile)  await onReplace(modal.item, selectedFile);
      if (modal.type === "delete")                         await onDelete(modal.item);
    } finally {
      setLoading(false);
    }
  }

  const TITLES: Record<ModalState["type"], string> = {
    none:          "",
    upload:        "Subir archivo",
    create_folder: "Nueva carpeta",
    rename:        "Renombrar",
    replace:       "Reemplazar versión",
    delete:        "Eliminar",
  };

  const isDisabled =
    loading ||
    (modal.type === "upload"        && !selectedFile)  ||
    (modal.type === "replace"       && !selectedFile)  ||
    (modal.type === "rename"        && !inputVal.trim()) ||
    (modal.type === "create_folder" && !inputVal.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-800">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-700">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {TITLES[modal.type]}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 flex flex-col gap-3">

          {/* Subir archivo */}
          {modal.type === "upload" && (
            <>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Selecciona el archivo que deseas subir a esta carpeta.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-[12px] font-medium text-slate-500 hover:border-emerald-300 hover:bg-emerald-50/40 hover:text-emerald-600 transition-colors dark:border-slate-600 dark:bg-slate-700/40"
              >
                <Upload size={16} />
                {selectedFile ? selectedFile.name : "Seleccionar archivo"}
              </button>
              <input
                ref={fileInputRef} type="file" className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </>
          )}

          {/* Nueva carpeta */}
          {modal.type === "create_folder" && (
            <>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Nombre de la nueva carpeta en esta ubicación.
              </p>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !isDisabled) submit(); }}
                placeholder="Nombre de carpeta..."
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-emerald-400 focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </>
          )}

          {/* Renombrar */}
          {modal.type === "rename" && (
            <>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Nuevo nombre para{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {modal.item.name}
                </span>
              </p>
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !isDisabled) submit(); }}
                autoFocus
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] text-slate-700 outline-none focus:border-emerald-400 focus:bg-white dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200"
              />
            </>
          )}

          {/* Reemplazar */}
          {modal.type === "replace" && (
            <>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Selecciona la nueva versión de{" "}
                <span className="font-medium text-slate-700 dark:text-slate-200">
                  {modal.item.name}
                </span>.
                SharePoint guardará la versión anterior en el historial.
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 py-6 text-[12px] font-medium text-slate-500 hover:border-blue-300 hover:bg-blue-50/40 hover:text-blue-600 transition-colors dark:border-slate-600 dark:bg-slate-700/40"
              >
                <RefreshCw size={16} />
                {selectedFile ? selectedFile.name : "Seleccionar nueva versión"}
              </button>
              <input
                ref={fileInputRef} type="file" className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </>
          )}

          {/* Eliminar */}
          {modal.type === "delete" && (
            <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/60 p-3 dark:border-red-900/40 dark:bg-red-950/20">
              <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
              <div>
                <p className="text-[12px] font-semibold text-red-700 dark:text-red-400">
                  ¿Eliminar "{modal.item.name}"?
                </p>
                <p className="text-[11px] text-red-500 mt-0.5 leading-relaxed">
                  {modal.item.kind === "folder"
                    ? "La carpeta y todo su contenido se moverán a la papelera de SharePoint."
                    : "El archivo se moverá a la papelera de SharePoint."
                  } Esta acción se puede revertir desde SharePoint directamente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3 dark:border-slate-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-[12px] font-medium text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={isDisabled}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-[12px] font-semibold text-white transition-colors disabled:opacity-40
              ${modal.type === "delete"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-700 hover:bg-emerald-800"
              }`}
          >
            {loading && <Loader2 size={12} className="animate-spin" />}
            {modal.type === "upload"        && "Subir"}
            {modal.type === "create_folder" && "Crear"}
            {modal.type === "rename"        && "Renombrar"}
            {modal.type === "replace"       && "Reemplazar"}
            {modal.type === "delete"        && "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}