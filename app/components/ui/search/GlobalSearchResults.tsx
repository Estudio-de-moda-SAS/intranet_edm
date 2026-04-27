/**
 * @module GlobalSearchResults
 * Componente cliente para mostrar los resultados de la búsqueda global.
 *
 * @remarks
 * Este archivo renderiza un panel desplegable con resultados agrupados
 * por categoría, navegación por teclado y resaltado del texto buscado.
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Representa un resultado individual de búsqueda.
 *
 * @remarks
 * Esta estructura es la esperada por el componente para agrupar,
 * mostrar y navegar entre resultados.
 */
interface SearchResultItem {
  /**
   * Texto principal mostrado en el resultado.
   */
  label: string;

  /**
   * Descripción secundaria del resultado.
   */
  description: string;

  /**
   * Ruta de navegación del resultado.
   */
  href: string;

  /**
   * Categoría usada para agrupar visualmente los resultados.
   */
  category?: string;
}

/**
 * Props del componente {@link GlobalSearchResults}.
 */
interface Props {
  /**
   * Lista de resultados a mostrar.
   */
  results: SearchResultItem[];

  /**
   * Texto actual de búsqueda.
   */
  query: string;

  /**
   * Callback opcional ejecutado al seleccionar un resultado.
   */
  onSelect?: () => void;
}

/**
 * Renderiza el panel de resultados de búsqueda global.
 *
 * @param props Propiedades del componente.
 * @param props.results Resultados encontrados.
 * @param props.query Texto actual de búsqueda.
 * @param props.onSelect Callback opcional al seleccionar un resultado.
 * @returns Panel desplegable animado con resultados agrupados.
 *
 * @remarks
 * Flujo general:
 * 1. Agrupa resultados por categoría.
 * 2. Genera una lista plana para navegación por teclado.
 * 3. Permite moverse con flechas arriba/abajo.
 * 4. Permite seleccionar con Enter.
 * 5. Hace scroll automático al resultado activo.
 * 6. Resalta coincidencias del texto buscado.
 */
export default function GlobalSearchResults({ results, query, onSelect }: Props) {
  /**
   * Router de Next.js para navegación programática.
   */
  const router = useRouter();

  /**
   * Índice del resultado actualmente activo.
   */
  const [activeIndex, setActiveIndex] = useState(0);

  /**
   * Referencias a cada fila renderizada para controlar el scroll.
   */
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  /**
   * Resultados agrupados por categoría.
   */
  const groupedResults = useMemo(() => {
    const grouped: Record<string, SearchResultItem[]> = {};

    results.forEach((item) => {
      const category = item.category || 'Otros';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    return grouped;
  }, [results]);

  /**
   * Lista plana de resultados para navegación lineal con teclado.
   */
  const flatResults = useMemo(
    () => Object.values(groupedResults).flat(),
    [groupedResults]
  );

  /**
   * Controla la navegación por teclado.
   *
   * @remarks
   * Soporta:
   * - ArrowDown
   * - ArrowUp
   * - Enter
   */
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
          router.push(selected.href);
          onSelect?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatResults, activeIndex, router, onSelect]);

  /**
   * Hace scroll automático al resultado activo.
   */
  useEffect(() => {
    itemRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest',
      behavior: 'smooth',
    });
  }, [activeIndex]);

  /**
   * Resalta coincidencias del query dentro de un texto.
   *
   * @param text Texto original.
   * @param query Texto a resaltar.
   * @returns Fragmentos de texto con coincidencias resaltadas.
   */
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

  /**
   * Índice global usado para mantener la correspondencia entre grupos y lista plana.
   */
  let globalIndex = -1;

  return (
    <AnimatePresence>
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="absolute top-full mt-2 left-0 w-full z-[999]"
        >
          <div className="rounded-2xl overflow-hidden max-h-80 overflow-y-auto
                          border shadow-2xl ring-1
                          bg-white/90 backdrop-blur-xl border-slate-200 ring-black/5
                          dark:bg-[#161b22]/95 dark:border-[#30363d] dark:ring-white/5 dark:shadow-black/50">

            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category}>
                {/* Encabezado de categoría */}
                <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider
                                text-slate-400 dark:text-[#545d68]">
                  {category}
                </div>

                {items.map((app) => {
                  globalIndex++;
                  const isActive = activeIndex === globalIndex;
                  const idx = globalIndex;

                  return (
                    <motion.div
                      ref={(el) => { itemRefs.current[idx] = el; }}
                      key={app.href}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => {
                        router.push(app.href);
                        onSelect?.();
                      }}
                      className={`relative group px-4 py-3 cursor-pointer transition-all duration-150
                                  border-b last:border-none overflow-hidden
                                  border-slate-100 dark:border-[#21262d]
                                  ${
                                    isActive
                                      ? 'bg-violet-50 dark:bg-violet-500/[0.08]'
                                      : 'hover:bg-violet-50/70 dark:hover:bg-violet-500/[0.06]'
                                  }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`text-sm font-semibold transition-colors ${
                              isActive
                                ? 'text-violet-700 dark:text-violet-400'
                                : 'text-slate-800 group-hover:text-violet-700 dark:text-[#cdd9e5] dark:group-hover:text-violet-400'
                            }`}
                          >
                            {highlightText(app.label, query)}
                          </p>

                          <p className="text-xs transition-colors
                                        text-slate-400 group-hover:text-slate-500
                                        dark:text-[#545d68] dark:group-hover:text-[#768390]">
                            {highlightText(app.description, query)}
                          </p>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all
                                        text-violet-500 dark:text-violet-400">
                          →
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}