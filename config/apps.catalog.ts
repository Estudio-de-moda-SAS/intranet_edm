/**
 * @module config/apps.catalog
 * Fuente única de verdad para el catálogo de aplicaciones de la
 * intranet EDM, usado por el modal de favoritos y el selector de apps.
 *
 * @remarks
 * Consolida todos los quick links y apps de cada departamento en un
 * único array {@link APP_CATALOG}, deduplicado por `href`. El catálogo
 * es la fuente que alimenta el modal de favoritos, permitiendo al
 * colaborador personalizar sus accesos rápidos desde cualquier
 * departamento.
 *
 * **Flujo de construcción del catálogo:**
 * 1. Cada departamento exporta sus links desde su carpeta `config/`.
 * 2. {@link toCatalog} normaliza cada array al tipo {@link CatalogApp},
 *    resolviendo íconos, colores y permisos.
 * 3. Los arrays normalizados se concatenan en `RAW` y se deduplican
 *    globalmente por `href` para producir {@link APP_CATALOG}.
 *
 * **Control de acceso:**
 * Las apps con `requiredPermission` solo aparecen en el catálogo si el
 * colaborador tiene ese permiso, evaluado mediante {@link filterCatalogByAccess}.
 * Las apps sin `requiredPermission` son visibles para todos.
 */

