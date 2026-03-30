// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getRetailData }      from "@/lib/graph/departments/retail.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import RetailPageContent      from "./components/RetailHomePage";

export const metadata: Metadata = {
  title: "Retail · EDM",
  description: "Visión unificada de los canales comercial, e-commerce y tiendas físicas.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function RetailHomePage() {

  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  const { commercial, ecommerce, stores } = await getRetailData();

  return (
    <PageTransition>
      <RetailPageContent
        commercial={commercial}
        ecommerce={ecommerce}
        stores={stores}
        accessLevel={accessLevel}
      />
    </PageTransition>
  );
}