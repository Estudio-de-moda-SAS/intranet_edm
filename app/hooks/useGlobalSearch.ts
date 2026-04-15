/**
 * @module useGlobalSearch
 * Hook para gestionar la búsqueda global de aplicaciones dentro de la intranet.
 *
 * @remarks
 * Este hook permite:
 *
 * - filtrar aplicaciones según el nivel de acceso del usuario
 * - buscar dinámicamente por texto (label, descripción o departamento)
 * - rankear resultados por relevancia (score)
 * - limitar la cantidad de resultados mostrados
 *
 * Es utilizado típicamente en componentes de tipo:
 *
 * - buscador global (header)
 * - command palette
 * - quick access launcher
 */

'use client';

import { useMemo, useState } from 'react';
import { filterCatalogByAccess } from '@/config/apps.catalog';
import type { AccessLevel } from '@/lib/roles';

/**
 * Mapeo de identificadores de departamento a etiquetas legibles.
 *
 * @remarks
 * Se utiliza para mostrar categorías amigables en los resultados
 * de búsqueda.
 */
const DEPARTMENT_LABELS: Record<string, string> = {
  hr: 'RRHH',
  finance: 'Finanzas',
  it: 'IT',
  'administrative-services': 'Administración',
  legal: 'Legal',
  logistics: 'Logística',
  retail: 'Retail',
  documents: 'Documentos',
};

/**
 * Hook principal de búsqueda global.
 *
 * @param accessLevel Nivel de acceso del usuario.
 * @returns Estado de búsqueda y resultados filtrados.
 *
 * @remarks
 * Flujo de funcionamiento:
 *
 * 1. Filtra el catálogo de aplicaciones según el nivel de acceso.
 * 2. Aplica búsqueda basada en texto (`query`).
 * 3. Calcula un `score` por relevancia:
 *    - +3 si coincide con el nombre (label)
 *    - +2 si coincide con la descripción
 *    - +1 si coincide con el departamento
 * 4. Ordena los resultados por score descendente.
 * 5. Limita a los 8 resultados más relevantes.
 *
 * Optimización:
 *
 * - Usa `useMemo` para evitar recomputaciones innecesarias.
 *
 * @example
 * ```tsx
 * const { query, setQuery, results } = useGlobalSearch(accessLevel);
 *
 * setQuery('finanzas');
 *
 * results.map(app => console.log(app.label));
 * ```
 */
export function useGlobalSearch(accessLevel: AccessLevel) {
  /**
   * Query de búsqueda ingresada por el usuario.
   */
  const [query, setQuery] = useState('');

  /**
   * Catálogo de aplicaciones filtrado por nivel de acceso.
   */
  const apps = useMemo(() => {
    return filterCatalogByAccess(accessLevel);
  }, [accessLevel]);

  /**
   * Resultados de búsqueda procesados y rankeados.
   */
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();

    return apps
      .map(app => {
        let score = 0;

        if (app.label.toLowerCase().includes(q)) score += 3;
        if (app.description.toLowerCase().includes(q)) score += 2;
        if (app.department.toLowerCase().includes(q)) score += 1;

        return {
          ...app,
          score,
          /**
           * Categoría amigable derivada del departamento.
           */
          category: DEPARTMENT_LABELS[app.department] || 'Otros',
        };
      })
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, apps]);

  return {
    query,
    setQuery,
    results,
  };
}