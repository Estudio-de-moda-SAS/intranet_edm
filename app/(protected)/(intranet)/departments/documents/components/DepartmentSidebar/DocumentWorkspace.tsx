"use client";

/**
 * @module DocumentWorkspace
 *
 * Workspace principal del módulo documental.
 *
 * @remarks
 * Punto de entrada del Explorador Documental Corporativo. Permite alternar
 * entre las fuentes documentales soportadas (`my-drive`, `shared`,
 * `corporate-sites`, `teams`), navegar carpetas mediante breadcrumbs, y
 * previsualizar documentos usando {@link PdfViewerModal}.
 */

import { useEffect, useState } from "react";
import {
  Building2,
  ChevronRight,
  Folder,
  FolderOpen,
  HardDrive,
  Library,
  Loader2,
  Share2,
  Users,
} from "lucide-react";

import { DepartmentSidebar } from "./DepartmentSidebar";
import { useDocumentExplorer } from "../../hooks/useDocumentExplorer";
import { loadDocumentPreviewUrl } from "../../services/documentSource.service";
import { mapDocumentItemToPdfMetadata } from "../../utils/mapDocumentItemToPdfMetadata";
import { formatFileSize, formatShortDate } from "../../utils/formatDocumentMeta";
import { getDocumentIcon } from "../../utils/getDocumentIcon";
import type { DocumentItem, DocumentSourceType } from "../../types/document.types";
import PdfViewerModal from "@/app/components/pdf/PdfViewerModal";

interface SourceTabConfig {
  id: DocumentSourceType;
  label: string;
  icon: typeof HardDrive;
}

const SOURCE_TABS: readonly SourceTabConfig[] = [
  { id: "my-drive", label: "Mi unidad", icon: HardDrive },
  { id: "shared", label: "Compartidos conmigo", icon: Share2 },
  { id: "teams", label: "Mis equipos", icon: Users },
  { id: "corporate-sites", label: "Áreas corporativas", icon: Building2 },
];

