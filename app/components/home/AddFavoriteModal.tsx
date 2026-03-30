"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Star, Search, Check,
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal } from "@/app/components/ui/Modal";
import type { AppItem } from "@/app/components/ui/AppsGrid";
import type { CreateFavoriteInput } from "@/features/favorites/favorites.types";
import { filterCatalogByAccess, type AppDepartment } from "@/config/apps.catalog";
import type { AccessLevel } from "@/lib/roles";

// ─── Icon map ─────────────────────────────────────────────────────────────────

const ICON_MAP = {
  FileText, LayoutDashboard, Users, Calendar,
  BarChart2, BookOpen, Wrench, MessageSquare,
  Globe, Bell, Briefcase, ClipboardList,
  CreditCard, HeadphonesIcon, PieChart, Settings,
  ShieldCheck, Zap,
} as const;

type IconKey = keyof typeof ICON_MAP;

// ─── Paleta ───────────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
  { label: "Violeta",   value: "bg-[#7F77DD]" },
  { label: "Azul",      value: "bg-[#378ADD]" },
  { label: "Verde",     value: "bg-[#1D9E75]" },
  { label: "Ámbar",     value: "bg-[#BA7517]" },
  { label: "Rosa",      value: "bg-[#D4537E]" },
  { label: "Gris",      value: "bg-[#888780]" },
  { label: "Índigo",    value: "bg-[#4F6BED]" },
  { label: "Naranja",   value: "bg-[#E05C28]" },
  { label: "Esmeralda", value: "bg-[#0D9488]" },
  { label: "Rojo",      value: "bg-[#DC2626]" },
];

// ✅ Fix: constante con fallback para evitar acceso undefined a COLOR_OPTIONS[0]
const DEFAULT_COLOR = COLOR_OPTIONS[0]?.value ?? "bg-[#7F77DD]";

