// app/product/page.tsx
// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getProductData }     from "@/lib/graph/departments/product.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import ProductPageContent     from "./components/ProductPageContent";

export const metadata: Metadata = {
  title: "Producto · EDM",
  description: "Colecciones, fichas técnicas, muestras y lanzamientos de Estudio de Moda SAS.",
};

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function ProductHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────
  const data = await getProductData();

  return (
    <PageTransition>
      <ProductPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}