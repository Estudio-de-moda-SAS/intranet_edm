'use client';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  results: any[];
  query: string;
  onSelect?: () => void;
};

export default function GlobalSearchResults({ results, query, onSelect }: Props) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // AGRUPAR RESULTADOS POR CATEGORY
  const groupedResults = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    results.forEach((item) => {
      const category = item.category || 'Otros';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });

    return grouped;
  }, [results]);

  // FLATTEN para que el teclado siga funcionando
  const flatResults = useMemo(() => {
    return Object.values(groupedResults).flat();
  }, [groupedResults]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!flatResults.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % flatResults.length);
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + flatResults.length) % flatResults.length);
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

  useEffect(() => {
    const el = itemRefs.current[activeIndex];
    if (el) {
      el.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="text-violet-700 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  let globalIndex = -1; // índice global para teclado

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
          <div className="bg-white/80 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl ring-1 ring-black/5 max-h-80 overflow-y-auto">

            {Object.entries(groupedResults).map(([category, items]) => (
              <div key={category}>

                {/* 🔹 HEADER */}
                <div className="px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {category}
                </div>

                {/* 🔹 ITEMS */}
                {items.map((app: any) => {
                  globalIndex++;

                  return (
                    <motion.div
                      ref={(el) => { itemRefs.current[globalIndex] = el; }}
                      key={app.href}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: globalIndex * 0.03 }}
                      onClick={() => {
                        router.push(app.href);
                        onSelect?.();
                      }}
                      className={`relative group px-4 py-3 cursor-pointer transition-all duration-200 border-b last:border-none border-slate-100 overflow-hidden ${
                        activeIndex === globalIndex ? 'bg-violet-50' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-violet-50 opacity-0 group-hover:opacity-100 transition duration-200 -z-10" />

                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-sm font-semibold ${
                            activeIndex === globalIndex
                              ? 'text-violet-700'
                              : 'text-slate-800 group-hover:text-violet-700'
                          }`}>
                            {highlightText(app.label, query)}
                          </p>

                          <p className="text-xs text-slate-400 group-hover:text-slate-500">
                            {highlightText(app.description, query)}
                          </p>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all text-violet-500">
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