const DEPARTMENT_LABELS: Record<AppDepartment | "all", string> = {
  all:                       "Todas",
  hr:                        "RRHH",
  it:                        "TI",
  finance:                   "Finanzas",
  "administrative-services": "Servicios Admin",
  legal:                     "Legal",
  logistics:                 "Logística",
  retail:                    "Retail",
  documents:                 "Documentos",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveIconKey(icon: AppItem["icon"]): IconKey {
  if (typeof icon === "string") {
    const normalized = icon.charAt(0).toUpperCase() + icon.slice(1);
    if (normalized in ICON_MAP) return normalized as IconKey;
  }
  return "LayoutDashboard";
}

function resolveColor(color: AppItem["color"]): string {
  const map: Record<string, string> = {
    purple: "bg-[#7F77DD]", teal:  "bg-[#1D9E75]",
    blue:   "bg-[#378ADD]", amber: "bg-[#BA7517]",
    pink:   "bg-[#D4537E]", green: "bg-[#1D9E75]",
    coral:  "bg-[#E05C28]", indigo:"bg-[#4F6BED]",
    rose:   "bg-[#DC2626]", slate: "bg-[#888780]",
  };
  return map[color ?? "purple"] ?? "bg-[#7F77DD]";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddFavoriteModalProps {
  open:            boolean;
  onClose:         () => void;
  existingHrefs?:  string[];
  preselectedApp?: AppItem | null;
  onAdd:           (input: CreateFavoriteInput) => Promise<void>;
  /** AccessLevel del usuario — filtra las apps disponibles */
  accessLevel?:    AccessLevel;
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function AddFavoriteModal({
  open,
  onClose,
  existingHrefs  = [],
  preselectedApp,
  onAdd,
  accessLevel    = "employee",
}: AddFavoriteModalProps) {

  const [step,       setStep]       = useState<1 | 2>(1);
  const [search,     setSearch]     = useState("");
  const [department, setDepartment] = useState<AppDepartment | "all">("all");
  const [selected,   setSelected]   = useState<ReturnType<typeof filterCatalogByAccess>[0] | null>(null);
  const [isSaving,   setIsSaving]   = useState(false);

  const [customLabel, setCustomLabel] = useState("");
  const [customDesc,  setCustomDesc]  = useState("");
  const [customColor, setCustomColor] = useState(DEFAULT_COLOR);
  const [customIcon,  setCustomIcon]  = useState<IconKey>("LayoutDashboard");

  // Catálogo filtrado por accessLevel — se recalcula solo cuando cambia el nivel
  const allowedCatalog = useMemo(
    () => filterCatalogByAccess(accessLevel),
    [accessLevel]
  );

  // Departamentos disponibles según el catálogo filtrado
  const availableDepartments = useMemo<Array<AppDepartment | "all">>(() => {
    const depts = new Set(allowedCatalog.map(a => a.department));
    return ["all", ...Array.from(depts)] as Array<AppDepartment | "all">;
  }, [allowedCatalog]);

  // Apps filtradas por búsqueda y departamento
  const filtered = useMemo(() => {
    return allowedCatalog.filter(app => {
      const matchesDept   = department === "all" || app.department === department;
      const matchesSearch = !search
        || app.label.toLowerCase().includes(search.toLowerCase())
        || app.description.toLowerCase().includes(search.toLowerCase());
      return matchesDept && matchesSearch;
    });
  }, [allowedCatalog, search, department]);

  // ── Cuando abre con app preseleccionada ──────────────────────────────────
  useEffect(() => {
    if (!open) return;
    if (preselectedApp) {
      const match = allowedCatalog.find(a => a.href === preselectedApp.href);
      const synthetic = match ?? {
        href:         preselectedApp.href,
        label:        preselectedApp.label,
        description:  preselectedApp.description ?? "",
        iconKey:      resolveIconKey(preselectedApp.icon),
        color:        preselectedApp.color ?? "purple",
        defaultColor: resolveColor(preselectedApp.color),
        department:   "hr" as AppDepartment,
        source:       "app" as const,
      };
      applySelection(synthetic);
    } else {
      resetFields();
      setStep(1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preselectedApp]);

  // ── Helpers internos ─────────────────────────────────────────────────────

  function applySelection(app: typeof allowedCatalog[0]) {
    setSelected(app);
    setCustomLabel(app.label);
    setCustomDesc(app.description);
    setCustomColor(app.defaultColor);
    setCustomIcon(resolveIconKey(app.iconKey));
    setStep(2);
  }

  function resetFields() {
    setSearch("");
    setDepartment("all");
    setSelected(null);
    setCustomLabel("");
    setCustomDesc("");
    setCustomColor(DEFAULT_COLOR);
    setCustomIcon("LayoutDashboard");
    setIsSaving(false);
  }

  function handleClose() {
    resetFields();
    setStep(1);
    onClose();
  }

  async function handleConfirm() {
    if (!selected || !customLabel.trim()) return;
    setIsSaving(true);
    try {
      // ✅ Fix 3: description solo se incluye si tiene valor, nunca undefined
      const input: CreateFavoriteInput = {
        href:    selected.href,
        label:   customLabel.trim(),
        iconKey: customIcon,
        color:   customColor,
        ...(customDesc.trim() && { description: customDesc.trim() }),
      };
      await onAdd(input);
      handleClose();
    } finally {
      setIsSaving(false);
    }
  }

  const PreviewIcon = ICON_MAP[customIcon];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size="sm"
      accentColor="bg-amber-400"
      title={step === 1 ? "Agregar acceso rápido" : "Personalizar acceso"}
      subtitle={
        step === 1
          ? "Elige una aplicación de la intranet"
          : `Ajusta cómo aparecerá «${selected?.label}» en tus favoritos`
      }
      footer={
        step === 1 ? null : (
          <div className="flex items-center justify-between gap-3">
            {!preselectedApp ? (
              <button onClick={() => setStep(1)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50">
                ← Volver
              </button>
            ) : (
              <button onClick={handleClose}
                className="rounded-lg border border-slate-200 px-4 py-2 text-[12px] font-medium text-slate-600 transition hover:bg-slate-50">
                Cancelar
              </button>
            )}
            <button onClick={handleConfirm} disabled={!customLabel.trim() || isSaving}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-5 py-2 text-[12px] font-semibold text-white transition-all",
                customLabel.trim() && !isSaving
                  ? "bg-amber-500 hover:bg-amber-600 shadow-sm hover:shadow"
                  : "bg-slate-200 cursor-not-allowed text-slate-400",
              )}
            >
              {isSaving
                ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Star className="h-3 w-3 fill-white" />
              }
              {isSaving ? "Guardando…" : "Guardar favorito"}
            </button>
          </div>
        )
      }
    >
      {/* ── STEP 1 ───────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-3">

          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
            <input
              type="text" placeholder="Buscar aplicación…"
              value={search} onChange={e => setSearch(e.target.value)} autoFocus
              className={cn(
                "w-full rounded-lg border border-slate-200 bg-slate-50",
                "pl-9 pr-3 py-2 text-[12px] text-slate-700 placeholder:text-slate-400",
                "outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100",
              )}
            />
          </div>

          {/* Filtros de departamento — solo los que tienen apps disponibles */}
          <div className="flex flex-wrap gap-1.5">
            {availableDepartments.map(dept => (
              <button
                key={dept}
                onClick={() => setDepartment(dept)}
                className={cn(
                  "rounded-full px-2.5 py-1 text-[11px] font-medium transition-all",
                  department === dept
                    ? "bg-amber-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                )}
              >
                {DEPARTMENT_LABELS[dept]}
              </button>
            ))}
          </div>

          {/* Lista de apps */}
          <ul className="grid grid-cols-1 gap-1 max-h-[280px] overflow-y-auto pr-0.5 -mr-1">
            {filtered.length === 0 && (
              <li className="py-8 text-center text-[12px] text-slate-400">
                No se encontraron aplicaciones
              </li>
            )}
            {filtered.map(app => {
              // ✅ Fix 1: extraer iconKey y usar ?? LayoutDashboard con guard
              const iconKey = resolveIconKey(app.iconKey);
              const Icon    = ICON_MAP[iconKey] ?? LayoutDashboard;
              const isAdded = existingHrefs.includes(app.href);
              return (
                <li key={app.href}>
                  <button
                    disabled={isAdded}
                    onClick={() => applySelection(app)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-[10px] border px-3 py-2.5 text-left transition-all duration-150",
                      isAdded
                        ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm cursor-pointer",
                    )}
                  >
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px]", app.defaultColor)}>
                      <Icon className="h-4 w-4 text-white" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-[12px] font-semibold text-slate-700 truncate">{app.label}</span>
                      <span className="block text-[10.5px] text-slate-400 truncate">
                        {app.description} · <span className="text-slate-300">{DEPARTMENT_LABELS[app.department]}</span>
                      </span>
                    </span>
                    {isAdded
                      ? <span className="shrink-0 text-[10px] font-medium text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">Agregado</span>
                      : <span className="shrink-0 text-[10px] font-medium text-amber-500">Elegir →</span>
                    }
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── STEP 2 ───────────────────────────────────────────────────────── */}
      {step === 2 && selected && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] transition-all", customColor)}>
              <PreviewIcon className="h-5 w-5 text-white" />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-semibold text-slate-800 truncate">
                {customLabel || <span className="text-slate-400 font-normal italic">Sin nombre</span>}
              </span>
              {customDesc && <span className="block text-[11px] text-slate-400 truncate">{customDesc}</span>}
            </span>
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400 shrink-0" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Nombre del acceso</label>
            <input type="text" value={customLabel} maxLength={28}
              onChange={e => setCustomLabel(e.target.value)} placeholder={selected.label}
              className={cn(
                "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
                "text-[12px] text-slate-700 placeholder:text-slate-400",
                "outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100",
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              Subtítulo <span className="normal-case font-normal text-slate-400">(opcional)</span>
            </label>
            <input type="text" value={customDesc} maxLength={22}
              onChange={e => setCustomDesc(e.target.value)} placeholder={selected.description}
              className={cn(
                "rounded-lg border border-slate-200 bg-slate-50 px-3 py-2",
                "text-[12px] text-slate-700 placeholder:text-slate-400",
                "outline-none transition focus:border-amber-400 focus:bg-white focus:ring-2 focus:ring-amber-100",
              )}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Color del ícono</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(c => (
                <button key={c.value} title={c.label} onClick={() => setCustomColor(c.value)}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all ring-offset-2", c.value,
                    customColor === c.value ? "ring-2 ring-amber-400 scale-110" : "hover:scale-105 hover:ring-2 hover:ring-slate-300",
                  )}
                >
                  {customColor === c.value && <Check className="h-3 w-3 text-white mx-auto" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Ícono</label>
            <div className="grid grid-cols-9 gap-1.5">
              {(Object.keys(ICON_MAP) as IconKey[]).map(key => {
                // ✅ Fix 2: guard antes de renderizar
                const Ic = ICON_MAP[key];
                if (!Ic) return null;
                return (
                  <button key={key} title={key} onClick={() => setCustomIcon(key)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-[7px] border transition-all",
                      customIcon === key
                        ? "border-amber-400 bg-amber-50 text-amber-600 shadow-sm"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-white",
                    )}
                  >
                    <Ic className="h-3.5 w-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}