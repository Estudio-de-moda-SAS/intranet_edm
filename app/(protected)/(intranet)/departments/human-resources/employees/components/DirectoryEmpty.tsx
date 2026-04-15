/**
 * @module DirectoryEmpty
 * Estado vacío del directorio de empleados.
 *
 * @remarks
 * Este componente se muestra cuando no existen resultados para renderizar,
 * ya sea porque:
 * - No hay empleados registrados
 * - Los filtros aplicados no devuelven coincidencias
 *
 * Incluye mensajes dinámicos y una acción opcional para limpiar filtros.
 */

"use client";

// components/DirectoryEmpty.tsx

/**
 * Props del componente {@link DirectoryEmpty}.
 *
 * @property hasFilters Indica si hay filtros activos aplicados.
 * @property onClear Función callback para limpiar los filtros.
 */
type Props = {
  hasFilters: boolean;
  onClear: () => void;
};

/**
 * Componente de estado vacío del directorio.
 *
 * @param props Propiedades del componente.
 * @returns Vista centrada con mensaje informativo y acción opcional.
 *
 * @remarks
 * Comportamiento:
 * - Si `hasFilters` es `true` → muestra mensaje de "sin resultados"
 * - Si `hasFilters` es `false` → muestra mensaje de lista vacía
 *
 * Características:
 * - Icono visual para reforzar el estado
 * - Texto contextual dinámico
 * - Botón para limpiar filtros cuando aplica
 *
 * @example
 * ```tsx
 * <DirectoryEmpty
 *   hasFilters={hasActiveFilters}
 *   onClear={clearFilters}
 * />
 * ```
 */
export function DirectoryEmpty({ hasFilters, onClear }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-12 h-12 rounded-full bg-violet-50 border border-violet-100 flex items-center justify-center mb-4">
        <span className="text-xl select-none">🔍</span>
      </div>

      <p className="text-sm font-medium text-slate-700">
        {hasFilters ? "Sin resultados" : "No hay empleados registrados"}
      </p>

      <p className="text-xs text-slate-400 mt-1 max-w-xs">
        {hasFilters
          ? "Ningún empleado coincide con los filtros aplicados."
          : "Los empleados aparecerán aquí una vez sincronizados desde Microsoft Graph."}
      </p>

      {hasFilters && (
        <button
          onClick={onClear}
          className="mt-4 text-xs font-medium text-violet-700 hover:underline transition"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}