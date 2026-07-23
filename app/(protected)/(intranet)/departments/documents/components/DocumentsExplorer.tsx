"use client";

import { useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  FileText,
  Folder,
  Globe2,
  Library,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  discoverSharePointSites,
  getSharePointDriveRootChildren,
  getSharePointFolderChildren,
  getSharePointSiteDrives,
  resolveSharePointSiteByUrl,
  searchSharePointSites,
  type SharePointDriveDiscoveryResult,
  type SharePointSiteDiscoveryResult,
} from "../services/sharepointDiscovery.service";
import type { DocumentItem } from "../types/document.types";
import "./DocumentsExplorer.css";
import { uploadSharePointFile } from "../services/sharepointDiscovery.service";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function buildCatalogItem(site: SharePointSiteDiscoveryResult, index: number) {
  const name = site.displayName ?? site.name ?? "Sitio sin nombre";

  return `  {
    id: "${toSlug(name)}",
    name: "${name}",
    siteId: "${site.id}",
    siteUrl: "${site.webUrl ?? "#"}",
    description: "Repositorio documental de ${name}.",
    icon: "Folder",
    accentColor: "indigo",
    order: ${index + 1},
    enabled: true,
  },`;
}

export function DocumentsExplorer() {
  const [query, setQuery] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [sites, setSites] = useState<SharePointSiteDiscoveryResult[]>([]);
  const [drives, setDrives] = useState<SharePointDriveDiscoveryResult[]>([]);
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [selectedSite, setSelectedSite] =
    useState<SharePointSiteDiscoveryResult | null>(null);
  const [selectedDrive, setSelectedDrive] =
    useState<SharePointDriveDiscoveryResult | null>(null);
  const [folderStack, setFolderStack] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  const catalogPreview = useMemo(() => {
    return `export const DOCUMENT_SITES: readonly DocumentDepartment[] = [
${sites.map(buildCatalogItem).join("\n")}
];`;
  }, [sites]);

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(label);

    window.setTimeout(() => {
      setCopied("");
    }, 1800);
  };

  const resetSelection = () => {
    setSelectedSite(null);
    setSelectedDrive(null);
    setDrives([]);
    setItems([]);
    setFolderStack([]);
  };

  const handleSearchSites = async () => {
    if (!query.trim()) return;

    try {
      setLoading("Buscando sitios...");
      setError("");
      resetSelection();

      const results = await searchSharePointSites(query);
      setSites(results);
    } catch (searchError) {
      console.error("[Documents Explorer]", searchError);
      setError("No se pudieron buscar sitios de SharePoint.");
    } finally {
      setLoading("");
    }
  };

  const handleDiscoverSites = async () => {
    try {
      setLoading("Descubriendo sitios...");
      setError("");
      resetSelection();

      const results = await discoverSharePointSites();
      setSites(results);
    } catch (discoverError) {
      console.error("[Documents Explorer]", discoverError);
      setError("No se pudieron descubrir sitios de SharePoint.");
    } finally {
      setLoading("");
    }
  };

  const handleResolveByUrl = async () => {
    if (!siteUrl.trim()) return;

    try {
      setLoading("Resolviendo sitio por URL...");
      setError("");
      resetSelection();

      const site = await resolveSharePointSiteByUrl(siteUrl);
      setSites([site]);
    } catch (resolveError) {
      console.error("[Documents Explorer]", resolveError);
      setError(
        "No se pudo resolver el sitio a partir de esa URL. Verifica que sea correcta."
      );
    } finally {
      setLoading("");
    }
  };

  const handleSelectSite = async (site: SharePointSiteDiscoveryResult) => {
    try {
      setLoading("Consultando bibliotecas...");
      setError("");
      setSelectedSite(site);
      setSelectedDrive(null);
      setItems([]);
      setFolderStack([]);

      const results = await getSharePointSiteDrives(site.id);
      setDrives(results);
    } catch (siteError) {
      console.error("[Documents Explorer]", siteError);
      setError("No se pudieron consultar las bibliotecas del sitio.");
    } finally {
      setLoading("");
    }
  };

  const handleSelectDrive = async (drive: SharePointDriveDiscoveryResult) => {
    try {
      setLoading("Consultando documentos...");
      setError("");
      setSelectedDrive(drive);
      setFolderStack([]);

      const results = await getSharePointDriveRootChildren(drive.id);
      setItems(results);
    } catch (driveError) {
      console.error("[Documents Explorer]", driveError);
      setError("No se pudo consultar el contenido de la biblioteca.");
    } finally {
      setLoading("");
    }
  };

  const handleOpenFolder = async (folder: DocumentItem) => {
    if (!selectedDrive) return;

    try {
      setLoading("Consultando carpeta...");
      setError("");

      const results = await getSharePointFolderChildren(
        selectedDrive.id,
        folder.id
      );

      setFolderStack((current) => [...current, folder]);
      setItems(results);
    } catch (folderError) {
      console.error("[Documents Explorer]", folderError);
      setError("No se pudo consultar el contenido de la carpeta.");
    } finally {
      setLoading("");
    }
  };

  const handleGoToRoot = async () => {
    if (!selectedDrive) return;

    try {
      setLoading("Volviendo a la raíz...");
      setError("");
      setFolderStack([]);

      const results = await getSharePointDriveRootChildren(selectedDrive.id);
      setItems(results);
    } catch (rootError) {
      console.error("[Documents Explorer]", rootError);
      setError("No se pudo volver a la raíz de la biblioteca.");
    } finally {
      setLoading("");
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleTestUpload = async (file: File | undefined) => {
  if (!file || !selectedDrive) return;

  const currentFolderId = folderStack.at(-1)?.id ?? null;

  try {
    setUploading(true);
    setError("");

    await uploadSharePointFile(selectedDrive.id, currentFolderId, file);

    // Refresca el listado actual para ver el archivo recién subido
    const results = currentFolderId
      ? await getSharePointFolderChildren(selectedDrive.id, currentFolderId)
      : await getSharePointDriveRootChildren(selectedDrive.id);

    setItems(results);
  } catch (uploadError) {
    console.error("[Documents Explorer] upload", uploadError);
    setError("No se pudo subir el archivo. Verifica que el permiso Files.ReadWrite.All esté aprobado.");
  } finally {
    setUploading(false);
  }
};
  return (
    <section className="documents-explorer">
      <div className="documents-explorer__toolbar">
        <div className="documents-explorer__search">
          <Search size={17} strokeWidth={2} />

          <input
            type="search"
            placeholder="Buscar sitios de SharePoint..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleSearchSites();
            }}
          />
        </div>

        <div className="documents-explorer__search">
          <Search size={17} strokeWidth={2} />

          <input
            type="text"
            placeholder="Pegar URL completa del sitio..."
            value={siteUrl}
            onChange={(event) => setSiteUrl(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleResolveByUrl();
            }}
          />
        </div>

        <div className="documents-explorer__actions">
          <button
            type="button"
            onClick={handleSearchSites}
            disabled={!query.trim()}
          >
            Buscar
          </button>

          <button
            type="button"
            onClick={handleResolveByUrl}
            disabled={!siteUrl.trim()}
          >
            Resolver por URL
          </button>

          <button type="button" onClick={handleDiscoverSites}>
            <RefreshCw size={16} strokeWidth={2} />
            Descubrir sitios
          </button>

          {sites.length > 0 && (
            <button
              type="button"
              onClick={() => copyToClipboard(catalogPreview, "catalogo")}
            >
              <Copy size={16} strokeWidth={2} />
              {copied === "catalogo" ? "Catálogo copiado" : "Copiar catálogo"}
            </button>
          )}
        </div>
      </div>

      {loading && <div className="documents-explorer__state">{loading}</div>}

      {error && (
        <div className="documents-explorer__state documents-explorer__state--error">
          {error}
        </div>
      )}

      <div className="documents-explorer__layout">
        <aside className="documents-explorer__sidebar">
          <div className="documents-explorer__column-header">
            <Globe2 size={17} strokeWidth={2} />
            <span>Sitios</span>
          </div>

          <div className="documents-explorer__list">
            {sites.length === 0 ? (
              <div className="documents-explorer__empty">
                Descubre o busca sitios para comenzar.
              </div>
            ) : (
              sites.map((site) => (
                <button
                  key={site.id}
                  type="button"
                  className={[
                    "documents-explorer__list-item",
                    selectedSite?.id === site.id
                      ? "documents-explorer__list-item--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelectSite(site)}
                >
                  <strong>{site.displayName ?? site.name ?? "Sin nombre"}</strong>

                  <span>{site.webUrl ?? "URL no disponible"}</span>

                  <small
                    style={{
                      display: "block",
                      marginTop: "0.35rem",
                      wordBreak: "break-all",
                      opacity: 0.72,
                    }}
                  >
                    siteId: {site.id}
                  </small>

                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      copyToClipboard(site.id, site.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.stopPropagation();
                        copyToClipboard(site.id, site.id);
                      }
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      marginTop: "0.45rem",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    <Copy size={13} />
                    {copied === site.id ? "Copiado" : "Copiar siteId"}
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        <aside className="documents-explorer__sidebar documents-explorer__sidebar--libraries">
          <div className="documents-explorer__column-header">
            <Library size={17} strokeWidth={2} />
            <span>Bibliotecas</span>
          </div>

          <div className="documents-explorer__list">
            {!selectedSite ? (
              <div className="documents-explorer__empty">
                Selecciona un sitio para ver sus bibliotecas.
              </div>
            ) : drives.length === 0 ? (
              <div className="documents-explorer__empty">
                No se encontraron bibliotecas para este sitio.
              </div>
            ) : (
              drives.map((drive) => (
                <button
                  key={drive.id}
                  type="button"
                  className={[
                    "documents-explorer__list-item",
                    selectedDrive?.id === drive.id
                      ? "documents-explorer__list-item--active"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => handleSelectDrive(drive)}
                >
                  <strong>{drive.name ?? "Biblioteca sin nombre"}</strong>
                  <span>{drive.webUrl ?? drive.id}</span>
                </button>
              ))
            )}
          </div>
        </aside>

        <main className="documents-explorer__content">
          <div className="documents-explorer__content-header">
            <div>
              <span>Contenido</span>
              <h3>{selectedDrive?.name ?? "Selecciona una biblioteca"}</h3>
            </div>

            {selectedDrive?.webUrl && (
              <a href={selectedDrive.webUrl} target="_blank" rel="noreferrer">
                Abrir biblioteca
                <ExternalLink size={15} strokeWidth={2} />
              </a>
            )}
            {selectedDrive && (
  <label style={{ cursor: uploading ? "wait" : "pointer" }}>
    <input
      type="file"
      style={{ display: "none" }}
      disabled={uploading}
      onChange={(event) => {
        void handleTestUpload(event.target.files?.[0]);
        event.target.value = "";
      }}
    />
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.5rem 0.9rem",
        borderRadius: "10px",
        background: uploading ? "#94a3b8" : "#4f7cff",
        color: "white",
        fontSize: "0.78rem",
        fontWeight: 700,
      }}
    >
      {uploading ? "Subiendo..." : "Subir archivo (prueba)"}
    </span>
  </label>
)}
          </div>

          {selectedDrive && (
            <div className="documents-explorer__breadcrumb">
              <button type="button" onClick={handleGoToRoot}>
                {selectedDrive.name ?? "Raíz"}
              </button>

              {folderStack.map((folder) => (
                <span key={folder.id}>/ {folder.name}</span>
              ))}
            </div>
          )}

          <div className="documents-explorer__items">
            {!selectedDrive ? (
              <div className="documents-explorer__empty documents-explorer__empty--large">
                Selecciona una biblioteca para explorar carpetas y documentos.
              </div>
            ) : items.length === 0 ? (
              <div className="documents-explorer__empty documents-explorer__empty--large">
                No hay elementos disponibles en esta ubicación.
              </div>
            ) : (
              items.map((item) => (
                <article key={item.id} className="documents-explorer__item">
                  <div className="documents-explorer__item-icon">
                    {item.isFolder ? (
                      <Folder size={20} strokeWidth={2} />
                    ) : (
                      <FileText size={20} strokeWidth={2} />
                    )}
                  </div>

                  <div className="documents-explorer__item-main">
                    <strong>{item.name}</strong>
                    <span>
                      {item.isFolder
                        ? `${item.childCount ?? 0} elementos`
                        : item.mimeType ?? "Archivo"}
                    </span>
                  </div>

                  <div className="documents-explorer__item-actions">
                    {item.isFolder && (
                      <button
                        type="button"
                        onClick={() => handleOpenFolder(item)}
                      >
                        Abrir
                      </button>
                    )}

                    {item.webUrl && (
                      <a href={item.webUrl} target="_blank" rel="noreferrer">
                        SharePoint
                      </a>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </main>
      </div>
    </section>
  );
}