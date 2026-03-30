'use client';

import { useMemo, useState } from 'react';
import { filterCatalogByAccess } from '@/config/apps.catalog';
import type { AccessLevel } from '@/lib/roles';

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

export function useGlobalSearch(accessLevel: AccessLevel) {
  const [query, setQuery] = useState('');

  const apps = useMemo(() => {
    return filterCatalogByAccess(accessLevel);
  }, [accessLevel]);

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
          category: DEPARTMENT_LABELS[app.department] || 'Otros', // 🔥 NUEVO
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