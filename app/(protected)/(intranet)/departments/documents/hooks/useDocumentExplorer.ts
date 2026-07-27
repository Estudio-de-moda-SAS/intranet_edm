"use client";

/**
 * @module useDocumentExplorer
 *
 * Hook principal del explorador documental.
 *
 * @remarks
 * Administra la fuente documental activa (`my-drive`, `shared`,
 * `corporate-sites`, `teams`), la navegación (breadcrumbs, carpetas,
 * subsitios), la subida de archivos, caché en memoria y estados de
 * carga/error. Delega toda la obtención de datos en
 * {@link documentSource.service} y {@link sharepointDiscovery.service},
 * por lo que no conoce detalles de Graph directamente.
 */

import { useCallback, useMemo, useRef, useState } from "react";

import {
  loadFolderChildren,
  loadSourceRoot,
  uploadDocument,
} from "../services/documentSource.service";
import {
  getSharePointSiteDrives,
  getSharePointSubsites,
  type SharePointDriveDiscoveryResult,
  type SharePointSiteDiscoveryResult,
} from "../services/sharepointDiscovery.service";
import {
  getMyTeamDrives,
  type TeamDriveDiscoveryResult,
} from "../services/teamsDriveDiscovery.service";
import type {
  DocumentBreadcrumbItem,
  DocumentItem,
  DocumentLocation,
  DocumentSourceType,
} from "../types/document.types";
import type { DocumentDepartment } from "../types/documentDepartment.types";

export type DocumentExplorerLoadingState =
  | "idle"
  | "root"
  | "libraries"
  | "folder";

/**
 * Referencia mínima a una biblioteca/drive seleccionable (biblioteca de
 * SharePoint o drive de un equipo), usada internamente para unificar la
 * navegación raíz entre `corporate-sites` y `teams`.
 */
interface SelectableLibrary {
  id: string;
  name?: string;
}

/** Detalle cacheado de un sitio/subsitio: sus bibliotecas y subsitios. */
interface SiteDetails {
  drives: readonly SharePointDriveDiscoveryResult[];
  subsites: readonly SharePointSiteDiscoveryResult[];
}

export interface UseDocumentExplorerResult {
  activeSource: DocumentSourceType;
  selectedDepartment: DocumentDepartment | null;
  selectedLibrary: SharePointDriveDiscoveryResult | null;
  selectedDepartmentLibraries: readonly SharePointDriveDiscoveryResult[];
  selectedDepartmentSubsites: readonly SharePointSiteDiscoveryResult[];
  siteTrail: readonly SharePointSiteDiscoveryResult[];
  teamDrives: readonly TeamDriveDiscoveryResult[];
  selectedTeamDrive: TeamDriveDiscoveryResult | null;
  currentItems: readonly DocumentItem[];
  breadcrumbs: readonly DocumentBreadcrumbItem[];
  loading: DocumentExplorerLoadingState;
  error: string | null;
  canUploadHere: boolean;
  uploadingFile: boolean;

  switchSource: (source: DocumentSourceType) => Promise<void>;
  selectDepartment: (department: DocumentDepartment) => Promise<void>;
  selectLibrary: (library: SharePointDriveDiscoveryResult) => Promise<void>;
  drillIntoSubsite: (subsite: SharePointSiteDiscoveryResult) => Promise<void>;
  goToSiteTrail: (index: number) => Promise<void>;
  selectTeamDrive: (drive: TeamDriveDiscoveryResult) => Promise<void>;
  openFolder: (item: DocumentItem) => Promise<void>;
  goToRoot: () => Promise<void>;
  goToBreadcrumb: (breadcrumbId: string) => Promise<void>;
  uploadFile: (file: File) => Promise<void>;
  clearError: () => void;
}

function buildFolderCacheKey(
  source: DocumentSourceType,
  location: DocumentLocation
) {
  return `${source}:${location.driveId}:${location.itemId ?? "root"}`;
}

function buildRootCacheKey(source: DocumentSourceType, libraryId?: string) {
  return libraryId ? `${source}:root:${libraryId}` : `${source}:root`;
}

