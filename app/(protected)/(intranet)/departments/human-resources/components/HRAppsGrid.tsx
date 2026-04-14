/**
 * @module HRAppsGrid
 * Wrapper especializado de {@link AppsGrid} para el módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente mantiene una API pública compatible con implementaciones previas,
 * evitando romper imports existentes, mientras delega la lógica visual y estructural
 * al componente genérico {@link AppsGrid}.
 *
 * Responsabilidades principales:
 * - Adaptar elementos de tipo {@link HRAppItem} al formato {@link AppItem}
 * - Reenviar props opcionales relacionadas con favoritos
 * - Mantener el contrato del callback `onToggleFavorite`
 */

"use client";

/**
 * HRAppsGrid — wrapper de AppsGrid para el módulo de Recursos Humanos.
 *
 * @remarks
 * Mantiene la misma API pública que antes para no romper ningún import existente,
 * pero delega toda la lógica y UI al componente genérico AppsGrid.
 */

import { Users } from "lucide-react";
import {
  AppsGrid,
  type AppItem,
  type AppsGridProps,
  type AppColor,
} from "@/app/components/ui/AppsGrid";
import type { HRAppItem } from "@/types/hr.types";

// ─── Adaptador de tipos ───────────────────────────────────────────────────────

/**
 * Convierte un elemento de tipo {@link HRAppItem} en un {@link AppItem}.
 *
 * @param item Aplicación del módulo de RRHH.
 * @returns Objeto adaptado al formato consumido por {@link AppsGrid}.
 *
 * @remarks
 * Este adaptador:
 * - Usa `href` como fallback de `id` cuando no existe identificador explícito
 * - Mapea únicamente propiedades compatibles con `AppItem`
 * - Evita pasar valores `undefined` en propiedades opcionales
 *
 * La omisión explícita de campos indefinidos es importante para compatibilidad con
 * configuraciones estrictas como `exactOptionalPropertyTypes`.
 */
function toAppItem(item: HRAppItem): AppItem {
  const base: AppItem = {
    id: item.id ?? item.href,
    label: item.label,
    href: item.href,
    icon: item.icon,
  };

  // ✅ asignar solo si el valor existe, nunca pasar undefined
  if (item.color !== undefined) base.color = item.color as AppColor;
  if (item.description !== undefined) base.description = item.description;

  return base;
}

// ─── Props ────────────────────────────────────────────────────────────────────

/**
 * Props del componente {@link HRAppsGrid}.
 *
 * @property apps Lista de aplicaciones del módulo de RRHH.
 * @property title Título opcional de la sección.
 * @property favoriteHrefs Lista opcional de hrefs marcados como favoritos.
 * @property onToggleFavorite Callback opcional para alternar el estado de favorito.
 *
 * @remarks
 * Aunque el componente delega el render a {@link AppsGrid}, mantiene una firma
 * específica para trabajar con elementos del tipo {@link HRAppItem}.
 */
interface HRAppsGridProps {
  apps: HRAppItem[];
  title?: string;
  favoriteHrefs?: AppsGridProps["favoriteHrefs"];
  onToggleFavorite?: (item: HRAppItem) => void;
}

// ─── Componente ───────────────────────────────────────────────────────────────

/**
 * Grid de aplicaciones para el módulo de Recursos Humanos.
 *
 * @param props Propiedades del componente.
 * @returns Instancia configurada de {@link AppsGrid} con branding y adaptación de datos.
 *
 * @remarks
 * Funcionalidades principales:
 * - Convierte la colección `apps` a `AppItem[]`
 * - Define el ícono de cabecera del módulo (`Users`)
 * - Reexpone el callback de favoritos usando el tipo original {@link HRAppItem}
 * - Reenvía props opcionales solo cuando existen
 *
 * El callback `onToggleFavorite` recibe el objeto original de RRHH,
 * no la versión adaptada, para respetar el contrato esperado por el padre.
 *
 * @example
 * ```tsx
 * <HRAppsGrid
 *   apps={hrApps}
 *   favoriteHrefs={favoriteHrefs}
 *   onToggleFavorite={(app) => console.log(app.label)}
 * />
 * ```
 */
export function HRAppsGrid({
  apps,
  title = "Aplicaciones de Recursos Humanos",
  favoriteHrefs,
  onToggleFavorite,
}: HRAppsGridProps) {
  const appItems = apps.map(toAppItem);

  /**
   * Maneja el cambio de favorito desde el grid genérico.
   *
   * @param item Aplicación adaptada proveniente de {@link AppsGrid}.
   *
   * @remarks
   * Busca el elemento original dentro de `apps` para reenviarlo
   * al callback externo con su tipo original {@link HRAppItem}.
   */
  function handleToggle(item: AppItem) {
    const original = apps.find((a) => a.href === item.href);
    if (original) onToggleFavorite?.(original);
  }

  return (
    <AppsGrid
      apps={appItems}
      title={title}
      headerIcon={Users}
      headerIconBg="bg-teal-50"
      headerIconColor="text-teal-600"
      {...(favoriteHrefs !== undefined && { favoriteHrefs })}
      {...(onToggleFavorite ? { onToggleFavorite: handleToggle } : {})}
    />
  );
}