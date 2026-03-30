"use client";

// hooks/useEmployeeFilters.ts
//
// Gestiona búsqueda, filtros y vista (grid / list) en el cliente.
// Usa next/navigation (App Router). Los filtros se sincronizan con
// la URL via searchParams para ser compartibles y sobrevivir el botón Atrás.

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import type { Employee, EmployeeFilters } from "@/types/employee";

export type ViewMode = "grid" | "list";

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useEmployeeFilters(employees: Employee[]) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  // Leer filtros desde URL
  const filters = useMemo((): EmployeeFilters => ({
    query:        searchParams.get("q")    ?? "",
    departmentId: searchParams.get("dept") ?? "",
    status:       (searchParams.get("st")  ?? "") as EmployeeFilters["status"],
  }), [searchParams]);

  const viewMode = useMemo((): ViewMode =>
    searchParams.get("view") === "list" ? "list" : "grid",
  [searchParams]);

  // Actualiza params sin resetear los demás
  const setParam = useCallback(
    (updates: Partial<Record<"q" | "dept" | "st" | "view", string>>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === "" || v === undefined) {
          params.delete(k);
        } else {
          params.set(k, v);
        }
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const setQuery        = useCallback((q: string)      => setParam({ q }),    [setParam]);
  const setDepartmentId = useCallback((dept: string)   => setParam({ dept }), [setParam]);
  const setStatus       = useCallback((st: string)     => setParam({ st }),   [setParam]);
  const setViewMode     = useCallback((view: ViewMode) => setParam({ view }), [setParam]);

  const clearFilters = useCallback(() => {
    const view = searchParams.get("view");
    const params = new URLSearchParams();
    if (view) params.set("view", view);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [router, pathname, searchParams]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase().trim();
    return employees.filter((e) => {
      if (q &&
        !e.displayName.toLowerCase().includes(q) &&
        !e.jobTitle.toLowerCase().includes(q) &&
        !e.mail.toLowerCase().includes(q)
      ) return false;
      if (filters.departmentId && e.departmentId !== filters.departmentId) return false;
      if (filters.status       && e.status       !== filters.status)       return false;
      return true;
    });
  }, [employees, filters]);

  const grouped = useMemo((): Record<string, Employee[]> =>
    filtered.reduce<Record<string, Employee[]>>((acc, emp) => {
      const key = emp.department || "Sin departamento";
      (acc[key] ??= []).push(emp);
      return acc;
    }, {}),
  [filtered]);

  const stats = useMemo(() => ({
    total:    filtered.length,
    active:   filtered.filter((e) => e.status === "active").length,
    remote:   filtered.filter((e) => e.status === "remote").length,
    leave:    filtered.filter((e) => e.status === "leave").length,
    inactive: filtered.filter((e) => e.status === "inactive").length,
  }), [filtered]);

  const hasActiveFilters =
    !!filters.query || !!filters.departmentId || !!filters.status;

  return {
    filters,
    viewMode,
    filtered,
    grouped,
    stats,
    hasActiveFilters,
    setQuery,
    setDepartmentId,
    setStatus,
    setViewMode,
    clearFilters,
  };
}