"use client";

import { QuickLinksSection }  from "@/app/components/ui/QuickLinksSection";
import type { QuickLinkItem } from "@/app/components/ui/QuickLinksSection";

interface HRQuickLinksProps {
  quickLinks: QuickLinkItem[];   // ← procesados por el Server Component
  title?:     string;
  columns?:   2 | 3 | 4;
}

export function HRQuickLinks({
  quickLinks,
  title   = "Accesos rápidos · RRHH",
  columns = 2,
}: HRQuickLinksProps) {
  return (
    <QuickLinksSection
      title={title}
      quickLinks={quickLinks}
      columns={columns}
    />
  );
}