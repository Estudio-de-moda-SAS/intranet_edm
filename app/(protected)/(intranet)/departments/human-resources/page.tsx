/**
 * @module HumanResourcesPage
 * Página principal del módulo de Recursos Humanos.
 *
 * Este módulo centraliza funcionalidades relacionadas con:
 * - gestión de personas,
 * - nómina,
 * - reclutamiento,
 * - bienestar organizacional.
 *
 * @remarks
 * Este componente se ejecuta en el servidor y cumple tres responsabilidades
 * principales:
 *
 * 1. Resolver el nivel de acceso del usuario.
 * 2. Obtener los datos del módulo de Recursos Humanos desde la capa de servicios.
 * 3. Renderizar la vista principal del área dentro de una transición de página.
 *
 * No utiliza `"use client"` y puede acceder de forma segura a la sesión
 * autenticada y a la lógica de datos del servidor.
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }    from "next";
import { auth }             from "@/auth";
import { DEV_SESSION }      from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { getHRData }        from "@/lib/graph/departments/hr.service";
import { PageTransition }   from "@/app/components/ui/PageTransition";
import HRPageContent        from "./components/HumanResouresHomePage";

/**
 * Metadatos de la página del módulo de Recursos Humanos.
 *
 * @remarks
 * Define el título y la descripción general usados por Next.js para la vista
 * y el contexto del módulo.
 */
export const metadata: Metadata = {
  title: "Recursos Humanos · EDM",
  description: "Gestión de personas, nómina, reclutamiento y bienestar organizacional.",
};

/**
 * Indica si el sistema está ejecutándose en modo bypass de autenticación.
 *
 * @remarks
 * Cuando está activo, se usa {@link DEV_SESSION} como fuente del nivel
 * de acceso en lugar de la sesión autenticada real.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Página principal del módulo de Recursos Humanos.
 *
 * @returns Vista principal del módulo con datos y permisos resueltos.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Determina el nivel de acceso del usuario:
 *    - En desarrollo: usa {@link DEV_SESSION}.
 *    - En producción: usa {@link auth}.
 * 2. Obtiene los datos del módulo mediante {@link getHRData}.
 * 3. Renderiza el contenido principal con {@link HRPageContent}.
 */
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