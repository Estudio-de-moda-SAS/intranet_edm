"use client";

/**
 * @module useDocumentDepartments
 *
 * Hook del catálogo documental.
 *
 * @remarks
 * Centraliza la carga y administración del catálogo de áreas documentales
 * utilizado por el módulo de Gestión Documental.
 *
 * Este hook abstrae completamente el origen de datos, permitiendo que los
 * componentes consumidores permanezcan desacoplados del servicio y de la
 * infraestructura de SharePoint.
 *
 * Actualmente consume un catálogo estático, pero está preparado para migrar
 * posteriormente a una fuente remota sin modificar la interfaz.
 */

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getDocumentDepartments,
  invalidateDocumentDepartmentsCache,
  searchDocumentDepartments,
} from "../services/documentCatalog.service";

import type { DocumentDepartment } from "../types/documentDepartment.types";

/**
 * Resultado del hook {@link useDocumentDepartments}.
 */
export interface UseDocumentDepartmentsResult {
  /**
   * Departamentos disponibles.
   */
  departments: readonly DocumentDepartment[];

  /**
   * Indica si el catálogo se encuentra cargando.
   */
  loading: boolean;

  /**
   * Error producido durante la carga.
   */
  error: string | null;

  /**
   * Recarga completamente el catálogo.
   */
  reload: () => Promise<void>;

  /**
   * Ejecuta una búsqueda local.
   */
  search: (searchTerm: string) => Promise<void>;
}

/**
 * Hook principal del catálogo documental.
 *
 * @returns Estado completo del catálogo documental.
 */
export function useDocumentDepartments(): UseDocumentDepartmentsResult {
  const [departments, setDepartments] = useState<
    readonly DocumentDepartment[]
  >([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  /**
   * Carga inicial del catálogo.
   */
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getDocumentDepartments();

      setDepartments(result);
    } catch {
      setError("No fue posible cargar las áreas documentales.");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Recarga el catálogo forzando un refetch contra Graph, para reflejar
   * subsitios agregados/renombrados desde la última carga.
   */
  const reloadDepartments = useCallback(async () => {
    invalidateDocumentDepartmentsCache();
    await loadDepartments();
  }, [loadDepartments]);

  /**
   * Ejecuta una búsqueda dentro del catálogo.
   */
  const search = useCallback(async (searchTerm: string) => {
    try {
      const result = await searchDocumentDepartments(searchTerm);

      setDepartments(result);
    } catch {
      setError("No fue posible realizar la búsqueda.");
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  return useMemo(
    () => ({
      departments,
      loading,
      error,
      reload: reloadDepartments,
      search,
    }),
    [departments, loading, error, reloadDepartments, search]
  );
}