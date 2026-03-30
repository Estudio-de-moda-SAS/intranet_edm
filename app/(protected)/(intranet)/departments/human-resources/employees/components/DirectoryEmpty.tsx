"use client";

// components/DirectoryEmpty.tsx

type Props = { hasFilters: boolean; onClear: () => void };

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
        <button onClick={onClear} className="mt-4 text-xs font-medium text-violet-700 hover:underline transition">
          Limpiar filtros
        </button>
      )}
    </div>
  );
}