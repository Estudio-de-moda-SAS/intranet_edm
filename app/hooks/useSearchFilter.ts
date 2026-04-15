/**
 * @module useSearchFilter
 * Hook genérico para filtrar listas mediante un criterio de búsqueda.
 *
 * @remarks
 * Este hook permite aplicar lógica de filtrado reutilizable sobre cualquier
 * tipo de colección (`T[]`), delegando la lógica específica al `predicate`.
 *
 * Es útil para:
 *
 * - tablas
 * - listados
 * - selects
 * - autocompletados
 *
 * @typeParam T Tipo de los elementos a filtrar.
 */

"use client";

import { useMemo, useState } from "react";

/**
 * Hook de filtrado basado en texto de búsqueda.
 *
 * @param items Lista de elementos a filtrar.
 * @param predicate Función que define si un elemento coincide con la búsqueda.
 *
 * @returns Estado de búsqueda y lista filtrada.
 *
 * @remarks
 * Funcionamiento:
 *
 * 1. Mantiene un estado interno `search`.
 * 2. Si `search` está vacío, devuelve todos los elementos.
 * 3. Si no, aplica el `predicate` a cada elemento.
 * 4. El `search` se normaliza a minúsculas antes de evaluarse.
 *
 * Optimización:
 *
 * - Usa `useMemo` para evitar recalcular el filtrado innecesariamente.
 *
 * @example
 * ```ts
 * const { search, setSearch, filtered } = useSearchFilter(users, (user, q) =>
 *   user.name.toLowerCase().includes(q)
 * );
 * ```
 */
export function useSearchFilter<T>(
  items: T[],
  predicate: (item: T, search: string) => boolean
) {
  /**
   * Texto de búsqueda ingresado por el usuario.
   */
  const [search, setSearch] = useState("");

  /**
   * Lista filtrada según el criterio definido.
   */
  const filtered = useMemo(() => {
    if (!search) return items;

    return items.filter((item) =>
      predicate(item, search.toLowerCase())
    );
  }, [items, search, predicate]);

  return {
    search,
    setSearch,
    filtered,
  };
}