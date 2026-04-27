/**
 * @module DocumentManagementPage
 * Página principal del módulo de Gestión Documental.
 *
 * Esta página actúa como punto de entrada al repositorio documental corporativo
 * de la intranet, incluyendo funcionalidades relacionadas con:
 * - consulta de documentos,
 * - control documental,
 * - aprobaciones,
 * - y cumplimiento.
 *
 * @remarks
 * Este componente se ejecuta en el servidor y se encarga de:
 * - resolver el nivel de acceso del usuario,
 * - soportar modo bypass en entorno de desarrollo,
 * - y renderizar la vista principal del módulo mediante {@link DocumentHomePage}.
 *
 * No utiliza `"use client"` y puede consumir directamente lógica de
 * autenticación segura.
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }    from "next";
import { DEV_SESSION }      from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { PageTransition }   from "@/app/components/ui/PageTransition";
import DocumentHomePage     from "./components/DocumentHomePage";
import { cookies }     from "next/headers";

/**
 * Metadatos de la página del módulo de Gestión Documental.
 *
 * @remarks
 * Define el título y la descripción usados por Next.js para SEO y contexto
 * general de la vista.
 */
export const metadata: Metadata = {
  title:       "Gestión Documental · EDM",
  description: "Repositorio documental corporativo, control de documentos, aprobaciones y cumplimiento.",
};

/**
 * Indica si el sistema se encuentra en modo bypass de autenticación.
 *
 * @remarks
 * Cuando el bypass está activo, el acceso del usuario se toma desde
 * {@link DEV_SESSION} en lugar de la sesión autenticada real.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Página principal del módulo de Gestión Documental.
 *
 * @returns Vista principal del módulo con el nivel de acceso resuelto.
 *
 * @remarks
 * Flujo de ejecución:
 * 1. Determina el nivel de acceso del usuario.
 *    - En desarrollo: usa {@link DEV_SESSION}.
 *    - En producción: usa {@link auth}.
 * 2. Renderiza la página dentro de {@link PageTransition}.
 * 3. Delega la interfaz principal a {@link DocumentHomePage}.
 */
export default async function DocumentosHomePage() {

  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const cookieStore = await cookies();
    accessLevel = (cookieStore.get("edm_access_level")?.value as AccessLevel) ?? "employee";
  }

  return (
    <PageTransition>
      <DocumentHomePage accessLevel={accessLevel} />
    </PageTransition>
  );
}