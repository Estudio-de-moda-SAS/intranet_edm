/**
 * @module useGlobalSearch
 * Hook para gestionar la búsqueda global de navegación dentro de la intranet.
 *
 * @remarks
 * Combina tres fuentes de resultados:
 *
 * - Un catálogo controlado de secciones de navegación (síncrono).
 * - Áreas corporativas del catálogo documental (síncrono, sin llamada
 *   a Graph — es solo un filtro en memoria).
 * - Documentos y carpetas reales del usuario, buscados vía Microsoft
 *   Search API (asíncrono, con debounce).
 *
 * Los resultados de documentos solo cubren lo que el usuario ya tiene
 * permiso de ver en Microsoft 365 — el motor de búsqueda de Graph filtra
 * automáticamente por acceso real, sin lógica adicional de nuestra parte.
 */

"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AccessLevel } from "@/lib/roles";
import {
  searchDocumentsGlobal,
  type GlobalDocumentSearchResult,
} from "@/app/(protected)/(intranet)/departments/documents/services/globalDocumentSearch.service";
import { searchAreasGlobal } from "@/app/(protected)/(intranet)/departments/documents/services/globalAreaSearch.service";

/**
 * Representa un elemento navegable disponible para búsqueda global.
 */
type SearchableNavItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  department: string;
  category: string;
  enabled?: boolean;
};

/**
 * Elementos disponibles para la búsqueda global en V1.
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

const DOCUMENT_SEARCH_DEBOUNCE_MS = 350;
const MIN_QUERY_LENGTH_FOR_DOCUMENT_SEARCH = 2;

/**
 * Hook principal de búsqueda global.
 *
 * @param accessLevel Nivel de acceso del usuario.
 * @returns Estado de búsqueda y resultados combinados.
 */
export function useGlobalSearch(accessLevel: AccessLevel) {
  const [query, setQuery] = useState("");
  const [documentResults, setDocumentResults] = useState
    <GlobalDocumentSearchResult[]
  >([]);

  const latestQueryRef = useRef("");

  const navItems = useMemo(() => {
    void accessLevel;
    return SEARCHABLE_NAV_ITEMS.filter((item) => item.enabled !== false);
  }, [accessLevel]);

  const navResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) return [];

    return navItems
      .map((item) => {
        let score = 0;

        if (item.label.toLowerCase().includes(normalizedQuery)) score += 3;
        if (item.description.toLowerCase().includes(normalizedQuery))
          score += 2;
        if (item.department.toLowerCase().includes(normalizedQuery))
          score += 1;

        return { ...item, score, kind: "module" as const };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, navItems]);

  const areaResults = useMemo(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) return [];
    return searchAreasGlobal(normalizedQuery);
  }, [query]);

  useEffect(() => {
    const normalizedQuery = query.trim();
    latestQueryRef.current = normalizedQuery;

    if (normalizedQuery.length < MIN_QUERY_LENGTH_FOR_DOCUMENT_SEARCH) {
      setDocumentResults([]);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        const results = await searchDocumentsGlobal(normalizedQuery);

        if (latestQueryRef.current === normalizedQuery) {
          setDocumentResults(results);
        }
      } catch (searchError) {
        console.error("[useGlobalSearch] document search", searchError);

        if (latestQueryRef.current === normalizedQuery) {
          setDocumentResults([]);
        }
      }
    }, DOCUMENT_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const results = useMemo(
    () => [...navResults, ...areaResults, ...documentResults],
    [navResults, areaResults, documentResults]
  );

  return {
    query,
    setQuery,
    results,
  };
}