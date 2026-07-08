"use client";

/**
 * @module DocumentWorkspace
 *
 * Workspace principal del módulo documental.
 */

import {
  ExternalLink,
  FileText,
  Folder,
  FolderOpen,
  Library,
  Loader2,
} from "lucide-react";

import { DepartmentSidebar } from "./DepartmentSidebar";
import { useDocumentExplorer } from "../../hooks/useDocumentExplorer";

export function DocumentWorkspace() {
  const {
    selectedDepartment,
    selectedLibrary,
    selectedDepartmentLibraries,
    currentItems,
    breadcrumbs,
    loading,
    error,
    selectDepartment,
    selectLibrary,
    openFolder,
    goToBreadcrumb,
  } = useDocumentExplorer();

  const isLoadingLibraries = loading === "libraries";
  const isLoadingItems = loading === "items" || loading === "folder";

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <DepartmentSidebar
        {...(selectedDepartment ? { selectedDepartment } : {})}
        onSelectDepartment={selectDepartment}
      />

      <article className="min-h-[700px] rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <header className="border-b border-slate-200 px-8 py-6 dark:border-slate-800">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            Gestión documental
          </span>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {selectedDepartment?.name ?? "Selecciona un área documental"}
          </h2>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
            {selectedDepartment
              ? selectedDepartment.description ??
                "Explora las bibliotecas, carpetas y documentos disponibles para esta área."
              : "Elige un área desde el panel izquierdo para consultar sus documentos reales desde SharePoint."}
          </p>
        </header>

        <div className="p-8">
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              {error}
            </div>
          )}

          {!selectedDepartment && (
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

          {selectedDepartment && !selectedLibrary && (
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

                {isLoadingLibraries && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                )}
              </div>

              {isLoadingLibraries ? (
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

          {selectedDepartment && selectedLibrary && (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    {selectedLibrary.name ?? "Biblioteca"}
                  </h3>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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
                </div>

                {isLoadingItems && (
                  <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                )}
              </div>

              {isLoadingItems ? (
                <div className="grid gap-3">
                  {Array.from({ length: 7 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-900"
                    />
                  ))}
                </div>
              ) : currentItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                  No hay elementos disponibles en esta ubicación.
                </div>
              ) : (
                <div className="grid gap-3">
                  {currentItems.map((item) => {
                    const isFolder = Boolean(item.folder);

                    return (
                      <article
                        key={item.id}
                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-indigo-200 hover:bg-indigo-50/60 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-500/10"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-indigo-600 dark:bg-slate-900 dark:text-indigo-300">
                          {isFolder ? (
                            <Folder size={21} strokeWidth={1.9} />
                          ) : (
                            <FileText size={21} strokeWidth={1.9} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                            {item.name ?? "Sin nombre"}
                          </strong>

                          <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                            {isFolder
                              ? `${item.folder?.childCount ?? 0} elementos`
                              : item.file?.mimeType ?? "Archivo"}
                          </span>
                        </div>

                        {isFolder ? (
                          <button
                            type="button"
                            onClick={() => openFolder(item)}
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-700"
                          >
                            Abrir
                          </button>
                        ) : item.webUrl ? (
                          <a
                            href={item.webUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-indigo-600 hover:text-white dark:bg-slate-900 dark:text-slate-200"
                          >
                            SharePoint
                            <ExternalLink size={14} />
                          </a>
                        ) : null}
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </article>
    </section>
  );
}