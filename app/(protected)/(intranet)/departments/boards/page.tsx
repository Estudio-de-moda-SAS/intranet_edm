/**
 * @module boardsPage
 * Punto de entrada del módulo de Tableros (Power BI).
 *
 * @remarks
 * Este archivo define la página principal de la sección de Tableros
 * dentro de la aplicación, resolviendo:
 * - metadatos SEO de la página
 * - nivel de acceso del usuario
 * - renderizado del contenido principal con transición
 *
 * El componente se ejecuta en servidor, lo que permite:
 * - consultar la sesión antes del render
 * - entregar el nivel de acceso al componente de contenido
 * - mantener consistencia con el patrón de páginas del módulo
 *
 * En entornos de desarrollo también soporta un modo bypass de autenticación
 * controlado por la variable `NEXT_PUBLIC_AUTH_BYPASS`.
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }           from "next";
import { PageTransition }          from "@/app/components/ui/PageTransition";
import { BoardsClientShell }       from "./components/BoardsClientShell";
import { getServerAccessLevel }    from "@/lib/getServerAccessLevel";

/**
 * Metadatos de la página del módulo de Tableros.
 *
 * @remarks
 * Estos metadatos se utilizan para definir el título y la descripción
 * visibles en el navegador y en contextos de indexación o previsualización.
 */
export const metadata: Metadata = {
  title: "Tableros · EDM",
  description:
    "Reportes de Power BI por área operativa de Estudio de Moda S.A.S.",
};

/**
 * Página principal del módulo de Tableros.
 *
 * @returns La vista principal de tableros envuelta en una transición de página.
 *
 * @remarks
 * Este componente actúa como punto de entrada del módulo y coordina
 * dos responsabilidades principales:
 *
 * 1. **Resolver el nivel de acceso**
 *    Determina el `accessLevel` del usuario, ya sea desde una sesión
 *    simulada en modo bypass o desde la sesión real autenticada.
 *    Este valor se pasa al shell para condicionar comportamientos futuros.
 *
 * 2. **Renderizar el contenido**
 *    Entrega el nivel de acceso al componente {@link BoardsClientShell},
 *    envuelto en {@link PageTransition} para mantener consistencia visual
 *    en la navegación.
 *
 * La lógica de embed, filtrado por área y detección de permisos de Power BI
 * vive íntegramente en {@link BoardsClientShell} y {@link PowerBIViewer}.
 *
 * Si no existe sesión válida, el nivel de acceso cae por defecto en `"employee"`.
 *
 * @example
 * ```tsx
 * <BoardsHomePage />
 * ```
 */
export default async function BoardsHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────

  /**
   * Nivel de acceso efectivo del usuario dentro del módulo.
   *
   * @remarks
   * Actualmente se usa para reservar funcionalidades administrativas
   * futuras (ej. agregar/ocultar tableros por rol).
   */
  const accessLevel = await getServerAccessLevel();

  return (
    <PageTransition>
      <BoardsClientShell accessLevel={accessLevel} />
    </PageTransition>
  );
}
