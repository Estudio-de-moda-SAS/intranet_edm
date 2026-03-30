// app/(protected)/(intranet)/departments/legal/page.tsx
// ✅ SERVER COMPONENT

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getLegalData }       from "@/lib/graph/departments/legal.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import LegalHomePage          from "./components/LegalHomePage";

export const metadata: Metadata = {
  title:       "Jurídico · EDM",
  description: "Contratos, litigios, cumplimiento normativo y asesoría legal corporativa.",
};

export const revalidate = 300;

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function LegalPage() {

  // ── Resolver nivel de acceso ──────────────────────────────────
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────
  const data = await getLegalData();

  return (
    <PageTransition>
      <LegalHomePage data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}