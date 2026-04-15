/**
 * @module DirectoryHomePage
 * Componente cliente principal para la visualización y gestión del directorio de empleados.
 *
 * @remarks
 * Este archivo implementa la interfaz principal del directorio de empleados,
 * permitiendo al usuario explorar, filtrar y visualizar la información del personal.
 *
 * Su responsabilidad incluye:
 *
 * - Mostrar métricas generales del directorio.
 * - Gestionar filtros por texto, estado y departamento.
 * - Alternar entre vista en cuadrícula y vista en lista.
 * - Renderizar los empleados filtrados.
 * - Controlar la selección de empleados para visualizar su detalle en un modal.
 *
 * Este componente se ejecuta del lado del cliente porque utiliza estado local,
 * memoización, callbacks y eventos de interacción.
 */

"use client";

import { useState, useMemo, useCallback } from "react";
import { Employee, Department, DirectoryFilters } from "../types";
import { DEPARTMENT_COLORS, searchEmployees } from "../mockEmployees";
import { EmployeeCard } from "./EmployeeCard";
import { EmployeeModal } from "./EmployeeModal";

/**
 * Lista de departamentos disponibles para el filtrado del directorio.
 *
 * @remarks
 * Incluye la opción especial `"Todos"` para permitir una vista sin restricción
 * por departamento.
 */
const DEPARTMENTS: Array<Department | "Todos"> = [
  "Todos",
  "Dirección General",
  "TI",
  "Recursos Humanos",
  "Finanzas",
  "Jurídica",
  "Comercial",
  "eCommerce",
  "Logística",
  "Tiendas",
];

/**
 * Props del componente {@link DirectoryClient}.
 */
interface Props {
  /**
   * Colección completa de empleados que alimenta el directorio.
   */
  employees: Employee[];
}

/**
 * Componente cliente que renderiza el directorio interactivo de empleados.
 *
 * @param props Propiedades del componente.
 * @param props.employees Listado completo de empleados disponibles.
 * @returns Estructura visual principal del directorio.
 *
 * @remarks
 * Flujo general del componente:
 *
 * 1. Inicializa el estado de filtros, vista y empleado seleccionado.
 * 2. Calcula dinámicamente la lista de empleados filtrados.
 * 3. Calcula métricas generales para el encabezado KPI.
 * 4. Renderiza controles de búsqueda, estado, departamento y tipo de vista.
 * 5. Muestra los resultados en formato grid o lista.
 * 6. Abre un modal con el detalle del empleado seleccionado.
 *
 * Este componente actúa como contenedor principal de experiencia de usuario
 * para el módulo de directorio.
 */
