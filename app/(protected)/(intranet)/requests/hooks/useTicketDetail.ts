/**
 * @module useTicketDetail
 * Hook personalizado para obtener el detalle de un ticket por su identificador.
 *
 * @remarks
 * Este hook encapsula la lógica de obtención de datos del ticket,
 * exponiendo un estado controlado que incluye:
 *
 * - información del ticket
 * - estado de carga
 * - errores
 * - estado de no encontrado
 *
 * Actualmente opera en modo mock utilizando {@link getTicketById},
 * pero está preparado para migrar fácilmente a una integración con API.
 */

// app/(protected)/(intranet)/requests/hooks/useTicketDetail.ts

"use client";

import { useState, useEffect } from "react";
import {
  getTicketById,
  type TicketDetail,
} from "@/app/(protected)/(intranet)/requests/data/tickets";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Estructura de retorno del hook {@link useTicketDetail}.
 *
 * @property ticket Detalle del ticket si existe.
 * @property loading Indica si la información está siendo cargada.
 * @property error Mensaje de error en caso de fallo.
 * @property notFound Indica si el ticket no fue encontrado.
 */
interface UseTicketDetailReturn {
  ticket: TicketDetail | null;
  loading: boolean;
  error: string | null;
  notFound: boolean;
}

/* -------------------------------------------------------------------------- */
/* Hook                                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Hook para obtener el detalle de un ticket por ID.
 *
 * @param ticketId Identificador del ticket a consultar.
 * @returns Estado controlado del ticket y del proceso de carga.
 *
 * @remarks
 * Este hook:
 *
 * - consulta el detalle del ticket (mock o API)
 * - maneja estados de carga (`loading`)
 * - controla errores (`error`)
 * - detecta cuando el ticket no existe (`notFound`)
 *
 * Flujo actual (modo mock):
 *
 * 1. Se intenta obtener el ticket desde {@link getTicketById}
 * 2. Si existe → se almacena en `ticket`
 * 3. Si no existe → `notFound = true`
 *
 * Flujo futuro (modo API):
 *
 * - se realizará una petición HTTP al endpoint:
 *   `/api/tickets/:id`
 * - se manejarán errores de red y estados HTTP
 *
 * @example
 * ```tsx
 * const { ticket, loading, error, notFound } = useTicketDetail("ti-1");
 * ```
 */
export function useTicketDetail(ticketId: string): UseTicketDetailReturn {
  /**
   * Estado del ticket obtenido.
   */
  const [ticket, setTicket] = useState<TicketDetail | null>(null);

  /**
   * Estado de carga del hook.
   */
  const [loading, setLoading] = useState(true);

  /**
   * Mensaje de error en caso de fallo.
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * Indica si el ticket no fue encontrado.
   */
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    /* ---------------------------------------------------------------------- */
    /* MODO MOCK (actual)                                                     */
    /* ---------------------------------------------------------------------- */

    const found = getTicketById(ticketId);

    if (found) {
      setTicket(found);
    } else {
      setNotFound(true);
    }

    setLoading(false);

    /* ---------------------------------------------------------------------- */
    /* MODO API (futuro)                                                      */
    /* ---------------------------------------------------------------------- */

    /**
     * Implementación sugerida para integración con backend.
     *
     * @example
     * ```ts
     * const res = await fetch(`/api/tickets/${ticketId}`);
     * ```
     */
    // let cancelled = false;
    //
    // async function fetchDetail() {
    //   try {
    //     const res = await fetch(`/api/tickets/${ticketId}`);
    //
    //     if (res.status === 404) {
    //       if (!cancelled) setNotFound(true);
    //       return;
    //     }
    //
    //     if (!res.ok) {
    //       throw new Error(`Error ${res.status}: ${res.statusText}`);
    //     }
    //
    //     const data: TicketDetail = await res.json();
    //
    //     if (!cancelled) setTicket(data);
    //
    //   } catch (err) {
    //     if (!cancelled) {
    //       setError(
    //         err instanceof Error
    //           ? err.message
    //           : "Error desconocido"
    //       );
    //     }
    //   } finally {
    //     if (!cancelled) setLoading(false);
    //   }
    // }
    //
    // fetchDetail();
    //
    // return () => {
    //   cancelled = true;
    // };

  }, [ticketId]);

  return { ticket, loading, error, notFound };
}