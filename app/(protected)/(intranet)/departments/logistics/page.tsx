// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getLogisticsData }   from "@/lib/graph/departments/logistics.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import LogisticsPageContent   from "./components/LogisticsHomePage";

export const metadata: Metadata = {
  title: "Logística · EDM",
  description: "Gestión de envíos, rutas, almacenes e inventario en tiempo real.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function LogisticaHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────
  const data = await getLogisticsData();

  return (
    <PageTransition>
      <LogisticsPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}