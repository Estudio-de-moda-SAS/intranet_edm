// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }    from "next";
import { auth }             from "@/auth";
import { DEV_SESSION }      from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { getAdminData }     from "@/lib/graph/departments/administrative.service";
import { PageTransition }   from "@/app/components/ui/PageTransition";
import AdminHomePage        from "./components/AdminHomePage";

export const metadata: Metadata = {
  title:       "Servicios Administrativos · EDM",
  description: "Gestiona trámites, descarga formatos y consulta fechas clave del área administrativa.",
};

export const revalidate = 300;

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export default async function AdministrativePage() {

  let accessLevel: AccessLevel;
  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  const data = await getAdminData();

  return (
    <PageTransition>
      <AdminHomePage data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}