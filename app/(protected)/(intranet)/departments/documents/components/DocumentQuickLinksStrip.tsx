"use client";

import { FilePlus, FolderOpen, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";

export default function DocumentQuickLinksStrip() {
  const links = [
    {
      label: "Nuevo documento",
      icon: FilePlus,
      href: "/documentos/nuevo",
    },
    {
      label: "Repositorio",
      icon: FolderOpen,
      href: "/documentos/repositorio",
    },
    {
      label: "Aprobaciones",
      icon: CheckCircle2,
      href: "/documentos/aprobaciones",
    },
    {
      label: "Buscar",
      icon: Search,
      href: "/documentos/buscar",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, i) => {
        const Icon = link.icon;

        return (
          <Link
            key={i}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:bg-slate-50"
          >
            <Icon className="h-4 w-4 text-indigo-600" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}