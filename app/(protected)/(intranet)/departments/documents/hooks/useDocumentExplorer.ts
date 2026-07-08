"use client";

/**
 * @module useDocumentExplorer
 *
 * Hook principal del explorador documental.
 *
 * @remarks
 * Centraliza la navegación real del módulo documental usando Microsoft Graph
 * como fuente de información.
 *
 * Administra:
 * - departamento seleccionado,
 * - bibliotecas del sitio,
 * - biblioteca seleccionada,
 * - contenido actual,
 * - navegación por carpetas,
 * - breadcrumb,
 * - estados de carga,
 * - errores,
 * - y caché en memoria para evitar llamadas repetidas a Graph.
 */

import { useCallback, useMemo, useRef, useState } from "react";

import {
  getSharePointDriveRootChildren,
  getSharePointFolderChildren,
  getSharePointSiteDrives,
  type SharePointDriveDiscoveryResult,
  type SharePointDriveItemDiscoveryResult,
} from "../services/sharepointDiscovery.service";

import type { DocumentDepartment } from "../types/documentDepartment.types";

export type DocumentExplorerLoadingState =
  | "idle"
  | "libraries"
  | "items"
  | "folder";

export interface DocumentExplorerBreadcrumbItem {
  id: string;
  name: string;
  type: "library" | "folder";
}

export interface UseDocumentExplorerResult {
  selectedDepartment: DocumentDepartment | null;
  selectedLibrary: SharePointDriveDiscoveryResult | null;
  selectedDepartmentLibraries: readonly SharePointDriveDiscoveryResult[];
  currentItems: readonly SharePointDriveItemDiscoveryResult[];
  breadcrumbs: readonly DocumentExplorerBreadcrumbItem[];
  loading: DocumentExplorerLoadingState;
  error: string | null;

  selectDepartment: (department: DocumentDepartment) => Promise<void>;
  selectLibrary: (library: SharePointDriveDiscoveryResult) => Promise<void>;
  openFolder: (folder: SharePointDriveItemDiscoveryResult) => Promise<void>;
  goToLibraryRoot: () => Promise<void>;
  goToBreadcrumb: (breadcrumbId: string) => Promise<void>;
  clearError: () => void;
}

function buildFolderCacheKey(driveId: string, itemId: string) {
  return `${driveId}:${itemId}`;
}

