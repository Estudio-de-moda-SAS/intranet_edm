// app/solicitudes/hooks/useTickets.ts
// Hook para obtener la lista de tickets del usuario autenticado.
// Usado por RequestsPanelWithModal en lugar de MOCK_REQUESTS directo.

"use client";

import { useState, useEffect, useCallback } from "react";
import type { Request, RequestStatus } from "@/app/(protected)/(intranet)/requests/data/tickets";

interface UseTicketsOptions {
  userId?:       string;
  status?:       RequestStatus;
  departmentId?: string;
}

interface UseTicketsReturn {
  tickets:  Request[];
  loading:  boolean;
  error:    string | null;
  refetch:  () => void;
}

export function useTickets(options: UseTicketsOptions = {}): UseTicketsReturn {
  const [tickets, setTickets] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.userId)       params.set("userId",       options.userId);
      if (options.status)       params.set("status",       options.status);
      if (options.departmentId) params.set("departmentId", options.departmentId);

      const res = await fetch(`/api/tickets?${params.toString()}`);

      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);

      const data: Request[] = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("[useTickets]", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [options.userId, options.status, options.departmentId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return { tickets, loading, error, refetch: fetchTickets };
}
