/**
 * @module useGlobalSearch
 * Hook para gestionar la búsqueda global de navegación dentro de la intranet.
 *
 * @remarks
 * Este hook permite buscar accesos principales disponibles dentro de la
 * primera versión de la intranet.
 *
 * A diferencia de una búsqueda global de contenido, esta implementación está
 * enfocada en navegación controlada. Es decir, no indexa módulos mock,
 * funcionalidades futuras, dashboards internos ni secciones que todavía no
 * forman parte del alcance real de la V1.
 *
 * Actualmente permite:
 *
 * - buscar secciones principales disponibles para V1
 * - filtrar dinámicamente por texto (`label`, `description` o `department`)
 * - rankear resultados por relevancia (`score`)
 * - limitar la cantidad de resultados mostrados
 *
 * Es utilizado típicamente en componentes de tipo:
 *
 * - buscador global del header
 * - command palette
 * - quick access launcher
 *
 * @example
 * ```tsx
 * const { query, setQuery, results } = useGlobalSearch(accessLevel);
 *
 * setQuery('aplicaciones');
 *
 * results.map(item => console.log(item.label));
 * ```
 */

"use client";

import { useMemo, useState } from "react";
import type { AccessLevel } from "@/lib/roles";

/**
 * Representa un elemento navegable disponible para búsqueda global.
 *
 * @remarks
 * Este catálogo está limitado intencionalmente a las secciones visibles
 * y soportadas en la primera versión de la intranet.
 */
type SearchableNavItem = {
  /**
   * Identificador único del resultado.
   */
  id: string;

  /**
   * Nombre visible del resultado.
   */
  label: string;

  /**
   * Descripción breve usada en el panel de resultados.
   */
  description: string;

  /**
   * Ruta interna de navegación.
   */
  href: string;

  /**
   * Categoría interna usada para búsqueda y agrupación.
   */
  department: string;

  /**
   * Categoría amigable mostrada en el panel de resultados.
   */
  category: string;

  /**
   * Indica si el resultado debe ser indexado por el buscador.
   *
   * @defaultValue true
   */
  enabled?: boolean;
};

/**
 * Elementos disponibles para la búsqueda global en V1.
 *
 * @remarks
 * Este listado reemplaza temporalmente el catálogo global de aplicaciones
 * para evitar que el buscador muestre módulos mock, rutas futuras o
 * funcionalidades que no estarán disponibles en la primera versión.
 */
const SEARCHABLE_NAV_ITEMS: SearchableNavItem[] = [
  {
    id: "applications",
    label: "Aplicaciones",
    description: "Accede a las aplicaciones corporativas disponibles.",
    href: "/departments/applications",
    department: "applications",
    category: "Módulos disponibles",
    enabled: true,
  },
  {
    id: "ticket-systems",
    label: "Sistemas de Tickets",
    description: "Consulta y accede a las plataformas de tickets y soporte.",
    href: "/departments/ticket-systems",
    department: "tickets",
    category: "Módulos disponibles",
    enabled: true,
  },
  {
    id: "documents",
    label: "Documentos",
    description: "Consulta documentos corporativos disponibles.",
    href: "/departments/documents",
    department: "documents",
    category: "Módulos disponibles",
    enabled: true,
  },
  {
    id: "boards",
    label: "Tableros",
    description: "Accede a tableros corporativos y reportes disponibles.",
    href: "/departments/boards",
    department: "boards",
    category: "Módulos disponibles",
    enabled: true,
  },
];

/**
 * Hook principal de búsqueda global.
 *
 * @param accessLevel Nivel de acceso del usuario.
 * @returns Estado de búsqueda y resultados filtrados.
 *
 * @remarks
 * `accessLevel` se mantiene como parámetro por compatibilidad con la firma
 * anterior del hook y para permitir una futura evolución hacia búsqueda
 * condicionada por permisos.
 *
 * En esta versión, la búsqueda se limita a navegación V1 y no depende del
 * catálogo general de aplicaciones.
 *
 * Flujo de funcionamiento:
 *
 * 1. Usa un catálogo controlado de secciones disponibles en V1.
 * 2. Filtra elementos deshabilitados (`enabled: false`).
 * 3. Aplica búsqueda basada en texto (`query`).
 * 4. Calcula un `score` por relevancia:
 *    - +3 si coincide con el nombre (`label`)
 *    - +2 si coincide con la descripción
 *    - +1 si coincide con la categoría interna (`department`)
 * 5. Ordena los resultados por score descendente.
 * 6. Limita a los 8 resultados más relevantes.
 *
 * Optimización:
 *
 * - Usa `useMemo` para evitar recomputaciones innecesarias.
 */
export function useGlobalSearch(accessLevel: AccessLevel) {
  /**
   * Query de búsqueda ingresada por el usuario.
   */
  const [query, setQuery] = useState("");

  /**
   * Catálogo navegable filtrado para V1.
   *
   * @remarks
   * Se referencia `accessLevel` para conservar compatibilidad y evitar
   * warnings si más adelante se decide filtrar por permisos.
   */
  const navItems = useMemo(() => {
    void accessLevel;

    return SEARCHABLE_NAV_ITEMS.filter((item) => item.enabled !== false);
  }, [accessLevel]);

  /**
   * Resultados de búsqueda procesados y rankeados.
   */
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return navItems
      .map((item) => {
        let score = 0;

        if (item.label.toLowerCase().includes(normalizedQuery)) score += 3;
        if (item.description.toLowerCase().includes(normalizedQuery)) score += 2;
        if (item.department.toLowerCase().includes(normalizedQuery)) score += 1;

        return {
          ...item,
          score,
        };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, navItems]);

  return {
    query,
    setQuery,
    results,
  };
}