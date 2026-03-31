/**
 * apps.catalog.ts
 * Fuente única de verdad para el modal de favoritos.
 *
 * Cambios respecto al original:
 *   1. CatalogApp tiene `requiredPermission` opcional — viene de QuickLinkConfig
 *   2. toCatalog() propaga el requiredPermission de cada link
 *   3. filterCatalogByAccess() filtra el catálogo según AccessLevel
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

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type AppDepartment =
  | "hr"
  | "it"
  | "finance"
  | "administrative-services"
  | "legal"
  | "logistics"
  | "retail"
  | "documents";

export type CatalogApp = {
  href:                string;
  label:               string;
  description:         string;
  iconKey:             string;
  color:               string;
  defaultColor:        string;
  department:          AppDepartment;
  source?:             "app" | "quicklink";
  /** Si existe, el usuario debe tener este permiso para ver la app en el catálogo */
  requiredPermission?: Permission;
};

// ─── Color → bg-[...] ─────────────────────────────────────────────────────────

const COLOR_TO_BG: Record<string, string> = {
  purple: "bg-[#7F77DD]", teal:   "bg-[#1D9E75]",
  blue:   "bg-[#378ADD]", amber:  "bg-[#BA7517]",
  pink:   "bg-[#D4537E]", green:  "bg-[#639922]",
  coral:  "bg-[#D85A30]", indigo: "bg-[#4F6BED]",
  rose:   "bg-[#E11D48]", slate:  "bg-[#94A3B8]",
};

function toBg(color = "purple"): string {
  return COLOR_TO_BG[color] ?? "bg-[#7F77DD]";
}

// ─── Mapa LucideIcon → iconKey ────────────────────────────────────────────────

import {
  Users, UserPlus, CalendarDays, DollarSign, GraduationCap,
  Award, FileText, Settings, LayoutDashboard, BarChart2,
  BookOpen, Wrench, MessageSquare, Globe, Bell, Briefcase,
  ClipboardList, CreditCard, HeadphonesIcon, PieChart,
  ShieldCheck, Zap, Clock, BarChart3, HeartHandshake,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_TO_KEY = new Map<LucideIcon, string>([
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

function iconToKey(icon: unknown): string {
  if (typeof icon === "string") return icon;
  if (typeof icon === "function") {
    return ICON_TO_KEY.get(icon as LucideIcon) ?? "LayoutDashboard";
  }
  return "LayoutDashboard";
}

// ─── Convertidor ──────────────────────────────────────────────────────────────

type RawApp = {
  href:                string;
  label?:              string;
  title?:              string;
  description?:        string;
  icon?:               unknown;
  color?:              string;
  requiredPermission?: Permission;  // ← viene de QuickLinkConfig
};

function toCatalog(
  apps:       RawApp[],
  department: AppDepartment,
  source:     CatalogApp["source"],
): CatalogApp[] {
  const seen = new Set<string>();
  return apps
    .filter(a => { if (seen.has(a.href)) return false; seen.add(a.href); return true; })
    .map(a => {
      const entry: CatalogApp = {
        href:         a.href,
        label:        a.label ?? a.title ?? "",
        description:  a.description ?? "",
        iconKey:      iconToKey(a.icon),
        color:        a.color ?? "purple",
        defaultColor: toBg(a.color),
        department,
      };

      // ✅ solo asignar si tienen valor, nunca pasar undefined
      if (source                !== undefined) entry.source             = source;
      if (a.requiredPermission  !== undefined) entry.requiredPermission = a.requiredPermission;

      return entry;
    });
}

// ─── Consolidación ────────────────────────────────────────────────────────────

const RAW: CatalogApp[] = [
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
export const APP_CATALOG: CatalogApp[] = RAW.filter(a => {
  if (globalSeen.has(a.href)) return false;
  globalSeen.add(a.href);
  return true;
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getAppsByDepartment(dept: AppDepartment): CatalogApp[] {
  return APP_CATALOG.filter(a => a.department === dept);
}

export function getAllApps(): CatalogApp[] {
  return APP_CATALOG;
}

/**
 * Filtra el catálogo según el AccessLevel del usuario.
 * Apps sin requiredPermission → siempre visibles.
 * Apps con requiredPermission → solo si el usuario tiene ese permiso.
 */
export function filterCatalogByAccess(accessLevel: AccessLevel): CatalogApp[] {
  return APP_CATALOG.filter(app =>
    !app.requiredPermission || can(accessLevel, app.requiredPermission)
  );
}