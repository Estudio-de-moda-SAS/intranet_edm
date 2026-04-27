/**
 * @module FilterBar
 * Componente cliente para renderizar una barra de búsqueda y filtros.
 *
 * @remarks
 * Este archivo implementa un contenedor reutilizable para combinar:
 * - un campo de búsqueda principal,
 * - uno o varios selects de filtrado.
 *
 * Está pensado para listados, tablas, directorios o vistas con búsqueda rápida.
 */

"use client";

import SearchInput from "@/app/components/ui/search/SearchInput";
import FilterSelect from "./FilterSelect";

/**
 * Representa la configuración de un filtro desplegable.
 */
interface Filter {
  /**
   * Valor actual seleccionado.
   */
  value: string;

  /**
   * Callback ejecutado cuando cambia el valor.
   */
  onChange: (value: string) => void;

  /**
   * Opciones disponibles del filtro.
   */
  options: { value: string; label: string }[];
}

/**
 * Props del componente {@link FilterBar}.
 */
interface FilterBarProps {
  /**
   * Texto actual de búsqueda.
   */
  search: string;

  /**
   * Función para actualizar el valor de búsqueda.
   */
  setSearch: (value: string) => void;

  /**
   * Texto placeholder del campo de búsqueda.
   *
   * @defaultValue "Buscar..."
   */
  searchPlaceholder?: string;

  /**
   * Lista opcional de filtros desplegables.
   *
   * @defaultValue []
   */
  filters?: Filter[];
}

/**
 * Renderiza una barra de filtros con búsqueda y selects opcionales.
 *
 * @param props Propiedades del componente.
 * @param props.search Valor actual de búsqueda.
 * @param props.setSearch Función para actualizar la búsqueda.
 * @param props.searchPlaceholder Placeholder del input.
 * @param props.filters Filtros adicionales.
 * @returns Barra superior de filtrado.
 *
 * @remarks
 * Flujo general:
 * 1. Renderiza un {@link SearchInput} como control principal.
 * 2. Si existen filtros, renderiza un {@link FilterSelect} por cada uno.
 * 3. Mantiene una disposición horizontal para integrarse en paneles y listados.
 */
export default function FilterBar({
  search,
  setSearch,
  searchPlaceholder = "Buscar...",
  filters = [],
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 px-5 py-3
                    border-b border-slate-100 bg-slate-50/50
                    dark:border-[#21262d] dark:bg-[#1c2128]/40">
      <div className="flex-1">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder={searchPlaceholder}
        />
      </div>

      {filters.map((filter, i) => (
        <FilterSelect
          key={i}
          value={filter.value}
          onChange={filter.onChange}
          options={filter.options}
        />
      ))}
    </div>
  );
}