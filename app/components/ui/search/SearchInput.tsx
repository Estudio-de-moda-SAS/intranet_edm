/**
 * @module SearchInput
 * Componente cliente para renderizar un input de búsqueda reutilizable.
 *
 * @remarks
 * Incluye un ícono decorativo y estilos consistentes con el sistema de diseño.
 */

"use client";

import { Search } from "lucide-react";

/**
 * Props del componente {@link SearchInput}.
 */
interface SearchInputProps {
  /**
   * Valor actual del input.
   */
  value: string;

  /**
   * Callback que se ejecuta al cambiar el valor.
   */
  onChange: (value: string) => void;

  /**
   * Texto placeholder del input.
   *
   * @defaultValue "Buscar..."
   */
  placeholder?: string;
}

/**
 * Renderiza un campo de búsqueda controlado con ícono.
 *
 * @param props Propiedades del componente.
 * @param props.value Valor actual.
 * @param props.onChange Función de cambio.
 * @param props.placeholder Texto placeholder.
 * @returns Input de búsqueda estilizado.
 *
 * @remarks
 * Flujo:
 * 1. Muestra un ícono de búsqueda posicionado de forma absoluta.
 * 2. Renderiza un `<input>` controlado.
 * 3. Propaga los cambios al estado padre mediante `onChange`.
 */
export default function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: SearchInputProps) {
  return (
    <div className="relative w-full">
      <Search
        size={14}
        className="absolute left-3 top-1/2 -translate-y-1/2
                   text-slate-400 dark:text-[#545d68]"
      />

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs transition-colors
                   border-slate-200 bg-white text-slate-700 placeholder:text-slate-400
                   focus:outline-none focus:ring-2 focus:ring-slate-200
                   dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#cdd9e5] dark:placeholder:text-[#545d68]
                   dark:focus:ring-violet-500/20 dark:focus:border-violet-500/50"
      />
    </div>
  );
}