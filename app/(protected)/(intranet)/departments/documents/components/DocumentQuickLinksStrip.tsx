"use client";

import { FilePlus, FolderOpen, CheckCircle2, Search } from "lucide-react";
import Link from "next/link";

export default function DocumentQuickLinksStrip() {
  const links = [
    { label: "Nuevo documento", icon: FilePlus,     href: "/documentos/nuevo"         },
    { label: "Repositorio",     icon: FolderOpen,   href: "/documentos/repositorio"   },
    { label: "Aprobaciones",    icon: CheckCircle2, href: "/documentos/aprobaciones"  },
    { label: "Buscar",          icon: Search,       href: "/documentos/buscar"        },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((link, i) => {
        const Icon = link.icon;
        return (
          <Link
            key={i}
            href={link.href}
            className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors
                       border-slate-200 bg-white text-slate-700 hover:bg-slate-50
                       dark:border-[#30363d] dark:bg-[#161b22] dark:text-[#adbac7]
                       dark:hover:bg-[#21262d] dark:hover:border-[#444c56]"
          >
            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}
