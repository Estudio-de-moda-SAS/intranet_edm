"use client";

/**
 * @module DocumentWorkspace
 *
 * Workspace principal del módulo documental.
 *
 * @remarks
 * Punto de entrada del Explorador Documental Corporativo. Permite alternar
 * entre las fuentes documentales soportadas, navegar carpetas y subsitios
 * mediante breadcrumbs, filtrar localmente los documentos cargados,
 * previsualizar/abrir documentos externamente, y subir archivos a la
 * carpeta actual (solo disponible en Áreas corporativas por ahora).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import {
  Building2,
  ChevronRight,
  Eye,
  FileStack,
  Folder,
  FolderOpen,
  HardDrive,
  Loader2,
  Search,
  Share2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

import { DepartmentSidebar } from "../DepartmentSidebar/DepartmentSidebar";
import { useDocumentExplorer } from "../../hooks/useDocumentExplorer";
import { loadDocumentPreviewUrl } from "../../services/documentSource.service";
import { mapDocumentItemToPdfMetadata } from "../../utils/mapDocumentItemToPdfMetadata";
import { formatFileSize, formatShortDate } from "../../utils/formatDocumentMeta";
import { getDocumentIcon } from "../../utils/getDocumentIcon";
import type { DocumentItem, DocumentSourceType } from "../../types/document.types";
import PdfViewerModal from "@/app/components/pdf/PdfViewerModal";
import "./DocumentWorkspace.css";

interface SourceTabConfig {
  id: DocumentSourceType;
  label: string;
  icon: typeof HardDrive;
}

const SOURCE_TABS: readonly SourceTabConfig[] = [
  { id: "my-drive", label: "Mi unidad", icon: HardDrive },
  { id: "shared", label: "Compartidos conmigo", icon: Share2 },
  { id: "corporate-sites", label: "Áreas corporativas", icon: Building2 },
];

export function DocumentWorkspace() {
  const {
    activeSource,
    selectedDepartment,
    selectedLibrary,
    selectedDepartmentLibraries,
    selectedDepartmentSubsites,
    siteTrail,
    currentItems,
    breadcrumbs,
    loading,
    error,
    canUploadHere,
    uploadingFile,
    switchSource,
    selectDepartment,
    selectLibrary,
    drillIntoSubsite,
    goToSiteTrail,
    openFolder,
    goToBreadcrumb,
    uploadFile,
  } = useDocumentExplorer();

  const [previewItem, setPreviewItem] = useState<DocumentItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [localQuery, setLocalQuery] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  useEffect(() => {
    void switchSource("my-drive");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalQuery("");
  }, [activeSource, selectedLibrary, breadcrumbs.length]);

  const isLoadingPickers = loading === "libraries";
  const isLoadingItems = loading === "root" || loading === "folder";

  const isCorporateSites = activeSource === "corporate-sites";

  const showLibraryPicker =
    isCorporateSites && selectedDepartment && !selectedLibrary;

  const showItemsList =
    activeSource === "my-drive" ||
    activeSource === "shared" ||
    (isCorporateSites && Boolean(selectedDepartment) && Boolean(selectedLibrary));

  const filteredItems = useMemo(() => {
    const query = localQuery.trim().toLowerCase();
    if (!query) return currentItems;
    return currentItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [currentItems, localQuery]);

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

  const handleOpenExternal = (item: DocumentItem) => {
    if (item.webUrl) {
      window.open(item.webUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) void uploadFile(file);
    event.target.value = "";
  };

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    if (!canUploadHere) return;
    event.preventDefault();
    dragCounterRef.current += 1;
    setIsDraggingOver(true);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    if (!canUploadHere) return;
    event.preventDefault();
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    if (!canUploadHere) return;
    event.preventDefault();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    if (!canUploadHere) return;
    event.preventDefault();
    dragCounterRef.current = 0;
    setIsDraggingOver(false);

    const file = event.dataTransfer.files?.[0];
    if (file) void uploadFile(file);
  };

  return (
    <section className="document-workspace">
      {isCorporateSites ? (
        <DepartmentSidebar
          {...(selectedDepartment ? { selectedDepartment } : {})}
          onSelectDepartment={selectDepartment}
        />
      ) : (
        <nav className="document-workspace__source-nav">
          <span className="document-workspace__source-nav-label">
            Fuentes documentales
          </span>

          <div className="document-workspace__source-list">
            {SOURCE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeSource;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => switchSource(tab.id)}
                  className={[
                    "document-workspace__source-item",
                    isActive ? "document-workspace__source-item--active" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <Icon size={17} strokeWidth={2} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      <article className="document-workspace__panel">
        <div className="document-workspace__body">
          <div className="document-workspace__top-row">
            {isCorporateSites ? (
              <div className="document-workspace__tabs">
                {SOURCE_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = tab.id === activeSource;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => switchSource(tab.id)}
                      className={[
                        "document-workspace__tab",
                        isActive ? "document-workspace__tab--active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      <Icon size={13} strokeWidth={2} />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            ) : (
              <span />
            )}

            {(isLoadingPickers || isLoadingItems) && (
              <Loader2 className="document-workspace__spinner" />
            )}
          </div>

          {error && <div className="document-workspace__error">{error}</div>}

          {isCorporateSites && !selectedDepartment && (
            <div className="document-workspace__empty-state">
              <div className="document-workspace__empty-icon">
                <FolderOpen size={34} strokeWidth={1.8} />
              </div>

              <h3 className="document-workspace__empty-title">
                Selecciona un área documental
              </h3>

              <p className="document-workspace__empty-description">
                Cuando selecciones un área, cargaremos sus bibliotecas reales
                desde SharePoint.
              </p>
            </div>
          )}

          {showLibraryPicker && (
            <>
              {siteTrail.length > 1 && (
                <div className="document-workspace__trail">
                  {siteTrail.map((trailSite, index) => (
                    <button
                      key={trailSite.id}
                      type="button"
                      onClick={() => goToSiteTrail(index)}
                      className="document-workspace__trail-item"
                    >
                      {index > 0 ? "/ " : ""}
                      {trailSite.displayName ?? trailSite.name ?? "Sitio"}
                    </button>
                  ))}
                </div>
              )}

              {isLoadingPickers ? (
                <div className="document-workspace__library-skeleton">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="document-workspace__library-skeleton-row"
                    />
                  ))}
                </div>
              ) : selectedDepartmentLibraries.length === 0 &&
                selectedDepartmentSubsites.length === 0 ? (
                <div className="document-workspace__inline-empty">
                  No se encontraron bibliotecas ni subsitios para esta área.
                </div>
              ) : (
                <div className="document-workspace__picker-list">
                  {selectedDepartmentLibraries.map((library) => (
                    <button
                      key={library.id}
                      type="button"
                      onClick={() => selectLibrary(library)}
                      className="document-workspace__picker-item"
                    >
                      <span className="document-workspace__picker-icon">
                        <FileStack size={17} strokeWidth={2} />
                      </span>

                      <span className="document-workspace__picker-content">
                        <span className="document-workspace__picker-title">
                          {library.name ?? "Biblioteca sin nombre"}
                        </span>
                        <span className="document-workspace__picker-type">
                          Biblioteca de documentos
                        </span>
                      </span>

                      <ChevronRight
                        size={16}
                        className="document-workspace__picker-arrow"
                      />
                    </button>
                  ))}

                  {selectedDepartmentSubsites.map((subsite) => (
                    <button
                      key={subsite.id}
                      type="button"
                      onClick={() => drillIntoSubsite(subsite)}
                      className="document-workspace__picker-item document-workspace__picker-item--subsite"
                    >
                      <span className="document-workspace__picker-icon">
                        <FolderOpen size={17} strokeWidth={2} />
                      </span>

                      <span className="document-workspace__picker-content">
                        <span className="document-workspace__picker-title">
                          {subsite.displayName ?? subsite.name ?? "Subsitio"}
                        </span>
                        <span className="document-workspace__picker-type">
                          Subsitio · Explorar
                        </span>
                      </span>

                      <ChevronRight
                        size={16}
                        className="document-workspace__picker-arrow"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {showItemsList && (
            <>
              <div className="document-workspace__toolbar">
                <div className="document-workspace__breadcrumbs">
                  {breadcrumbs.map((breadcrumb, index) => (
                    <button
                      key={breadcrumb.id}
                      type="button"
                      onClick={() => goToBreadcrumb(breadcrumb.id)}
                      className="document-workspace__breadcrumb"
                    >
                      {index > 0 ? "/ " : ""}
                      {breadcrumb.name}
                    </button>
                  ))}
                </div>

                <div className="document-workspace__local-search">
                  <Search size={15} strokeWidth={2} />

                  <input
                    type="search"
                    placeholder="Buscar en esta carpeta..."
                    value={localQuery}
                    onChange={(event) => setLocalQuery(event.target.value)}
                  />

                  {localQuery && (
                    <button
                      type="button"
                      onClick={() => setLocalQuery("")}
                      aria-label="Limpiar búsqueda"
                      className="document-workspace__local-search-clear"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {canUploadHere && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      style={{ display: "none" }}
                      onChange={handleFileInputChange}
                    />

                    <button
                      type="button"
                      onClick={handlePickFile}
                      disabled={uploadingFile}
                      className="document-workspace__upload-btn"
                    >
                      <Upload size={14} strokeWidth={2} />
                      {uploadingFile ? "Subiendo..." : "Subir archivo"}
                    </button>
                  </>
                )}
              </div>

              <div
                className={[
                  "document-workspace__dropzone",
                  isDraggingOver ? "document-workspace__dropzone--active" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                onDragEnter={handleDragEnter}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isDraggingOver && (
                  <div className="document-workspace__dropzone-overlay">
                    <UploadCloud size={20} strokeWidth={2} />
                    Suelta el archivo para subirlo aquí
                  </div>
                )}

                {isLoadingItems ? (
                  <div className="document-workspace__skeleton-rows">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="document-workspace__skeleton-row"
                      />
                    ))}
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="document-workspace__inline-empty">
                    {localQuery
                      ? `No hay resultados para "${localQuery}".`
                      : "No hay elementos disponibles en esta ubicación."}
                  </div>
                ) : (
                  <div className="document-workspace__table-wrapper">
                    <div className="document-workspace__table-scroll">
                      <table className="document-workspace__table">
                        <thead>
                          <tr>
                            <th style={{ width: "46%" }}>Documento</th>
                            <th style={{ width: "14%" }}>Tamaño</th>
                            <th style={{ width: "18%" }}>Modificado</th>
                            <th style={{ width: "22%", textAlign: "right" }}>
                              Acciones
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {filteredItems.map((item) => {
                            const { icon: ItemIcon, colorClass } = item.isFolder
                              ? { icon: Folder, colorClass: "" }
                              : getDocumentIcon(item.name);

                            return (
                              <tr
                                key={item.id}
                                className="document-workspace__table-row"
                              >
                                <td
                                  className={
                                    item.isFolder
                                      ? "document-workspace__row-name-cell--clickable"
                                      : ""
                                  }
                                  onClick={() =>
                                    item.isFolder && openFolder(item)
                                  }
                                >
                                  <div className="document-workspace__row-name">
                                    <span className="document-workspace__row-icon-box">
                                      <ItemIcon
                                        size={16}
                                        strokeWidth={2}
                                        className={colorClass}
                                        style={
                                          item.isFolder
                                            ? { color: "#7c3aed" }
                                            : undefined
                                        }
                                      />
                                    </span>

                                    <div className="document-workspace__row-text">
                                      <p className="document-workspace__row-title">
                                        {item.name}
                                      </p>
                                      {item.sharedBy && (
                                        <p className="document-workspace__row-subtitle">
                                          Compartido por {item.sharedBy}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </td>

                                <td className="document-workspace__row-meta">
                                  {item.isFolder
                                    ? `${item.childCount ?? 0} elementos`
                                    : formatFileSize(item.size)}
                                </td>

                                <td className="document-workspace__row-meta">
                                  {formatShortDate(item.lastModifiedDateTime)}
                                </td>

                                <td>
                                  <div className="document-workspace__row-actions">
                                    {item.isFolder ? (
                                      <button
                                        type="button"
                                        onClick={() => openFolder(item)}
                                        className="document-workspace__action-btn"
                                      >
                                        Abrir
                                        <ChevronRight size={12} />
                                      </button>
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenPreview(item)}
                                          className="document-workspace__action-btn"
                                        >
                                          <Eye size={12} />
                                          Vista previa
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() => handleOpenExternal(item)}
                                          disabled={!item.webUrl}
                                          className="document-workspace__action-btn"
                                        >
                                          Abrir
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </article>

      <PdfViewerModal
        open={Boolean(previewItem)}
        onClose={() => setPreviewItem(null)}
        metadata={
          previewItem
            ? mapDocumentItemToPdfMetadata(previewItem, previewUrl)
            : null
        }
      />
    </section>
  );
}