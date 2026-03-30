// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }  from "next";
import { auth }           from "@/auth";
import { DEV_SESSION }    from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { PageTransition } from "@/app/components/ui/PageTransition";
import DocumentHomePage   from "./components/DocumentHomePage";

export const metadata: Metadata = {
  title:       "Gestión Documental · EDM",
  description: "Repositorio documental corporativo, control de documentos, aprobaciones y cumplimiento.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function DocumentosHomePage() {

  let accessLevel: AccessLevel;
  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  return (
    <PageTransition>
      <DocumentHomePage accessLevel={accessLevel} />
    </PageTransition>
  );
}