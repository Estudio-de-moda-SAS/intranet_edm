// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getFinanceData }     from "@/lib/graph/departments/finance.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import FinancePageContent     from "./components/FinanceHomePage";

export const metadata: Metadata = {
  title: "Finanzas · EDM",
  description: "Gestión financiera, reportes, presupuesto y control operativo.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function FinanceHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────
  const data = await getFinanceData();

  return (
    <PageTransition>
      <FinancePageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}