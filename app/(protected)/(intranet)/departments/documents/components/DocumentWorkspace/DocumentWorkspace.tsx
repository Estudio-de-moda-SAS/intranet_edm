"use client";

/**
 * @module DocumentWorkspace
 *
 * Workspace principal del módulo documental.
 *
 * @remarks
 * Punto de entrada del Explorador Documental Corporativo. Permite alternar
 * entre las fuentes documentales soportadas, navegar carpetas y subsitios
 * mediante una ruta combinada (sitio + carpetas) siempre visible, con un
 * botón "Atrás" para retroceder un nivel a la vez sin tener que reentrar
 * al área desde cero. También soporta filtrado local, previsualización,
 * apertura/descarga de documentos, subida de archivos, y deep-links del
 * buscador global con resaltado del archivo encontrado.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import type { DragEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ChevronRight,
  Download,
  Eye,
  FileStack,
  Folder,
  FolderOpen,
  HardDrive,
  Loader2,
  Lock,
  Search,
  Share2,
  Upload,
  UploadCloud,
  X,
} from "lucide-react";

import { DepartmentSidebar } from "../DepartmentSidebar/DepartmentSidebar";
import { useDocumentExplorer } from "../../hooks/useDocumentExplorer";
import { loadDocumentPreviewUrl } from "../../services/documentSource.service";
import { getDocumentDepartmentById } from "../../services/documentCatalog.service";
import { mapDocumentItemToPdfMetadata } from "../../utils/mapDocumentItemToPdfMetadata";
import { formatFileSize, formatShortDate } from "../../utils/formatDocumentMeta";
import { getDocumentIcon } from "../../utils/getDocumentIcon";
import type {
  DocumentItem,
  DocumentLocation,
  DocumentSourceType,
} from "../../types/document.types";
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
  { id: "corporate-sites", label: "Carpetas Corporativas", icon: Building2 },
];

interface PathSegment {
  id: string;
  name: string;
  onClick: () => void;
}

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
    accessDenied,
    canUploadHere,
    uploadingFile,
    highlightedItemId,
    switchSource,
    selectDepartment,
    selectLibrary,
    drillIntoSubsite,
    goToSiteTrail,
    openFolder,
    goToBreadcrumb,
    uploadFile,
    openLocationDirect,
  } = useDocumentExplorer();

  const searchParams = useSearchParams();

  const [previewItem, setPreviewItem] = useState<DocumentItem | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined);
  const [localQuery, setLocalQuery] = useState("");
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  /**
   * Resuelve deep-links de entrada al módulo:
   * - `?source=my-drive&folder=...&highlight=...` (buscador global de docs).
   * - `?source=corporate-sites&driveId=...&folder=...&highlight=...`
   *   (buscador global de docs dentro de un área/biblioteca corporativa).
   * - `?source=corporate-sites&area=...` (buscador global de áreas — ver
   *   `globalAreaSearch.service.ts`). La búsqueda del área es async porque
   *   `getDocumentDepartmentById` resuelve contra el catálogo dinámico
   *   (`documentCatalog.service.ts`, cacheado en memoria) en vez de un
   *   array estático — por eso el fallback a "Mi unidad" vive DENTRO del
   *   bloque async: si se dejara fuera, se dispararía antes de que la
   *   promesa resuelva y causaría un parpadeo entre fuentes.
   */
  useEffect(() => {
    const source = searchParams.get("source");
    const folder = searchParams.get("folder");
    const highlight = searchParams.get("highlight");
    const areaId = searchParams.get("area");
    const driveId = searchParams.get("driveId");

    if (source === "my-drive") {
      const location: DocumentLocation = {
        driveId: "my-drive",
        itemId: folder,
      };
      void openLocationDirect("my-drive", location, highlight ?? undefined);
      return;
    }

    if (source === "corporate-sites" && driveId) {
      const location: DocumentLocation = { driveId, itemId: folder };
      void openLocationDirect("corporate-sites", location, highlight ?? undefined);
      return;
    }

    if (source === "corporate-sites" && areaId) {
      void (async () => {
        const department = await getDocumentDepartmentById(areaId);

        if (department) {
          await switchSource("corporate-sites");
          await selectDepartment(department);
        } else {
          await switchSource("my-drive");
        }
      })();
      return;
    }

    void switchSource("my-drive");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLocalQuery("");
  }, [activeSource, selectedLibrary, breadcrumbs.length]);

  useEffect(() => {
    if (!highlightedItemId) return;

    const el = document.getElementById(`doc-row-${highlightedItemId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightedItemId, currentItems]);

  const isLoadingPickers = loading === "libraries";
  const isLoadingItems = loading === "root" || loading === "folder";

  const isCorporateSites = activeSource === "corporate-sites";

  const showLibraryPicker =
    isCorporateSites && selectedDepartment && !selectedLibrary;

  /**
   * Depende solo de `selectedLibrary` (no de `selectedDepartment` también):
   * los deep-links del buscador global de documentos entran directo a una
   * biblioteca vía `openLocationDirect`, sin pasar por el flujo manual
   * sidebar -> selectDepartment -> selectLibrary, así que
   * `selectedDepartment` puede quedar en `null` aunque los items ya estén
   * cargados y listos para mostrarse.
   */
  const showItemsList =
    activeSource === "my-drive" ||
    activeSource === "shared" ||
    (isCorporateSites && Boolean(selectedLibrary));

  const filteredItems = useMemo(() => {
    const query = localQuery.trim().toLowerCase();
    if (!query) return currentItems;
    return currentItems.filter((item) =>
      item.name.toLowerCase().includes(query)
    );
  }, [currentItems, localQuery]);

  /**
   * Ruta combinada: sitio/subsitio (siteTrail) + biblioteca/carpetas
   * (breadcrumbs) en una sola secuencia clickeable, para nunca perder de
   * vista de dónde vienes, sin importar qué tan profundo hayas navegado.
   */
  const fullPathSegments: PathSegment[] = useMemo(() => {
    const siteSegments: PathSegment[] = isCorporateSites
      ? siteTrail.map((site, index) => ({
          id: `site-${site.id}-${index}`,
          name: site.displayName ?? site.name ?? "Sitio",
          onClick: () => void goToSiteTrail(index),
        }))
      : [];

    const crumbSegments: PathSegment[] = breadcrumbs.map((crumb) => ({
      id: `crumb-${crumb.id}`,
      name: crumb.name,
      onClick: () => void goToBreadcrumb(crumb.id),
    }));

    return [...siteSegments, ...crumbSegments];
  }, [isCorporateSites, siteTrail, breadcrumbs, goToSiteTrail, goToBreadcrumb]);

  const canGoBackInPicker = siteTrail.length > 1;

  const canGoBackInItems =
    breadcrumbs.length > 1 || (isCorporateSites && siteTrail.length > 0);

  const handleGoBackInPicker = () => {
    if (siteTrail.length > 1) {
      void goToSiteTrail(siteTrail.length - 2);
    }
  };

  const handleGoBackInItems = () => {
    if (breadcrumbs.length > 1) {
      const target = breadcrumbs[breadcrumbs.length - 2];
      if (target) void goToBreadcrumb(target.id);
      return;
    }

    if (isCorporateSites && siteTrail.length > 0) {
      void goToSiteTrail(siteTrail.length - 1);
    }
  };

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

  const handleDownload = (item: DocumentItem) => {
    if (item.downloadUrl) {
      window.open(item.downloadUrl, "_blank", "noopener,noreferrer");
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

          {isCorporateSites && !selectedDepartment && !selectedLibrary && (
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
                  <button
                    type="button"
                    onClick={handleGoBackInPicker}
                    disabled={!canGoBackInPicker}
                    className="document-workspace__back-btn"
                    title="Atrás"
                    aria-label="Atrás"
                  >
                    <ArrowLeft size={15} strokeWidth={2.2} />
                  </button>

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

              {accessDenied ? (
                <div className="document-workspace__empty-state">
                  <div className="document-workspace__empty-icon">
                    <Lock size={34} strokeWidth={1.8} />
                  </div>

                  <h3 className="document-workspace__empty-title">
                    No tienes acceso a esta área
                  </h3>

                  <p className="document-workspace__empty-description">
                    Si crees que deberías tener acceso, solicítalo al
                    responsable del sitio o a TI.
                  </p>
                </div>
              ) : isLoadingPickers ? (
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
                <div className="document-workspace__path-row">
                  <button
                    type="button"
                    onClick={handleGoBackInItems}
                    disabled={!canGoBackInItems}
                    className="document-workspace__back-btn"
                    title="Atrás"
                    aria-label="Atrás"
                  >
                    <ArrowLeft size={15} strokeWidth={2.2} />
                  </button>

                  <div className="document-workspace__breadcrumbs">
                    {fullPathSegments.map((segment, index) => (
                      <span
                        key={segment.id}
                        className="document-workspace__path-segment"
                      >
                        {index > 0 && (
                          <ChevronRight
                            size={12}
                            className="document-workspace__path-separator"
                          />
                        )}
                        <button
                          type="button"
                          onClick={segment.onClick}
                          className="document-workspace__breadcrumb"
                        >
                          {segment.name}
                        </button>
                      </span>
                    ))}
                  </div>
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

                            const isHighlighted =
                              item.id === highlightedItemId;

                            return (
                              <tr
                                key={item.id}
                                id={`doc-row-${item.id}`}
                                onClick={() =>
                                  item.isFolder && openFolder(item)
                                }
                                className={[
                                  "document-workspace__table-row",
                                  item.isFolder
                                    ? "document-workspace__table-row--clickable"
                                    : "",
                                  isHighlighted
                                    ? "document-workspace__table-row--highlighted"
                                    : "",
                                ]
                                  .filter(Boolean)
                                  .join(" ")}
                              >
                                <td>
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
                                      <ChevronRight
                                        size={16}
                                        className="document-workspace__row-folder-arrow"
                                      />
                                    ) : (
                                      <>
                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            void handleOpenPreview(item);
                                          }}
                                          title="Vista previa"
                                          className="document-workspace__icon-btn"
                                        >
                                          <Eye size={14} strokeWidth={2} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleOpenExternal(item);
                                          }}
                                          disabled={!item.webUrl}
                                          title="Abrir en SharePoint"
                                          className="document-workspace__icon-btn"
                                        >
                                          <ChevronRight size={14} strokeWidth={2} />
                                        </button>

                                        <button
                                          type="button"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            handleDownload(item);
                                          }}
                                          disabled={!item.downloadUrl}
                                          title="Descargar"
                                          className="document-workspace__icon-btn"
                                        >
                                          <Download size={14} strokeWidth={2} />
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