export function useDocumentExplorer(): UseDocumentExplorerResult {
  const [selectedDepartment, setSelectedDepartment] =
    useState<DocumentDepartment | null>(null);

  const [selectedLibrary, setSelectedLibrary] =
    useState<SharePointDriveDiscoveryResult | null>(null);

  const [selectedDepartmentLibraries, setSelectedDepartmentLibraries] =
    useState<readonly SharePointDriveDiscoveryResult[]>([]);

  const [currentItems, setCurrentItems] = useState<
    readonly SharePointDriveItemDiscoveryResult[]
  >([]);

  const [breadcrumbs, setBreadcrumbs] = useState<
    readonly DocumentExplorerBreadcrumbItem[]
  >([]);

  const [loading, setLoading] =
    useState<DocumentExplorerLoadingState>("idle");

  const [error, setError] = useState<string | null>(null);

  const librariesCacheRef = useRef(
    new Map<string, readonly SharePointDriveDiscoveryResult[]>()
  );

  const rootItemsCacheRef = useRef(
    new Map<string, readonly SharePointDriveItemDiscoveryResult[]>()
  );

  const folderItemsCacheRef = useRef(
    new Map<string, readonly SharePointDriveItemDiscoveryResult[]>()
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const selectDepartment = useCallback(
    async (department: DocumentDepartment) => {
      try {
        setLoading("libraries");
        setError(null);

        setSelectedDepartment(department);
        setSelectedLibrary(null);
        setSelectedDepartmentLibraries([]);
        setCurrentItems([]);
        setBreadcrumbs([]);

        const cachedLibraries = librariesCacheRef.current.get(
          department.siteId
        );

        if (cachedLibraries) {
          setSelectedDepartmentLibraries(cachedLibraries);
          return;
        }

        const libraries = await getSharePointSiteDrives(department.siteId);

        librariesCacheRef.current.set(department.siteId, libraries);
        setSelectedDepartmentLibraries(libraries);
      } catch (departmentError) {
        console.error("[Document Explorer] selectDepartment", departmentError);
        setSelectedDepartmentLibraries([]);
        setError("No fue posible cargar las bibliotecas del área seleccionada.");
      } finally {
        setLoading("idle");
      }
    },
    []
  );

  const selectLibrary = useCallback(
    async (library: SharePointDriveDiscoveryResult) => {
      try {
        setLoading("items");
        setError(null);

        setSelectedLibrary(library);
        setCurrentItems([]);

        setBreadcrumbs([
          {
            id: library.id,
            name: library.name ?? "Biblioteca",
            type: "library",
          },
        ]);

        const cachedItems = rootItemsCacheRef.current.get(library.id);

        if (cachedItems) {
          setCurrentItems(cachedItems);
          return;
        }

        const items = await getSharePointDriveRootChildren(library.id);

        rootItemsCacheRef.current.set(library.id, items);
        setCurrentItems(items);
      } catch (libraryError) {
        console.error("[Document Explorer] selectLibrary", libraryError);
        setError("No fue posible cargar el contenido de la biblioteca.");
      } finally {
        setLoading("idle");
      }
    },
    []
  );

  const openFolder = useCallback(
    async (folder: SharePointDriveItemDiscoveryResult) => {
      if (!selectedLibrary) return;

      try {
        setLoading("folder");
        setError(null);

        const cacheKey = buildFolderCacheKey(selectedLibrary.id, folder.id);

        setBreadcrumbs((current) => [
          ...current,
          {
            id: folder.id,
            name: folder.name ?? "Carpeta",
            type: "folder",
          },
        ]);

        const cachedItems = folderItemsCacheRef.current.get(cacheKey);

        if (cachedItems) {
          setCurrentItems(cachedItems);
          return;
        }

        const items = await getSharePointFolderChildren(
          selectedLibrary.id,
          folder.id
        );

        folderItemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (folderError) {
        console.error("[Document Explorer] openFolder", folderError);
        setError("No fue posible cargar el contenido de la carpeta.");
      } finally {
        setLoading("idle");
      }
    },
    [selectedLibrary]
  );

  const goToLibraryRoot = useCallback(async () => {
    if (!selectedLibrary) return;

    try {
      setLoading("items");
      setError(null);

      setBreadcrumbs([
        {
          id: selectedLibrary.id,
          name: selectedLibrary.name ?? "Biblioteca",
          type: "library",
        },
      ]);

      const cachedItems = rootItemsCacheRef.current.get(selectedLibrary.id);

      if (cachedItems) {
        setCurrentItems(cachedItems);
        return;
      }

      const items = await getSharePointDriveRootChildren(selectedLibrary.id);

      rootItemsCacheRef.current.set(selectedLibrary.id, items);
      setCurrentItems(items);
    } catch (rootError) {
      console.error("[Document Explorer] goToLibraryRoot", rootError);
      setError("No fue posible volver a la raíz de la biblioteca.");
    } finally {
      setLoading("idle");
    }
  }, [selectedLibrary]);

  const goToBreadcrumb = useCallback(
    async (breadcrumbId: string) => {
      if (!selectedLibrary) return;

      const breadcrumbIndex = breadcrumbs.findIndex(
        (item) => item.id === breadcrumbId
      );

      if (breadcrumbIndex === -1) return;

      const breadcrumb = breadcrumbs.at(breadcrumbIndex);

if (!breadcrumb) {
  return;
}

      if (breadcrumb.type === "library") {
        await goToLibraryRoot();
        return;
      }

      try {
        setLoading("folder");
        setError(null);

        const nextBreadcrumbs = breadcrumbs.slice(0, breadcrumbIndex + 1);
        setBreadcrumbs(nextBreadcrumbs);

        const cacheKey = buildFolderCacheKey(selectedLibrary.id, breadcrumb.id);

        const cachedItems = folderItemsCacheRef.current.get(cacheKey);

        if (cachedItems) {
          setCurrentItems(cachedItems);
          return;
        }

        const items = await getSharePointFolderChildren(
          selectedLibrary.id,
          breadcrumb.id
        );

        folderItemsCacheRef.current.set(cacheKey, items);
        setCurrentItems(items);
      } catch (breadcrumbError) {
        console.error("[Document Explorer] goToBreadcrumb", breadcrumbError);
        setError("No fue posible navegar a la carpeta seleccionada.");
      } finally {
        setLoading("idle");
      }
    },
    [breadcrumbs, goToLibraryRoot, selectedLibrary]
  );

  return useMemo(
    () => ({
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
      goToLibraryRoot,
      goToBreadcrumb,
      clearError,
    }),
    [
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
      goToLibraryRoot,
      goToBreadcrumb,
      clearError,
    ]
  );
}