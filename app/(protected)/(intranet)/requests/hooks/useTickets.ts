/**
 * @module useTickets
 * Hook personalizado para obtener la lista de tickets del usuario.
 *
 * @remarks
 * Este hook actúa como la capa de acceso a datos para el listado de solicitudes,
 * encapsulando la lógica de consulta al backend y el manejo de estados asociados.
 *
 * Permite:
 *
 * - obtener tickets filtrados por usuario, estado o departamento
 * - manejar estados de carga y error
 * - refrescar manualmente los datos mediante `refetch`
 *
 * Es utilizado por componentes como:
 *
 * - `RequestsPanelWithModal`
 *
 * y desacopla completamente la UI de la fuente de datos (API).
 */

// app/solicitudes/hooks/useTickets.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  Request,
  RequestStatus,
} from "@/app/(protected)/(intranet)/requests/data/tickets";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Opciones de filtrado para la consulta de tickets.
 *
 * @property userId Identificador del usuario autenticado.
 * @property status Estado de los tickets a consultar.
 * @property departmentId Identificador del departamento.
 *
 * @remarks
 * Estos filtros se traducen en parámetros de query en la llamada al API.
 */
interface UseTicketsOptions {
  userId?: string;
  status?: RequestStatus;
  departmentId?: string;
}

/**
 * Estructura de retorno del hook {@link useTickets}.
 *
 * @property tickets Lista de tickets obtenidos.
 * @property loading Indica si la consulta está en curso.
 * @property error Mensaje de error si la consulta falla.
 * @property refetch Función para volver a ejecutar la consulta manualmente.
 */
interface UseTicketsReturn {
  tickets: Request[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hook para obtener la lista de tickets desde el backend.
 *
 * @param options Opciones de filtrado para la consulta.
 * @returns Estado de la consulta y datos obtenidos.
 *
 * @remarks
 * Este hook:
 *
 * - construye dinámicamente los parámetros de consulta
 * - realiza una petición HTTP al endpoint `/api/tickets`
 * - maneja estados de carga (`loading`)
 * - captura errores (`error`)
 * - permite refrescar los datos mediante `refetch`
 *
 * Flujo de ejecución:
 *
 * 1. Se construyen los query params a partir de `options`
 * 2. Se realiza la petición al endpoint
 * 3. Se actualiza el estado `tickets`
 * 4. Se manejan errores en caso de fallo
 *
 * @example
 * ```tsx
 * const { tickets, loading, error } = useTickets({
 *   userId: "123",
 *   status: "pending",
 * });
 * ```
 */
export function useTickets(
  options: UseTicketsOptions = {}
): UseTicketsReturn {
  /**
   * Lista de tickets obtenidos.
   */
  const [tickets, setTickets] = useState<Request[]>([]);

  /**
   * Estado de carga de la consulta.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Estado de error de la consulta.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Función encargada de realizar la consulta al backend.
   *
   * @remarks
   * Se memoiza con `useCallback` para evitar recreaciones innecesarias
   * y permitir su reutilización en `useEffect` y `refetch`.
   */
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      /* ------------------------------------------------------------------ */
      /* Construcción de parámetros                                         */
      /* ------------------------------------------------------------------ */

      const params = new URLSearchParams();

      if (options.userId) {
        params.set("userId", options.userId);
      }

      if (options.status) {
        params.set("status", options.status);
      }

      if (options.departmentId) {
        params.set("departmentId", options.departmentId);
      }

      /* ------------------------------------------------------------------ */
      /* Llamada a la API                                                   */
      /* ------------------------------------------------------------------ */

      const response = await fetch(
        `/api/tickets?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error(
          `Error ${response.status}: ${response.statusText}`
        );
      }

      const data: Request[] = await response.json();

      setTickets(data);
    } catch (err) {
      console.error("[useTickets]", err);

      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido"
      );
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.status, options.departmentId]);

  /**
   * Ejecuta la consulta automáticamente al montar el componente
   * o cuando cambian las opciones de filtrado.
   */
  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  /**
   * Retorno del hook.
   *
   * Incluye:
   * - datos (`tickets`)
   * - estados (`loading`, `error`)
   * - función de actualización (`refetch`)
   */
  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
  };
}