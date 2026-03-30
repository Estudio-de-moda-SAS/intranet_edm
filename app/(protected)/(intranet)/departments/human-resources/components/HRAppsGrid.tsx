"use client";

/**
 * HRAppsGrid — wrapper de AppsGrid para el módulo de Recursos Humanos.
 *
 * Mantiene la misma API pública que antes para no romper ningún import existente,
 * pero delega toda la lógica y UI al componente genérico AppsGrid.
 */

import { Users } from "lucide-react";
import { AppsGrid, type AppItem, type AppsGridProps, type AppColor } from "@/app/components/ui/AppsGrid";
import type { HRAppItem } from "@/types/hr.types";


// ─── Adaptador de tipos ───────────────────────────────────────────────────────
// HRAppItem puede tener campos propios; los mapeamos a AppItem.

function toAppItem(item: HRAppItem): AppItem {
  const base: AppItem = {
    id:    item.id ?? item.href,
    label: item.label,
    href:  item.href,
    icon:  item.icon,
  };

  // ✅ asignar solo si el valor existe, nunca pasar undefined
  if (item.color !== undefined)       base.color       = item.color as AppColor;
  if (item.description !== undefined) base.description = item.description;

  return base;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HRAppsGridProps {
  apps: HRAppItem[];
  title?: string;
  // Heredamos las props de favoritos para poder pasarlas desde el padre
  favoriteHrefs?: AppsGridProps["favoriteHrefs"];
  onToggleFavorite?: (item: HRAppItem) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function HRAppsGrid({
  apps,
  title = "Aplicaciones de Recursos Humanos",
  favoriteHrefs,
  onToggleFavorite,
}: HRAppsGridProps) {
  const appItems = apps.map(toAppItem);

  function handleToggle(item: AppItem) {
    // Recuperamos el HRAppItem original para respetar la firma del callback
    const original = apps.find(a => a.href === item.href);
    if (original) onToggleFavorite?.(original);
  }

  return (
    <AppsGrid
      apps={appItems}
      title={title}
      headerIcon={Users}
      headerIconBg="bg-teal-50"
      headerIconColor="text-teal-600"
      // ✅ solo pasar props opcionales si tienen valor (exactOptionalPropertyTypes)
      {...(favoriteHrefs !== undefined && { favoriteHrefs })}
      {...(onToggleFavorite ? { onToggleFavorite: handleToggle } : {})}
    />
  );
}