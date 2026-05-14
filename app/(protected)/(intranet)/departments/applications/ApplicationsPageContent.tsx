"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { AppsGrid } from "@/app/components/ui/AppsGrid";

import {
  COMPANY_APPS,
  type AppCategory,
} from "./config/applications.config";

const CATEGORIES: Array<AppCategory | "Todas"> = [
  "Todas",
  "RRHH",
  "TI",
  "Administrativo",
  "Operaciones",
  "Corporativo",
];

export function ApplicationsPageContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AppCategory | "Todas">("Todas");

  const filteredApps = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return COMPANY_APPS.filter((app) => {
      const matchesSearch =
        app.label.toLowerCase().includes(normalizedSearch) ||
        app.description?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "Todas" || app.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  return (
    <main className="space-y-6">
      <DepartmentHeroBanner
        title="Aplicaciones Corporativas"
        subtitle="Encuentra y accede rápidamente a las plataformas internas utilizadas por los equipos de la compañía."
        gradientFrom="from-slate-950"
        gradientVia="via-indigo-900"
        gradientTo="to-violet-700"
        dotPatternId="applications-dot-pattern"
        pills={[
          {
            type: "status",
            text: `${COMPANY_APPS.length} aplicaciones activas`,
          },
          {
            type: "info",
            text: "Hub corporativo",
          },
          {
            type: "info",
            text: "Acceso rápido",
          },
        ]}
      />

      <section className="px-6 pb-12 pt-10 lg:px-14">
        <div className="mx-auto max-w-7xl space-y-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Centro de aplicaciones
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Busca por nombre, descripción o filtra por área para encontrar la herramienta que necesitas.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar aplicación..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 sm:w-72"
                  />
                </div>

                <div className="relative">
                  <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={category}
                    onChange={(event) =>
                      setCategory(event.target.value as AppCategory | "Todas")
                    }
                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-8 text-sm text-slate-700 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100 sm:w-52"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {CATEGORIES.map((item) => {
                const active = category === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`
                      rounded-full border px-3 py-1 text-xs font-medium transition
                      ${
                        active
                          ? "border-violet-300 bg-violet-50 text-violet-700"
                          : "border-slate-200 bg-white text-slate-500 hover:border-violet-200 hover:text-violet-600"
                      }
                    `}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </div>

          {filteredApps.length > 0 ? (
            <AppsGrid
              apps={filteredApps}
              title="Aplicaciones corporativas"
              cols={3}
              variant="launcher"
              headerIconBg="bg-violet-50"
              headerIconColor="text-violet-600"
            />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center shadow-sm">
              <h3 className="text-sm font-semibold text-slate-800">
                No se encontraron aplicaciones
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Intenta ajustar la búsqueda o seleccionar otra categoría.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}