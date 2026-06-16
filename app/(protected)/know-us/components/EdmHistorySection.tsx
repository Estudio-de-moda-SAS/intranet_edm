/**
 * @module CompanyHistorySection
 * Sección interactiva de historia corporativa de la compañía.
 */

"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Grab, ImageIcon } from "lucide-react";
import { companyHistory } from "../config/edmHistory";

export function CompanyHistorySection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const selectedItem = companyHistory[selectedIndex] ?? companyHistory[0];
  const hasHistoryItems = companyHistory.length > 0;

  const progressPercentage = useMemo(() => {
    if (companyHistory.length <= 1) return 0;
    return (selectedIndex / (companyHistory.length - 1)) * 100;
  }, [selectedIndex]);

  const scrollTimeline = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -360 : 360,
      behavior: "smooth",
    });
  };

  if (!hasHistoryItems || !selectedItem) return null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-[#30363d] dark:bg-gray-900">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 dark:border-[#21262d]">
        <div className="flex items-center gap-3">
          <span className="h-[6px] w-[6px] rounded-full bg-violet-600" />
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Nuestra historia
          </p>
        </div>

        <span className="hidden rounded-full bg-violet-50 px-3 py-1 text-[11px] font-medium text-violet-600 dark:bg-violet-500/[0.12] dark:text-violet-300 sm:inline-flex">
          Explora la evolución de EDM
        </span>
      </div>

      <div className="px-6 py-7">
        <div className="relative">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="hidden items-center gap-2 text-[11px] font-medium text-slate-400 sm:flex">
              <Grab className="h-3.5 w-3.5 text-violet-400" />
              Navega por la línea de tiempo
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollTimeline("left")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-600 transition-all hover:-translate-x-0.5 hover:bg-violet-100"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => scrollTimeline("right")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-600 transition-all hover:translate-x-0.5 hover:bg-violet-100"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-0 left-0 top-11 z-20 w-10 bg-gradient-to-r from-white to-transparent dark:from-gray-900" />
          <div className="pointer-events-none absolute bottom-0 right-0 top-11 z-20 w-10 bg-gradient-to-l from-white to-transparent dark:from-gray-900" />

          <div ref={scrollRef} className="scrollbar-none relative overflow-x-auto pb-3">
            <div className="relative min-w-[1360px] px-8 py-8">
              <div className="absolute left-14 right-14 top-[132px] h-[2px] rounded-full bg-slate-200 dark:bg-[#30363d]" />

              <motion.div
                className="absolute left-14 top-[132px] h-[2px] rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500"
                initial={{ width: 0 }}
                animate={{
                  width: `calc((100% - 7rem) * ${progressPercentage / 100})`,
                }}
                transition={{ duration: 0.45, ease: "easeOut" }}
              />

              <div
                className="relative grid"
                style={{
                  gridTemplateColumns: `repeat(${companyHistory.length}, minmax(0, 1fr))`,
                }}
              >
                {companyHistory.map((item, index) => {
                  const isActive = index === selectedIndex;
                  const isCompleted = index <= selectedIndex;
                  const isTop = index % 2 === 0;

                  const yearClasses = `
                    text-[24px] font-extrabold leading-none tracking-tight transition-colors
                    ${isActive ? "text-violet-700" : "text-slate-400 group-hover:text-violet-600"}
                  `;

                  const titleClasses = `
                    mt-2 max-w-[130px] text-[11px] font-semibold leading-snug transition-colors
                    ${
                      isActive
                        ? "text-slate-900 dark:text-slate-100"
                        : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                    }
                  `;

                  return (
                    <button
                      key={item.year}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className="group relative flex h-[250px] flex-col items-center text-center outline-none"
                      aria-pressed={isActive}
                    >
                      {isTop ? (
                        <div className="flex h-[92px] flex-col items-center justify-end pb-4">
                          <span className={yearClasses}>{item.year}</span>
                          <span className={titleClasses}>{item.title}</span>
                        </div>
                      ) : (
                        <div className="h-[92px]" />
                      )}

                      {isTop ? (
                        <span className={`h-8 w-px ${isActive || isCompleted ? "bg-violet-300" : "bg-slate-300"}`} />
                      ) : (
                        <span className="h-8 w-px opacity-0" />
                      )}

                      <motion.span
                        whileHover={{ scale: 1.12 }}
                        whileTap={{ scale: 0.96 }}
                        className={`
                          relative z-10 flex h-8 w-8 items-center justify-center rounded-full border transition-all duration-300
                          ${
                            isActive
                              ? "border-violet-200 bg-white text-violet-700 shadow-[0_0_0_7px_rgba(139,92,246,0.12)]"
                              : isCompleted
                                ? "border-violet-200 bg-white text-violet-600"
                                : "border-slate-200 bg-white text-slate-400 group-hover:border-violet-200"
                          }
                        `}
                      >
                        <span
                          className={`h-3.5 w-3.5 rounded-full ${
                            isActive ? "bg-violet-700" : isCompleted ? "bg-violet-500" : "bg-slate-400"
                          }`}
                        />

                        {isActive && (
                          <motion.span
                            layoutId="active-history-ring"
                            className="absolute inset-[-7px] rounded-full border border-violet-300"
                          />
                        )}
                      </motion.span>

                      {!isTop ? (
                        <span className={`h-8 w-px ${isActive || isCompleted ? "bg-violet-300" : "bg-slate-300"}`} />
                      ) : (
                        <span className="h-8 w-px opacity-0" />
                      )}

                      {!isTop ? (
                        <div className="flex h-[92px] flex-col items-center justify-start pt-4">
                          <span className={yearClasses}>{item.year}</span>
                          <span className={titleClasses}>{item.title}</span>
                        </div>
                      ) : (
                        <div className="h-[92px]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-2 flex justify-center">
            <div className="h-1 w-24 rounded-full bg-violet-100">
              <motion.div
                className="h-full rounded-full bg-violet-500"
                initial={{ width: "0%" }}
                animate={{ width: `${Math.max(12, progressPercentage)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-white p-6 dark:border-violet-500/20 dark:from-violet-500/[0.10] dark:via-gray-900 dark:to-gray-900">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedItem.year}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="grid gap-6 md:grid-cols-[300px_1fr]"
            >
              <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden rounded-2xl border border-violet-200 bg-white p-6 dark:border-violet-500/20 dark:bg-[#161b22]">
                {selectedItem.image ? (
                  <>
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.title}
                      className="h-full max-h-[190px] w-full object-contain"
                    />

                    <div className="absolute bottom-4 left-4">
                      <span className="rounded-xl bg-violet-50 px-3 py-1 text-lg font-bold text-violet-700 shadow-sm">
                        {selectedItem.year}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <p className="text-[46px] font-extrabold leading-none text-violet-700">
                      {selectedItem.year}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-violet-400">
                      Hito EDM
                    </p>

                    <div className="mx-auto mt-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-violet-100 bg-violet-50 text-violet-300">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col justify-center">
                <span className="mb-3 inline-flex w-fit items-center gap-1 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold text-violet-700">
                  {selectedItem.year}
                  <ChevronRight className="h-3 w-3" />
                  Historia corporativa
                </span>

                <h3 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  {selectedItem.title}
                </h3>

                <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                  {selectedItem.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}