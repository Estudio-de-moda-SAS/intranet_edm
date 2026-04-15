/**
 * @module ITHomePage
 * Página principal del módulo de Tecnología (TI).
 *
 * @remarks
 * Este archivo define un **Server Component** en Next.js encargado de:
 * - Resolver el nivel de acceso del usuario
 * - Obtener datos del área de TI desde servicios externos
 * - Renderizar el contenido principal mediante {@link ITPageContent}
 * - Aplicar transición visual con {@link PageTransition}
 *
 * No utiliza `"use client"` ya que toda la lógica ocurre en el servidor.
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata } from "next";
import { auth } from "@/auth";
import { DEV_SESSION } from "@/lib/devSession";
import type { AccessLevel } from "@/lib/roles";
import { getITData } from "@/lib/graph/departments/it.service";
import { PageTransition } from "@/app/components/ui/PageTransition";
import ITPageContent from "./components/ITHomePage";

/**
 * Metadatos de la página de TI.
 *
 * @remarks
 * Utilizados por Next.js para SEO y configuración del documento HTML.
 */
export const metadata: Metadata = {
  title: "Tecnología (TI) · EDM",
  description: "Monitoreo de infraestructura, sistemas y soporte técnico.",
};

/**
 * Tiempo de revalidación ISR (Incremental Static Regeneration).
 *
 * @remarks
 * La página se regenera cada 120 segundos.
 */
export const revalidate = 120;

/**
 * Flag de bypass de autenticación.
 *
 * @remarks
 * Permite simular sesión de usuario en entornos de desarrollo
 * usando `DEV_SESSION` en lugar de {@link auth}.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Página principal del módulo de Tecnología (TI).
 *
 * @returns Contenedor con transición y contenido del módulo TI.
 *
 * @remarks
 * Flujo de ejecución:
 * 1. Determina el nivel de acceso (`accessLevel`)
 *    - Usa sesión real (`auth`) en producción
 *    - Usa sesión mock (`DEV_SESSION`) si está activo el bypass
 *
 * 2. Obtiene datos del área de TI mediante {@link getITData}
 *
 * 3. Renderiza el contenido con {@link ITPageContent}
 *    dentro de {@link PageTransition} para animación de entrada
 *
 * Seguridad:
 * - Si no existe sesión, se asigna `employee` como fallback
 *
 * @example
 * ```tsx
 * // Render automático por Next.js en la ruta correspondiente
 * ```
 */
export default async function ITHomePage() {
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel = session?.user?.accessLevel ?? "employee";
  }

  /**
   * Datos del módulo TI obtenidos desde el servicio.
   */
  const data = await getITData();

  return (
    <PageTransition>
      <ITPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}