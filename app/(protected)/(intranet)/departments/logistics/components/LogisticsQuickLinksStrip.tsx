"use client";

// ✅ CLIENT COMPONENT
// Cambios respecto al original:
//   1. Recibe quickLinks como prop — no importa el config directamente
//   2. icon es string — resuelto por ICON_MAP
//   3. Links disabled se renderizan con candado

import Link from "next/link";
import {
  Zap, Lock,
  Briefcase, Package, ClipboardList, Globe,
  Bell, BarChart2, Settings, Truck,
  LayoutDashboard, FileText, AlertTriangle,
} from "lucide-react";
import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

// ── Icon map ──────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  Briefcase, Package, ClipboardList, Globe,
  Bell, BarChart2, Settings, Truck,
  LayoutDashboard, FileText, AlertTriangle,
};

function resolveIcon(key: string): React.ElementType {
  return ICON_MAP[key] ?? LayoutDashboard;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  quickLinks: QuickLinkItem[];
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LogisticsQuickLinksStrip({ quickLinks = [] }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm px-5 py-4">
      <div className="flex items-center gap-2 mb-3">
        <Zap className="h-3.5 w-3.5 text-amber-500" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
          Accesos rápidos
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {quickLinks.map((link) => {
          const Icon = resolveIcon(link.icon);

          // ── Deshabilitado ────────────────────────────────────────
          if (link.disabled) {
            return (
              <div
                key={link.href}
                title={link.disabledMsg ?? "Sin acceso"}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3.5 py-2 text-[12px] font-medium text-slate-300 cursor-not-allowed select-none opacity-50"
              >
                <Icon className="h-3.5 w-3.5" />
                {link.label}
                <Lock className="h-3 w-3" />
              </div>
            );
          }

          // ── Activo ───────────────────────────────────────────────
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-[12px] font-medium text-slate-600 transition-all hover:border-sky-200 hover:bg-sky-50 hover:text-sky-700 hover:shadow-sm"
            >
              <Icon className="h-3.5 w-3.5 text-slate-400 group-hover:text-sky-500 transition-colors" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}