export function DocumentWorkspace() {
  const {
    activeSource,
    selectedDepartment,
    selectedLibrary,
    selectedDepartmentLibraries,
    teamDrives,
    selectedTeamDrive,
    currentItems,
    breadcrumbs,
    loading,
    error,
    switchSource,
    selectDepartment,
    selectLibrary,
    selectTeamDrive,
    openFolder,
    goToBreadcrumb,
  } = useDocumentExplorer();

  const [previewItem, setPreviewItem] = useState<DocumentItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    void switchSource("my-drive");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLoadingPickers = loading === "libraries";
  const isLoadingItems = loading === "root" || loading === "folder";

  const isCorporateSites = activeSource === "corporate-sites";
  const isTeams = activeSource === "teams";

  const showLibraryPicker = isCorporateSites && selectedDepartment && !selectedLibrary;
  const showTeamPicker = isTeams && !selectedTeamDrive;

  const showItemsList =
    activeSource === "my-drive" ||
    activeSource === "shared" ||
    (isCorporateSites && Boolean(selectedDepartment) && Boolean(selectedLibrary)) ||
    (isTeams && Boolean(selectedTeamDrive));

  const headerTitle = isCorporateSites
    ? selectedDepartment?.name ?? "Áreas corporativas"
    : isTeams
      ? selectedTeamDrive?.name ?? "Mis equipos"
      : SOURCE_TABS.find((tab) => tab.id === activeSource)?.label ?? "Documentos";

  const headerDescription = isCorporateSites
    ? selectedDepartment
      ? selectedDepartment.description ??
        "Explora las bibliotecas, carpetas y documentos disponibles para esta área."
      : "Elige un área desde el panel izquierdo para consultar sus documentos."
    : isTeams
      ? selectedTeamDrive
        ? `Documentos del equipo ${selectedTeamDrive.name ?? ""}.`
        : "Elige un equipo para consultar sus documentos."
      : activeSource === "my-drive"
        ? "Tus archivos y carpetas personales en OneDrive."
        : "Documentos y carpetas que otras personas compartieron contigo.";

  const handleOpenPreview = async (item: DocumentItem) => {
    setPreviewItem(item);
    setPreviewUrl(undefined);

    try {
      const url = await loadDocumentPreviewUrl(item);
      setPreviewUrl(url);
    } catch (previewError) {
      console.error("[Document Workspace] preview", previewError);
    }
  };

  const handleOpenItem = (item: DocumentItem) => {
    if (item.isFolder) {
      openFolder(item);
    } else {
      void handleOpenPreview(item);
    }
  };

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      {isCorporateSites ? (
        <DepartmentSidebar
          {...(selectedDepartment ? { selectedDepartment } : {})}
          onSelectDepartment={selectDepartment}
        />
      ) : (
        <nav className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <span className="mb-3 block px-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
            Fuentes documentales
          </span>

          <ul className="flex flex-col gap-1">
            {SOURCE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeSource;

              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => switchSource(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"
                    }`}
                  >
                    <Icon size={18} strokeWidth={1.9} />
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <article className="min-h-[700px] rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <header className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
          {isCorporateSites && (
            <div className="mb-4 flex gap-2">
              {SOURCE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = tab.id === activeSource;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => switchSource(tab.id)}
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                      isActive
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300"
                    }`}
                  >
                    <Icon size={14} strokeWidth={2} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            Gestión documental
          </span>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {headerTitle}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {headerDescription}
          </p>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {isCorporateSites && !selectedDepartment && (
            <div className="flex min-h-[460px] flex-col items-center justify-center text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <FolderOpen size={34} strokeWidth={1.8} />
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                Selecciona un área documental
              </h3>

              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Cuando selecciones un área, cargaremos sus bibliotecas reales
                desde SharePoint.
              </p>
            </div>
          )}

          {showLibraryPicker && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Bibliotecas disponibles
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Selecciona una biblioteca para ver su contenido.
                  </p>
                </div>

                {isLoadingPickers && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                )}
              </div>

              {isLoadingPickers ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
                    />
                  ))}
                </div>
              ) : selectedDepartmentLibraries.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No se encontraron bibliotecas para esta área.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {selectedDepartmentLibraries.map((library) => (
                    <button
                      key={library.id}
                      type="button"
                      onClick={() => selectLibrary(library)}
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-300">
                        <Library size={21} strokeWidth={1.9} />
                      </div>

                      <strong className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                        {library.name ?? "Biblioteca sin nombre"}
                      </strong>

                      <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {library.webUrl ?? "SharePoint"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {showTeamPicker && (
            <>
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Tus equipos
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Selecciona un equipo para ver sus documentos.
                  </p>
                </div>

                {isLoadingPickers && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                )}
              </div>

              {isLoadingPickers ? (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
                    />
                  ))}
                </div>
              ) : teamDrives.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No se encontraron equipos con biblioteca de documentos.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {teamDrives.map((drive) => (
                    <button
                      key={drive.id}
                      type="button"
                      onClick={() => selectTeamDrive(drive)}
                      className="group rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:-translate-y-1 hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                    >
                      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-300">
                        <Users size={21} strokeWidth={1.9} />
                      </div>

                      <strong className="block text-sm font-bold text-slate-900 dark:text-slate-100">
                        {drive.name ?? "Equipo sin nombre"}
                      </strong>

                      <span className="mt-2 block truncate text-xs text-slate-500 dark:text-slate-400">
                        {drive.webUrl ?? "SharePoint"}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {showItemsList && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <button
                      key={breadcrumb.id}
                      type="button"
                      onClick={() => goToBreadcrumb(breadcrumb.id)}
                      className="rounded-full bg-slate-100 px-3 py-1 font-medium transition hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-900 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-300"
                    >
                      {index > 0 ? "/ " : ""}
                      {breadcrumb.name}
                    </button>
                  ))}
                </div>

                {isLoadingItems && (
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                )}
              </div>

              {isLoadingItems ? (
                <div className="flex flex-col gap-1">
                  {Array.from({ length: 8 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-11 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900"
                    />
                  ))}
                </div>
              ) : currentItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No hay elementos disponibles en esta ubicación.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="max-h-[560px] overflow-y-auto">
                    <table className="w-full table-fixed border-collapse text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
                          <th className="w-[52%] px-4 py-2.5 font-semibold">Documento</th>
                          <th className="w-[16%] px-4 py-2.5 font-semibold">Tamaño</th>
                          <th className="w-[22%] px-4 py-2.5 font-semibold">Modificado</th>
                          <th className="w-[10%] px-4 py-2.5" aria-hidden="true" />
                        </tr>
                      </thead>

                      <tbody>
                        {currentItems.map((item) => {
                          const { icon: ItemIcon, colorClass } = item.isFolder
                            ? { icon: Folder, colorClass: "text-indigo-500" }
                            : getDocumentIcon(item.name);

                          return (
                            <tr
                              key={item.id}
                              onClick={() => handleOpenItem(item)}
                              className="group cursor-pointer border-b border-slate-100 transition last:border-0 hover:bg-indigo-50/50 dark:border-slate-900 dark:hover:bg-indigo-500/5"
                            >
                              <td className="px-4 py-2.5">
                                <div className="flex items-center gap-3">
                                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-900">
                                    <ItemIcon size={16} strokeWidth={2} className={colorClass} />
                                  </span>

                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                                      {item.name}
                                    </p>
                                    {item.sharedBy && (
                                      <p className="truncate text-xs text-slate-400">
                                        Compartido por {item.sharedBy}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                                {item.isFolder
                                  ? `${item.childCount ?? 0} elementos`
                                  : formatFileSize(item.size)}
                              </td>

                              <td className="whitespace-nowrap px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">
                                {formatShortDate(item.lastModifiedDateTime)}
                              </td>

                              <td className="px-4 py-2.5 text-right">
                                <ChevronRight
                                  size={16}
                                  className="ml-auto text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-indigo-500 dark:text-slate-600"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </article>

      <PdfViewerModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        metadata={previewItem ? mapDocumentItemToPdfMetadata(previewItem, previewUrl) : null}
      />
    </section>
  );
}