// app/(protected)/(intranet)/requests/hooks/useTicketDetail.ts
// Hook para obtener el detalle completo de un ticket por id.
//
// MODO ACTUAL: lee directamente de los datos mock (sin API).
// CUANDO TENGAS API: descomenta el bloque fetch y borra el bloque mock.

"use client";

import { useState, useEffect } from "react";
import {
  getTicketById,
  type TicketDetail,
} from "@/app/(protected)/(intranet)/requests/data/tickets";

interface UseTicketDetailReturn {
  ticket:   TicketDetail | null;
  loading:  boolean;
  error:    string | null;
  notFound: boolean;
}

export function useTicketDetail(ticketId: string): UseTicketDetailReturn {
  const [ticket,   setTicket]   = useState<TicketDetail | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    setLoading(true);
    setError(null);
    setNotFound(false);

    // ── MODO MOCK (activo ahora) ───────────────────────────────────────────
    const found = getTicketById(ticketId);
    if (found) {
      setTicket(found);
    } else {
      setNotFound(true);
    }
    setLoading(false);

    // ── MODO API (descomentar cuando tengas el endpoint listo) ────────────
    // let cancelled = false;
    // async function fetchDetail() {
    //   try {
    //     const res = await fetch(`/api/tickets/${ticketId}`);
    //     if (res.status === 404) { if (!cancelled) setNotFound(true); return; }
    //     if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
    //     const data: TicketDetail = await res.json();
    //     if (!cancelled) setTicket(data);
    //   } catch (err) {
    //     if (!cancelled) setError(err instanceof Error ? err.message : "Error desconocido");
    //   } finally {
    //     if (!cancelled) setLoading(false);
    //   }
    // }
    // fetchDetail();
    // return () => { cancelled = true; };

  }, [ticketId]);

  return { ticket, loading, error, notFound };
}

