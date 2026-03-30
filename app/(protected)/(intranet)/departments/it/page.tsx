// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }  from "next";
import { auth }           from "@/auth";
import { DEV_SESSION }    from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { getITData }      from "@/lib/graph/departments/it.service";
import { PageTransition } from "@/app/components/ui/PageTransition";
import ITPageContent      from "./components/ITHomePage";

export const metadata: Metadata = {
  title:       "Tecnología (TI) · EDM",
  description: "Monitoreo de infraestructura, sistemas y soporte técnico.",
};

export const revalidate = 120;

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function ITHomePage() {

  let accessLevel: AccessLevel;
  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  const data = await getITData();

  return (
    <PageTransition>
      <ITPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}