// app/(protected)/(intranet)/departments/administrative/components/AdminQuickLinksSection.tsx
"use client";

import { useState }                    from "react";
import { QuickLinksSection }           from "@/app/components/ui/QuickLinksSection";
import { adminQuickLinks }             from "../config/adminQuickLinks";
import { processQuickLinks }           from "@/lib/quickLinksAccess";
import type { AccessLevel }            from "@/lib/roles";

import NewRequestModal          from "./modals/NewRequestModal";
import AccessCardModal          from "./modals/AccessCardModal";
import VisitorRegistrationModal from "./modals/VisitorRegistrationModal";

interface Props {
  accessLevel: AccessLevel;
}

export function AdminQuickLinksSection({ accessLevel }: Props) {
  const [open, setOpen] = useState<"new_request" | "access_card" | "visitor" | null>(null);

  const links = processQuickLinks(adminQuickLinks, accessLevel).map((link) => {
    if (link.href === "/administrative/requests/new") return { ...link, action: () => setOpen("new_request") };
    if (link.href === "/administrative/access-cards") return { ...link, action: () => setOpen("access_card") };
    if (link.href === "/administrative/visitors")     return { ...link, action: () => setOpen("visitor") };
    return link;
  });

  return (
    <>
      <QuickLinksSection
        title="Accesos rápidos · Admin"
        quickLinks={links}
      />

      <NewRequestModal
        open={open === "new_request"}
        onClose={() => setOpen(null)}
      />
      <AccessCardModal
        open={open === "access_card"}
        onClose={() => setOpen(null)}
      />
      <VisitorRegistrationModal
        open={open === "visitor"}
        onClose={() => setOpen(null)}
      />
    </>
  );
}