export function useDocumentExplorer(): UseDocumentExplorerResult {
  const [activeSource, setActiveSource] =
    useState<DocumentSourceType>("my-drive");

  const [selectedDepartment, setSelectedDepartment] =
    useState<DocumentDepartment | null>(null);

  const [selectedLibrary, setSelectedLibrary] =
    useState<SharePointDriveDiscoveryResult | null>(null);

  const [selectedDepartmentLibraries, setSelectedDepartmentLibraries] =
    useState<readonly SharePointDriveDiscoveryResult[]>([]);

  const [selectedDepartmentSubsites, setSelectedDepartmentSubsites] =
    useState<readonly SharePointSiteDiscoveryResult[]>([]);

  const [siteTrail, setSiteTrail] =
    useState<readonly SharePointSiteDiscoveryResult[]>([]);

  const [teamDrives, setTeamDrives] =
    useState<readonly TeamDriveDiscoveryResult[]>([]);

  const [selectedTeamDrive, setSelectedTeamDrive] =
    useState<TeamDriveDiscoveryResult | null>(null);

  const [currentItems, setCurrentItems] =
    useState<readonly DocumentItem[]>([]);

  const [breadcrumbs, setBreadcrumbs] =
    useState<readonly DocumentBreadcrumbItem[]>([]);

  const [loading, setLoading] =
    useState<DocumentExplorerLoadingState>("idle");

  const [error, setError] = useState<string | null>(null);

  const [uploadingFile, setUploadingFile] = useState(false);

  const siteDetailsCacheRef = useRef(new Map<string, SiteDetails>());

  const teamDrivesCacheRef = useRef<readonly TeamDriveDiscoveryResult[] | null>(null);

  const itemsCacheRef = useRef(new Map<string, readonly DocumentItem[]>());

  const clearError = useCallback(() => setError(null), []);

  const rootBreadcrumbLabel = useCallback(
    (source: DocumentSourceType, library: SelectableLibrary | null) => {
      if (source === "my-drive") return "Mi unidad";
      if (source === "shared") return "Compartidos conmigo";
      if (source === "teams") return library?.name ?? "Equipo";
      return library?.name ?? "Biblioteca";
    },
    []
  );

  const loadRootFor = useCallback(
    async (source: DocumentSourceType, library: SelectableLibrary | null) => {
      try {
        setLoading("root");
        setError(null);
        setCurrentItems([]);

        if (
          (source === "corporate-sites" || source === "teams") &&
          !library
        ) {
          setBreadcrumbs([]);
          return;
        }

        setBreadcrumbs([
          {
            id: library?.id ?? source,
            name: rootBreadcrumbLabel(source, library),
            location: { driveId: library?.id ?? source, itemId: null },
          },
        ]);

        const cacheKey = buildRootCacheKey(source, library?.id);
        const cached = itemsCacheRef.current.get(cacheKey);

        if (cached) {
          setCurrentItems(cached);
          return;
        }

        const items = await loadSourceRoot(source, library?.id);
        itemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (rootError) {
        console.error("[Document Explorer] loadRootFor", rootError);
        setError("No fue posible cargar los documentos.");
      } finally {
        setLoading("idle");
      }
    },
    [rootBreadcrumbLabel]
  );

  const loadSiteDetails = useCallback(async (siteId: string) => {
    const cached = siteDetailsCacheRef.current.get(siteId);

    if (cached) {
      setSelectedDepartmentLibraries(cached.drives);
      setSelectedDepartmentSubsites(cached.subsites);
      return;
    }

    const [drivesResult, subsitesResult] = await Promise.allSettled([
      getSharePointSiteDrives(siteId),
      getSharePointSubsites(siteId),
    ]);

    const drives = drivesResult.status === "fulfilled" ? drivesResult.value : [];
    const subsites =
      subsitesResult.status === "fulfilled" ? subsitesResult.value : [];

    siteDetailsCacheRef.current.set(siteId, { drives, subsites });
    setSelectedDepartmentLibraries(drives);
    setSelectedDepartmentSubsites(subsites);
  }, []);

  const loadTeamDrives = useCallback(async () => {
    try {
      setLoading("libraries");
      setError(null);

      if (teamDrivesCacheRef.current) {
        setTeamDrives(teamDrivesCacheRef.current);
        return;
      }

      const drives = await getMyTeamDrives();
      teamDrivesCacheRef.current = drives;
      setTeamDrives(drives);
    } catch (teamsError) {
      console.error("[Document Explorer] loadTeamDrives", teamsError);
      setTeamDrives([]);
      setError("No fue posible cargar tus equipos.");
    } finally {
      setLoading("idle");
    }
  }, []);

  const switchSource = useCallback(
    async (source: DocumentSourceType) => {
      setActiveSource(source);
      setSelectedDepartment(null);
      setSelectedLibrary(null);
      setSelectedDepartmentLibraries([]);
      setSelectedDepartmentSubsites([]);
      setSiteTrail([]);
      setSelectedTeamDrive(null);
      setTeamDrives([]);
      setBreadcrumbs([]);
      setCurrentItems([]);

      if (source === "teams") {
        await loadTeamDrives();
        return;
      }

      await loadRootFor(source, null);
    },
    [loadRootFor, loadTeamDrives]
  );

  const selectDepartment = useCallback(
    async (department: DocumentDepartment) => {
      try {
        setLoading("libraries");
        setError(null);

        setSelectedDepartment(department);
        setSelectedLibrary(null);
        setCurrentItems([]);
        setBreadcrumbs([]);

        const rootTrailItem: SharePointSiteDiscoveryResult = {
          id: department.siteId,
          displayName: department.name,
        };
        setSiteTrail([rootTrailItem]);

        await loadSiteDetails(department.siteId);
      } catch (departmentError) {
        console.error("[Document Explorer] selectDepartment", departmentError);
        setSelectedDepartmentLibraries([]);
        setSelectedDepartmentSubsites([]);
        setError(
          "No fue posible cargar las bibliotecas del área seleccionada."
        );
      } finally {
        setLoading("idle");
      }
    },
    [loadSiteDetails]
  );

  const drillIntoSubsite = useCallback(
    async (subsite: SharePointSiteDiscoveryResult) => {
      try {
        setLoading("libraries");
        setError(null);
        setSelectedLibrary(null);
        setCurrentItems([]);
        setBreadcrumbs([]);

        setSiteTrail((current) => [...current, subsite]);
        await loadSiteDetails(subsite.id);
      } catch (subsiteError) {
        console.error("[Document Explorer] drillIntoSubsite", subsiteError);
        setError("No fue posible cargar el contenido de este subsitio.");
      } finally {
        setLoading("idle");
      }
    },
    [loadSiteDetails]
  );

  const goToSiteTrail = useCallback(
    async (index: number) => {
      const target = siteTrail.at(index);
      if (!target) return;

      try {
        setLoading("libraries");
        setError(null);
        setSelectedLibrary(null);
        setCurrentItems([]);
        setBreadcrumbs([]);

        setSiteTrail((current) => current.slice(0, index + 1));
        await loadSiteDetails(target.id);
      } catch (trailError) {
        console.error("[Document Explorer] goToSiteTrail", trailError);
        setError("No fue posible cargar el contenido de este sitio.");
      } finally {
        setLoading("idle");
      }
    },
    [loadSiteDetails, siteTrail]
  );

  const selectLibrary = useCallback(
    async (library: SharePointDriveDiscoveryResult) => {
      setSelectedLibrary(library);
      await loadRootFor("corporate-sites", library);
    },
    [loadRootFor]
  );

  const selectTeamDrive = useCallback(
    async (drive: TeamDriveDiscoveryResult) => {
      setSelectedTeamDrive(drive);
      await loadRootFor("teams", drive);
    },
    [loadRootFor]
  );

  const openFolder = useCallback(
    async (item: DocumentItem) => {
      if (!item.isFolder) return;

      const location: DocumentLocation = {
        driveId: item.driveId,
        itemId: item.id,
      };

      try {
        setLoading("folder");
        setError(null);

        setBreadcrumbs((current) => [
          ...current,
          { id: item.id, name: item.name, location },
        ]);

        const cacheKey = buildFolderCacheKey(activeSource, location);
        const cached = itemsCacheRef.current.get(cacheKey);

        if (cached) {
          setCurrentItems(cached);
          return;
        }

        const items = await loadFolderChildren(location, activeSource);
        itemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (folderError) {
        console.error("[Document Explorer] openFolder", folderError);
        setError("No fue posible cargar el contenido de la carpeta.");
      } finally {
        setLoading("idle");
      }
    },
    [activeSource]
  );

  const goToRoot = useCallback(async () => {
    const library =
      activeSource === "teams" ? selectedTeamDrive : selectedLibrary;
    await loadRootFor(activeSource, library);
  }, [activeSource, loadRootFor, selectedLibrary, selectedTeamDrive]);

  const goToBreadcrumb = useCallback(
    async (breadcrumbId: string) => {
      const index = breadcrumbs.findIndex((b) => b.id === breadcrumbId);
      if (index === -1) return;

      if (index === 0) {
        await goToRoot();
        return;
      }

      const breadcrumb = breadcrumbs.at(index);
      if (!breadcrumb) return;

      try {
        setLoading("folder");
        setError(null);

        setBreadcrumbs(breadcrumbs.slice(0, index + 1));

        const cacheKey = buildFolderCacheKey(
          activeSource,
          breadcrumb.location
        );
        const cached = itemsCacheRef.current.get(cacheKey);

        if (cached) {
          setCurrentItems(cached);
          return;
        }

        const items = await loadFolderChildren(
          breadcrumb.location,
          activeSource
        );
        itemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (breadcrumbError) {
        console.error("[Document Explorer] goToBreadcrumb", breadcrumbError);
        setError("No fue posible navegar a la carpeta seleccionada.");
      } finally {
        setLoading("idle");
      }
    },
    [activeSource, breadcrumbs, goToRoot]
  );

  const canUploadHere = activeSource === "corporate-sites" && breadcrumbs.length > 0;

  const uploadFile = useCallback(
    async (file: File) => {
      const currentLocation = breadcrumbs.at(-1)?.location ?? null;
      if (!currentLocation || !canUploadHere) return;

      try {
        setUploadingFile(true);
        setError(null);

        await uploadDocument(currentLocation, activeSource, file);

        const isRoot = currentLocation.itemId === null;

        const cacheKey = isRoot
          ? buildRootCacheKey(activeSource, currentLocation.driveId)
          : buildFolderCacheKey(activeSource, currentLocation);

        const items = isRoot
          ? await loadSourceRoot(activeSource, currentLocation.driveId)
          : await loadFolderChildren(currentLocation, activeSource);

        itemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (uploadError) {
        console.error("[Document Explorer] uploadFile", uploadError);
        setError(
          "No fue posible subir el archivo. Verifica tus permisos de escritura sobre esta carpeta."
        );
      } finally {
        setUploadingFile(false);
      }
    },
    [activeSource, breadcrumbs, canUploadHere]
  );

  return useMemo(
    () => ({
      activeSource,
      selectedDepartment,
      selectedLibrary,
      selectedDepartmentLibraries,
      selectedDepartmentSubsites,
      siteTrail,
      teamDrives,
      selectedTeamDrive,
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
      selectTeamDrive,
      openFolder,
      goToRoot,
      goToBreadcrumb,
      uploadFile,
      clearError,
    }),
    [
      activeSource,
      selectedDepartment,
      selectedLibrary,
      selectedDepartmentLibraries,
      selectedDepartmentSubsites,
      siteTrail,
      teamDrives,
      selectedTeamDrive,
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
      selectTeamDrive,
      openFolder,
      goToRoot,
      goToBreadcrumb,
      uploadFile,
      clearError,
    ]
  );
}