export function DirectoryClient({ employees }: Props) {
  /**
   * Estado local de filtros aplicados al directorio.
   *
   * @remarks
   * Incluye:
   * - `search`: texto libre de búsqueda.
   * - `department`: departamento seleccionado.
   * - `status`: estado laboral seleccionado.
   */
  const [filters, setFilters] = useState<DirectoryFilters>({
    search: "",
    department: "Todos",
    status: "Todos",
  });

  /**
   * Estado que controla el modo actual de visualización.
   *
   * @remarks
   * Valores posibles:
   * - `"grid"`: muestra empleados como tarjetas.
   * - `"list"`: muestra empleados en formato de lista vertical.
   */
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  /**
   * Estado que almacena el empleado seleccionado actualmente.
   *
   * @remarks
   * Cuando tiene valor, alimenta el modal de detalle.
   * Cuando es `null`, el modal permanece cerrado.
   */
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  /**
   * Colección de empleados filtrados según los criterios activos.
   *
   * @remarks
   * El filtrado se realiza en el siguiente orden:
   *
   * 1. Filtro por departamento.
   * 2. Filtro por estado.
   * 3. Búsqueda textual mediante {@link searchEmployees}.
   *
   * Se memoiza para evitar cálculos innecesarios en cada render.
   */
  const filtered = useMemo(() => {
    let result = employees;

    if (filters.department !== "Todos") {
      result = result.filter((e) => e.department === filters.department);
    }

    if (filters.status !== "Todos") {
      result = result.filter((e) => e.status === filters.status);
    }

    result = searchEmployees(filters.search, result);
    return result;
  }, [employees, filters]);

  /**
   * Métricas resumidas del directorio.
   *
   * @remarks
   * Incluye indicadores para:
   *
   * - Total de empleados.
   * - Empleados activos.
   * - Empleados remotos.
   * - Cantidad de departamentos únicos.
   *
   * Se utiliza en la franja superior de KPIs.
   */
  const stats = useMemo(
    () => ({
      total: employees.length,
      active: employees.filter((e) => e.status === "active").length,
      remote: employees.filter((e) => e.status === "remote").length,
      departments: new Set(employees.map((e) => e.department)).size,
    }),
    [employees]
  );

  /**
   * Selecciona un empleado y actualiza el estado del modal de detalle.
   *
   * @param emp Empleado seleccionado por el usuario.
   * @returns No retorna valor.
   */
  const handleSelect = useCallback((emp: Employee) => setSelectedEmployee(emp), []);

  /**
   * Cierra el modal de detalle limpiando el empleado seleccionado.
   *
   * @returns No retorna valor.
   */
  const handleClose = useCallback(() => setSelectedEmployee(null), []);

  return (
    <>
      {/* ── KPI Strip ──────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        {[
          { label: "Total empleados", value: stats.total, icon: "👥", color: "#1e3a5f" },
          { label: "Activos", value: stats.active, icon: "✅", color: "#10b981" },
          { label: "Remotos", value: stats.remote, icon: "🏠", color: "#3b82f6" },
          { label: "Departamentos", value: stats.departments, icon: "🏢", color: "#8b5cf6" },
        ].map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              borderRadius: "12px",
              padding: "1rem 1.25rem",
              border: "1px solid #e8ecf0",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span style={{ fontSize: "1.5rem" }}>{kpi.icon}</span>
            <div>
              <div
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: kpi.color,
                  lineHeight: 1,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {kpi.value}
              </div>
              <div style={{ fontSize: "0.72rem", color: "#9ca3af", fontWeight: 500, marginTop: "2px" }}>
                {kpi.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Controles ──────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          borderRadius: "14px",
          border: "1px solid #e8ecf0",
          padding: "1rem 1.25rem",
          marginBottom: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Búsqueda + toggle */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px", position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre, cargo, email, ciudad…"
              value={filters.search}
              onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
              style={{
                width: "100%",
                padding: "0.6rem 0.75rem 0.6rem 2.25rem",
                borderRadius: "9px",
                border: "1px solid #e5e7eb",
                fontSize: "0.85rem",
                fontFamily: "'DM Sans', sans-serif",
                color: "#374151",
                outline: "none",
                background: "#f9fafb",
                transition: "border-color 0.15s",
                boxSizing: "border-box",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#93c5fd")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as any }))}
            style={{
              padding: "0.6rem 0.875rem",
              borderRadius: "9px",
              border: "1px solid #e5e7eb",
              fontSize: "0.82rem",
              fontFamily: "'DM Sans', sans-serif",
              color: "#374151",
              background: "#f9fafb",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="Todos">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="remote">Remoto</option>
            <option value="vacation">Vacaciones</option>
            <option value="away">Ausente</option>
          </select>

          <div
            style={{
              display: "flex",
              background: "#f3f4f6",
              borderRadius: "9px",
              padding: "3px",
              gap: "2px",
            }}
          >
            {(["grid", "list"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: "0.35rem 0.75rem",
                  borderRadius: "7px",
                  border: "none",
                  background: viewMode === mode ? "#fff" : "transparent",
                  boxShadow: viewMode === mode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  color: viewMode === mode ? "#374151" : "#9ca3af",
                }}
                title={mode === "grid" ? "Vista cuadrícula" : "Vista lista"}
              >
                {mode === "grid" ? <GridIcon /> : <ListIcon />}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro de departamentos */}
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {DEPARTMENTS.map((dept) => {
            const color = dept === "Todos" ? "#6b7280" : (DEPARTMENT_COLORS[dept] ?? "#6b7280");
            const isActive = filters.department === dept;

            return (
              <button
                key={dept}
                onClick={() => setFilters((f) => ({ ...f, department: dept }))}
                style={{
                  padding: "0.3rem 0.75rem",
                  borderRadius: "999px",
                  border: `1.5px solid ${isActive ? color : "#e5e7eb"}`,
                  background: isActive ? `${color}15` : "transparent",
                  color: isActive ? color : "#6b7280",
                  fontSize: "0.75rem",
                  fontWeight: isActive ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                }}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Resultados header ─────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "0.875rem",
        }}
      >
        <p style={{ fontSize: "0.82rem", color: "#9ca3af", fontFamily: "'DM Sans', sans-serif", margin: 0 }}>
          {filtered.length === 0
            ? "Sin resultados"
            : `${filtered.length} ${filtered.length === 1 ? "empleado" : "empleados"} encontrado${filtered.length === 1 ? "" : "s"}`}
          {filters.department !== "Todos" && ` en ${filters.department}`}
        </p>

        {(filters.search || filters.department !== "Todos" || filters.status !== "Todos") && (
          <button
            onClick={() => setFilters({ search: "", department: "Todos", status: "Todos" })}
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              background: "none",
              border: "none",
              cursor: "pointer",
              textDecoration: "underline",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* ── Grid / List ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onSelect={handleSelect} viewMode="grid" />
          ))}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} employee={emp} onSelect={handleSelect} viewMode="list" />
          ))}
        </div>
      )}

      <EmployeeModal employee={selectedEmployee} onClose={handleClose} />
    </>
  );
}

/**
 * Componente auxiliar para representar el estado vacío del directorio.
 *
 * @returns Vista informativa cuando no existen resultados para los filtros aplicados.
 *
 * @remarks
 * Se renderiza cuando la colección filtrada de empleados está vacía.
 * Su objetivo es comunicar al usuario que debe ajustar los criterios de búsqueda.
 */
function EmptyState() {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "4rem 2rem",
        background: "#fff",
        borderRadius: "16px",
        border: "1px solid #e8ecf0",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>🔍</div>
      <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#374151", margin: "0 0 0.4rem", fontFamily: "'DM Sans', sans-serif" }}>
        Sin resultados
      </h3>
      <p style={{ fontSize: "0.85rem", color: "#9ca3af", margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
        Intenta con otro nombre, cargo o departamento
      </p>
    </div>
  );
}

/**
 * Icono SVG para representar la vista en cuadrícula.
 *
 * @returns Icono visual de distribución tipo grid.
 */
function GridIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="1" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

/**
 * Icono SVG para representar la vista en lista.
 *
 * @returns Icono visual de distribución tipo lista.
 */
function ListIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M1 3h13M1 7.5h13M1 12h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}