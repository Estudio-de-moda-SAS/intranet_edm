"use client";

import { useMemo, useState } from "react";

import { ApplicationsGrid } from "./components/ApplicationsGrid";
import { AppPreviewModal } from "@/app/components/ui/AppPreviewModal";
import type { AppItem } from "@/app/components/ui/AppsGrid";

import { useAppSession } from "@/lib/useAppSession";
import { useFrequentApps } from "./hooks/useFrequentApps";
 
import {
  COMPANY_APPS,
  type AppCategory,
} from "./config/applications.config";

type AppFilter = AppCategory | "Todas" | "Mis frecuentes";

const FILTERS: AppFilter[] = ["Todas", "Mis frecuentes"];
// Agrega las categorías de aplicaciones definidas en COMPANY_APPS al arreglo de filtros
export function ApplicationsPageContent() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<AppFilter>("Todas");
  const [previewApp, setPreviewApp] = useState<AppItem | null>(null);

  const { user } = useAppSession();
  const userKey = user?.email ?? user?.id ?? null;

  const { isFrequent, toggleFrequent } = useFrequentApps({ userKey });

  const filteredApps = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return COMPANY_APPS.filter((app) => {
      const matchesSearch =
        app.label.toLowerCase().includes(normalizedSearch) ||
        app.description?.toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        category === "Todas" ||
        app.category === category ||
        (category === "Mis frecuentes" && isFrequent(app.id));

      return matchesSearch && matchesCategory;
    });
  }, [search, category, isFrequent]);

  return (
    <main className="space-y-6">
      <section className="px-6 pb-12 pt-10 lg:px-14">
        <div className="mx-auto max-w-7xl">
          <ApplicationsGrid
            apps={filteredApps}
            filters={FILTERS}
            activeFilter={category}
            onFilterChange={setCategory}
            search={search}
            onSearchChange={setSearch}
            isFrequentApp={isFrequent}
            onToggleFrequentApp={toggleFrequent}
            onPreviewClick={setPreviewApp}
          />
        </div>
      </section>

      <AppPreviewModal
        open={previewApp !== null}
        onClose={() => setPreviewApp(null)}
        title={previewApp?.label ?? ""}
        url={previewApp?.embedUrl ?? previewApp?.href ?? ""}
      />
    </main>
  );
}