// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getHRData }          from "@/lib/graph/departments/hr.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import HRPageContent          from "./components/HumanResouresHomePage";

export const metadata: Metadata = {
  title: "Recursos Humanos · EDM",
  description: "Gestión de personas, nómina, reclutamiento y bienestar organizacional.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function HRHomePage() {

  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  const data = await getHRData();

  return (
    <PageTransition>
      <HRPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}