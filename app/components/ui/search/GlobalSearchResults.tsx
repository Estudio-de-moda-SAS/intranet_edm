/**
 * @module GlobalSearchResults
 * Componente cliente para mostrar los resultados de la búsqueda global.
 *
 * @remarks
 * Renderiza la lista de resultados agrupados por categoría, con
 * navegación por teclado y resaltado del texto buscado. El ícono de cada
 * fila depende de `kind`: módulo, área corporativa, biblioteca, carpeta
 * o archivo (con color según tipo, igual que en la tabla del módulo
 * Documentos).
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  ChevronRight,
  File,
  FileStack,
  Folder,
  LayoutGrid,
} from 'lucide-react';
import { getDocumentIcon } from '@/app/(protected)/(intranet)/departments/documents/utils/getDocumentIcon';
import {
  formatFileSize,
  formatShortDate,
} from '@/app/(protected)/(intranet)/departments/documents/utils/formatDocumentMeta';
import './GlobalSearchResults.css';

/**
 * Representa un resultado individual de búsqueda.
 */
interface SearchResultItem {
  label: string;
  description: string;
  href: string;
  category?: string;
  kind?: 'module' | 'area' | 'library' | 'folder' | 'file';
  pathSegments?: string[];
  size?: number;
  lastModifiedDateTime?: string;
}

/**
 * Props del componente {@link GlobalSearchResults}.
 */
interface Props {
  results: SearchResultItem[];
  query: string;
  onSelect?: () => void;
}

function isExternalHref(href: string) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function ResultIcon({ item }: { item: SearchResultItem }) {
  if (item.kind === 'file') {
    const { icon: Icon, colorClass } = getDocumentIcon(item.label);
    return (
      <span className="gsearch-row__icon">
        <Icon className={`h-5 w-5 ${colorClass}`} />
      </span>
    );
  }

  if (item.kind === 'folder') {
    return (
      <span className="gsearch-row__icon">
        <Folder className="h-5 w-5" style={{ color: '#7c3aed' }} />
      </span>
    );
  }

  if (item.kind === 'library') {
    return (
      <span className="gsearch-row__icon">
        <FileStack className="h-5 w-5" style={{ color: '#7c3aed' }} />
      </span>
    );
  }

  if (item.kind === 'area') {
    return (
      <span className="gsearch-row__icon gsearch-row__icon--module">
        <Building2 className="h-5 w-5" />
      </span>
    );
  }

  return (
    <span className="gsearch-row__icon gsearch-row__icon--module">
      <LayoutGrid className="h-5 w-5" />
    </span>
  );
}

/**
 * Renderiza la lista de resultados de búsqueda global.
 */
export default function GlobalSearchResults({ results, query, onSelect }: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResultItem[]> = {};

    results.forEach((item) => {
      const category = item.category || 'Otros';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    return grouped;
  }, [results]);

  const flatResults = useMemo(
    () => Object.values(groupedResults).flat(),
    [groupedResults]
  );

  const handleSelect = (href: string) => {
    if (isExternalHref(href)) {
      window.open(href, '_blank', 'noopener,noreferrer');
    } else {
      router.push(href);
    }
    onSelect?.();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!flatResults.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((p) => (p + 1) % flatResults.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((p) => (p - 1 + flatResults.length) % flatResults.length);
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        const selected = flatResults[activeIndex];
        if (selected) {
          handleSelect(selected.href);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatResults, activeIndex]);

  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeIndex]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="font-semibold text-violet-700 dark:text-violet-400">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  if (results.length === 0) {
    return (
      <div className="gsearch-empty">
        <File className="h-8 w-8" />
        <p>
          No encontramos resultados para <strong>&quot;{query}&quot;</strong>
        </p>
      </div>
    );
  }

  let globalIndex = -1;

  return (
    <div>
      {Object.entries(groupedResults).map(([category, items]) => (
        <div key={category}>
          <div className="gsearch-category">{category}</div>

          {items.map((item) => {
            globalIndex++;
            const isActive = activeIndex === globalIndex;
            const idx = globalIndex;

            const metaParts: string[] = [];
            if (item.kind === 'file' && item.size !== undefined)
              metaParts.push(formatFileSize(item.size));
            if (item.lastModifiedDateTime)
              metaParts.push(formatShortDate(item.lastModifiedDateTime));

            return (
              <div
                ref={(el) => { itemRefs.current[idx] = el; }}
                key={item.href + item.label}
                onClick={() => handleSelect(item.href)}
                className={`gsearch-row ${isActive ? 'gsearch-row--active' : ''}`}
              >
                <ResultIcon item={item} />

                <div className="gsearch-row__content">
                  <p className="gsearch-row__title">
                    {highlightText(item.label, query)}
                  </p>

                  {item.pathSegments && item.pathSegments.length > 0 ? (
                    <div className="gsearch-row__path">
                      {item.pathSegments.map((segment, segIndex) => (
                        <span key={segIndex} className="gsearch-row__path-segment">
                          {segIndex > 0 && <ChevronRight className="h-3 w-3 shrink-0" />}
                          {segment}
                        </span>
                      ))}
                    </div>
                  ) : (
                    (item.kind === 'file' || item.kind === 'area') && (
                      <p className="gsearch-row__path">
                        {highlightText(item.description, query)}
                      </p>
                    )
                  )}

                  {(item.kind === 'folder' || item.kind === 'library') && (
                    <p className="gsearch-row__meta">{item.description}</p>
                  )}

                  {metaParts.length > 0 && (
                    <p className="gsearch-row__meta">{metaParts.join(' · ')}</p>
                  )}
                </div>

                <ChevronRight className="gsearch-row__arrow h-4 w-4" />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}