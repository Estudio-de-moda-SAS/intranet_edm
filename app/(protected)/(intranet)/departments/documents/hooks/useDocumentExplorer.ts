"use client";

/**
 * @module useDocumentExplorer
 *
 * Hook principal del explorador documental.
 *
 * @remarks
 * Administra la fuente documental activa (`my-drive`, `shared`,
 * `corporate-sites`, `teams`), la navegación (breadcrumbs, carpetas),
 * caché en memoria y estados de carga/error. Delega toda la obtención de
 * datos en {@link documentSource.service}, por lo que no conoce detalles
 * de Graph.
 */

import { useCallback, useMemo, useRef, useState } from "react";

import {
  loadFolderChildren,
  loadSourceRoot,
} from "../services/documentSource.service";
import {
  getSharePointSiteDrives,
  type SharePointDriveDiscoveryResult,
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

export interface UseDocumentExplorerResult {
  activeSource: DocumentSourceType;
  selectedDepartment: DocumentDepartment | null;
  selectedLibrary: SharePointDriveDiscoveryResult | null;
  selectedDepartmentLibraries: readonly SharePointDriveDiscoveryResult[];
  teamDrives: readonly TeamDriveDiscoveryResult[];
  selectedTeamDrive: TeamDriveDiscoveryResult | null;
  currentItems: readonly DocumentItem[];
  breadcrumbs: readonly DocumentBreadcrumbItem[];
  loading: DocumentExplorerLoadingState;
  error: string | null;

  switchSource: (source: DocumentSourceType) => Promise<void>;
  selectDepartment: (department: DocumentDepartment) => Promise<void>;
  selectLibrary: (library: SharePointDriveDiscoveryResult) => Promise<void>;
  selectTeamDrive: (drive: TeamDriveDiscoveryResult) => Promise<void>;
  openFolder: (item: DocumentItem) => Promise<void>;
  goToRoot: () => Promise<void>;
  goToBreadcrumb: (breadcrumbId: string) => Promise<void>;
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

  const librariesCacheRef = useRef(
    new Map<string, readonly SharePointDriveDiscoveryResult[]>()
  );

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

        const cached = librariesCacheRef.current.get(department.siteId);

        if (cached) {
          setSelectedDepartmentLibraries(cached);
          return;
        }

        const libraries = await getSharePointSiteDrives(department.siteId);
        librariesCacheRef.current.set(department.siteId, libraries);
        setSelectedDepartmentLibraries(libraries);
      } catch (departmentError) {
        console.error(
          "[Document Explorer] selectDepartment",
          departmentError
        );
        setSelectedDepartmentLibraries([]);
        setError(
          "No fue posible cargar las bibliotecas del área seleccionada."
        );
      } finally {
        setLoading("idle");
      }
    },
    []
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
        console.error(
          "[Document Explorer] goToBreadcrumb",
          breadcrumbError
        );
        setError("No fue posible navegar a la carpeta seleccionada.");
      } finally {
        setLoading("idle");
      }
    },
    [activeSource, breadcrumbs, goToRoot]
  );

  return useMemo(
    () => ({
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
      goToRoot,
      goToBreadcrumb,
      clearError,
    }),
    [
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
      goToRoot,
      goToBreadcrumb,
      clearError,
    ]
  );
}