import { hrApps }             from "@/app/(protected)/(intranet)/departments/human-resources/config/hrApps";
import { hrQuickLinks }       from "@/app/(protected)/(intranet)/departments/human-resources/config/hrQuickLinks";
import { itQuickLinks }       from "@/app/(protected)/(intranet)/departments/it/config/itQuickLinks";
import { adminQuickLinks }    from "@/app/(protected)/(intranet)/departments/administrative-services/config/adminQuickLinks";
import { documentQuickLinks } from "@/app/(protected)/(intranet)/departments/documents/config/documentQuickLinks";
import { financeQuickLinks }  from "@/app/(protected)/(intranet)/departments/finance/config/financeQuickLinks";
import { legalQuickLinks }    from "@/app/(protected)/(intranet)/departments/legal/config/legalQuickLinks";
import { retailQuickLinks }   from "@/app/(protected)/(intranet)/departments/retail/config/retailQuickLinks";
import { can, type AccessLevel, type Permission } from "@/lib/roles";
import {
  Users, UserPlus, CalendarDays, DollarSign, GraduationCap,
  Award, FileText, Settings, LayoutDashboard, BarChart2,
  BookOpen, Wrench, MessageSquare, Globe, Bell, Briefcase,
  ClipboardList, CreditCard, HeadphonesIcon, PieChart,
  ShieldCheck, Zap, Clock, BarChart3, HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ── Tipos ─────────────────────────────────────────────────────────────────────

/**
 * Identificador del departamento al que pertenece una app del catálogo.
 *
 * | Valor                    | Departamento              |
 * |--------------------------|---------------------------|
 * | `hr`                     | Recursos Humanos          |
 * | `it`                     | Tecnología                |
 * | `finance`                | Finanzas                  |
 * | `administrative-services`| Servicios Administrativos |
 * | `legal`                  | Jurídica                  |
 * | `logistics`              | Logística                 |
 * | `retail`                 | Retail                    |
 * | `documents`              | Documentos                |
 */
export type AppDepartment =
  | "hr"
  | "it"
  | "finance"
  | "administrative-services"
  | "legal"
  | "logistics"
  | "retail"
  | "documents";

/**
 * Aplicación o acceso rápido normalizado en el catálogo de la intranet.
 *
 * @remarks
 * Representa una entrada del {@link APP_CATALOG} lista para renderizar
 * en el modal de favoritos. Los campos `iconKey` y `defaultColor` son
 * strings resueltos en tiempo de build a partir de los componentes
 * de Lucide React y los nombres de color de Tailwind — esto permite
 * serializar y comparar apps sin referencias a funciones o componentes.
 */
export type CatalogApp = {
  /** Ruta interna de la app, usada como identificador único en el catálogo. */
  href: string;

  /** Etiqueta visible de la app en el modal de favoritos. */
  label: string;

  /** Descripción corta de la funcionalidad de la app. */
  description: string;

  /**
   * Nombre del ícono de Lucide React en formato string
   * (ej. `"Users"`, `"FileText"`).
   * Resuelto desde el componente de ícono mediante {@link ICON_TO_KEY}.
   */
  iconKey: string;

  /**
   * Nombre del color en formato string (ej. `"purple"`, `"teal"`).
* Corresponde a los valores de `AppColor` en `types/hr-apps.ts`.   */
  color: string;

  /**
   * Clase CSS de Tailwind con el color de fondo resuelto
   * (ej. `"bg-[#7F77DD]"`).
   * Generado por {@link toBg} a partir de `color`.
   */
  defaultColor: string;

  /** Departamento al que pertenece la app. */
  department: AppDepartment;

  /**
   * Origen de la entrada en el catálogo.
   * - `"app"` — proviene de la configuración de apps del departamento.
   * - `"quicklink"` — proviene de los quick links del departamento.
   * `undefined` si el origen no está especificado.
   */
  source?: "app" | "quicklink";

  /**
   * Permiso requerido para que la app sea visible en el catálogo.
   * Si no está definido, la app es visible para todos los colaboradores.
   * Si está definido, se evalúa mediante {@link can} en
   * {@link filterCatalogByAccess}.
   */
  requiredPermission?: Permission;
};

// ── Mapa de colores ───────────────────────────────────────────────────────────

/**
 * Mapa de nombres de color a clases CSS de Tailwind con color de fondo.
 *
 * @remarks
 * Usado por {@link toBg} para resolver el `defaultColor` de cada app.
 * Las clases usan valores hex arbitrarios con la sintaxis `bg-[#...]`
 * de Tailwind para mantener consistencia con la paleta corporativa de EDM.
 */
export const COLOR_TO_BG: Record<string, string> = {
  purple: "bg-[#7F77DD]",
  teal:   "bg-[#1D9E75]",
  blue:   "bg-[#378ADD]",
  amber:  "bg-[#BA7517]",
  pink:   "bg-[#D4537E]",
  green:  "bg-[#639922]",
  coral:  "bg-[#D85A30]",
  indigo: "bg-[#4F6BED]",
  rose:   "bg-[#E11D48]",
  slate:  "bg-[#94A3B8]",
};

/**
 * Resuelve el nombre de un color a su clase CSS de fondo de Tailwind.
 *
 * @param color - Nombre del color (ej. `"purple"`, `"teal"`).
 *   Si no está en {@link COLOR_TO_BG}, retorna el color por defecto `purple`.
 * @returns Clase CSS de Tailwind (ej. `"bg-[#7F77DD]"`).
 */
export function toBg(color = "purple"): string {
  return COLOR_TO_BG[color] ?? "bg-[#7F77DD]";
}

// ── Mapa de íconos ────────────────────────────────────────────────────────────

/**
 * Mapa de componentes de Lucide React a sus nombres en string.
 *
 * @remarks
 * Permite serializar las referencias a componentes de ícono en strings
 * para que {@link CatalogApp.iconKey} sea un valor primitivo comparable
 * y serializable. El componente de UI resuelve el ícono concreto a
 * partir del `iconKey` en tiempo de renderizado.
 *
 * Algunos íconos comparten el mismo `iconKey` por compatibilidad:
 * - `BarChart3` → `"BarChart2"` (mismo visual, distinto componente)
 * - `HeartHandshake` → `"Users"` (fallback semántico)
 * - `Clock` → `"Calendar"` (fallback semántico)
 */
export const ICON_TO_KEY = new Map<LucideIcon, string>([
  [Users,           "Users"],
  [UserPlus,        "UserPlus"],
  [CalendarDays,    "CalendarDays"],
  [DollarSign,      "DollarSign"],
  [GraduationCap,   "GraduationCap"],
  [Award,           "Award"],
  [FileText,        "FileText"],
  [Settings,        "Settings"],
  [LayoutDashboard, "LayoutDashboard"],
  [BarChart2,       "BarChart2"],
  [BarChart3,       "BarChart2"],
  [BookOpen,        "BookOpen"],
  [Wrench,          "Wrench"],
  [MessageSquare,   "MessageSquare"],
  [Globe,           "Globe"],
  [Bell,            "Bell"],
  [Briefcase,       "Briefcase"],
  [ClipboardList,   "ClipboardList"],
  [CreditCard,      "CreditCard"],
  [HeadphonesIcon,  "HeadphonesIcon"],
  [PieChart,        "PieChart"],
  [ShieldCheck,     "ShieldCheck"],
  [Zap,             "Zap"],
  [Clock,           "Calendar"],
  [HeartHandshake,  "Users"],
]);

/**
 * Resuelve un componente de ícono de Lucide React o un string a su
 * `iconKey` correspondiente.
 *
 * @remarks
 * Acepta tanto componentes de Lucide React (funciones) como strings
 * directos para compatibilidad con las distintas formas en que los
 * departamentos definen sus íconos. Si el componente no está en
 * {@link ICON_TO_KEY}, retorna `"LayoutDashboard"` como fallback.
 *
 * @param icon - Componente de Lucide React, string con nombre del ícono,
 *   o cualquier otro valor (retorna fallback).
 * @returns Nombre del ícono en string listo para usar como `iconKey`.
 */
export function iconToKey(icon: unknown): string {
  if (typeof icon === "string") return icon;
  if (typeof icon === "function") {
    return ICON_TO_KEY.get(icon as LucideIcon) ?? "LayoutDashboard";
  }
  return "LayoutDashboard";
}

// ── Tipos internos ────────────────────────────────────────────────────────────

/**
 * Forma mínima de una app o quick link cruda antes de normalizar
 * al tipo {@link CatalogApp}.
 *
 * @remarks
 * Acepta tanto `label` como `title` para compatibilidad con las
 * distintas convenciones de nomenclatura entre departamentos.
 */
export type RawApp = {
  /** Ruta de destino de la app. */
  href: string;

  /** Etiqueta de la app (alternativa a `title`). */
  label?: string;

  /** Título de la app (alternativa a `label`). */
  title?: string;

  /** Descripción de la funcionalidad. */
  description?: string;

  /** Componente de ícono de Lucide React o string con el nombre del ícono. */
  icon?: unknown;

  /** Nombre del color de la app. */
  color?: string;

  /** Permiso requerido para ver la app, propagado desde `QuickLinkConfig`. */
  requiredPermission?: Permission;
};

// ── Convertidor ───────────────────────────────────────────────────────────────

/**
 * Normaliza un array de apps o quick links crudos al tipo
 * {@link CatalogApp}, deduplicando por `href` dentro del mismo array.
 *
 * @remarks
 * La deduplicación interna previene duplicados dentro de un mismo
 * departamento. La deduplicación global entre departamentos se aplica
 * posteriormente al consolidar {@link APP_CATALOG}.
 *
 * Los campos `source` y `requiredPermission` solo se asignan cuando
 * tienen valor — nunca se pasa `undefined` explícito para mantener
 * objetos limpios y comparables.
 *
 * @param apps       - Array de apps o quick links crudos a normalizar.
 * @param department - Departamento al que pertenecen las apps.
 * @param source     - Origen de las apps (`"app"` o `"quicklink"`).
 * @returns Array de {@link CatalogApp} normalizado y deduplicado.
 */
export function toCatalog(
  apps:       RawApp[],
  department: AppDepartment,
  source:     CatalogApp["source"],
): CatalogApp[] {
  const seen = new Set<string>();
  return apps
    .filter((a) => {
      if (seen.has(a.href)) return false;
      seen.add(a.href);
      return true;
    })
    .map((a) => {
      const entry: CatalogApp = {
        href:         a.href,
        label:        a.label ?? a.title ?? "",
        description:  a.description ?? "",
        iconKey:      iconToKey(a.icon),
        color:        a.color ?? "purple",
        defaultColor: toBg(a.color),
        department,
      };

      if (source               !== undefined) entry.source             = source;
      if (a.requiredPermission !== undefined) entry.requiredPermission = a.requiredPermission;

      return entry;
    });
}

// ── Catálogo consolidado ──────────────────────────────────────────────────────

/**
 * Catálogo completo de aplicaciones de la intranet EDM, deduplicado
 * globalmente por `href`.
 *
 * @remarks
 * Se construye en tiempo de módulo concatenando los arrays normalizados
 * de todos los departamentos y aplicando una deduplicación global por
 * `href`. Una app que aparezca en múltiples departamentos con el mismo
 * `href` solo se incluye una vez — la primera ocurrencia en el orden
 * de concatenación prevalece.
 *
 * Para filtrar el catálogo según el nivel de acceso del colaborador,
 * usar {@link filterCatalogByAccess} en lugar de acceder directamente
 * a este array.
 */
export const APP_CATALOG: CatalogApp[] = (() => {
  const raw: CatalogApp[] = [
    ...toCatalog(hrApps,             "hr",                     "app"),
    ...toCatalog(hrQuickLinks,       "hr",                     "quicklink"),
    ...toCatalog(itQuickLinks,       "it",                     "quicklink"),
    ...toCatalog(adminQuickLinks,    "administrative-services", "quicklink"),
    ...toCatalog(documentQuickLinks, "documents",              "quicklink"),
    ...toCatalog(financeQuickLinks,  "finance",                "quicklink"),
    ...toCatalog(legalQuickLinks,    "legal",                  "quicklink"),
    ...toCatalog(retailQuickLinks,   "retail",                 "quicklink"),
  ];
  const globalSeen = new Set<string>();
  return raw.filter((a) => {
    if (globalSeen.has(a.href)) return false;
    globalSeen.add(a.href);
    return true;
  });
})();

// ── Helpers de acceso ─────────────────────────────────────────────────────────

/**
 * Retorna todas las apps del catálogo que pertenecen a un departamento
 * específico.
 *
 * @param dept - Identificador del departamento según {@link AppDepartment}.
 * @returns Array de {@link CatalogApp} del departamento indicado.
 *
 * @example
 * ```ts
 * const hrApps = getAppsByDepartment("hr");
 * ```
 */
export function getAppsByDepartment(dept: AppDepartment): CatalogApp[] {
  return APP_CATALOG.filter((a) => a.department === dept);
}

/**
 * Retorna el catálogo completo sin filtro de acceso.
 *
 * @remarks
 * Para uso en contextos administrativos donde se requiere ver todas
 * las apps independientemente del nivel de acceso. En contextos de
 * usuario final, usar {@link filterCatalogByAccess} en su lugar.
 *
 * @returns Array completo de {@link CatalogApp}.
 */
export function getAllApps(): CatalogApp[] {
  return APP_CATALOG;
}

/**
 * Filtra el catálogo según el `AccessLevel` del colaborador autenticado,
 * ocultando las apps para las que no tiene permiso.
 *
 * @remarks
 * Las apps sin `requiredPermission` son siempre visibles.
 * Las apps con `requiredPermission` solo se incluyen si
 * `can(accessLevel, requiredPermission)` retorna `true`.
 *
 * Es la función que debe usarse para construir el catálogo visible
 * en el modal de favoritos del colaborador.
 *
 * @param accessLevel - Nivel de acceso del colaborador autenticado,
 *   obtenido desde `session.user.accessLevel`.
 * @returns Array de {@link CatalogApp} visibles para el nivel de acceso
 *   indicado.
 *
 * @example
 * ```ts
 * const { level } = useAppSession();
 * const visibleApps = filterCatalogByAccess(level);
 * ```
 */
export function filterCatalogByAccess(accessLevel: AccessLevel): CatalogApp[] {
  return APP_CATALOG.filter(
    (app) => !app.requiredPermission || can(accessLevel, app.requiredPermission),
  );
}