/**
 * @module LegalPage
 * Página principal del departamento jurídico.
 *
 * @remarks
 * Este módulo define la ruta principal de la sección legal dentro de la intranet.
 *
 * Sus responsabilidades principales son:
 * - Definir la metadata de la página
 * - Resolver el nivel de acceso del usuario autenticado
 * - Obtener los datos del módulo legal
 * - Renderizar la vista principal dentro de una transición de página
 *
 * También contempla un modo de bypass para entornos de desarrollo,
 * permitiendo simular una sesión sin autenticación real.
 */

// app/(protected)/(intranet)/departments/legal/page.tsx
// ✅ SERVER COMPONENT

import type { Metadata } from "next";
import { getLegalData } from "@/lib/graph/departments/legal.service";
import { PageTransition } from "@/app/components/ui/PageTransition";
import LegalHomePage from "./components/LegalHomePage";
import { getServerAccessLevel } from "@/lib/getServerAccessLevel";

/**
 * Metadata estática de la página del departamento jurídico.
 *
 * @remarks
 * Se utiliza para definir el título y la descripción visibles
 * en el contexto de navegación y SEO interno de la aplicación.
 */
export const metadata: Metadata = {
  title: "Jurídico · EDM",
  description: "Contratos, litigios, cumplimiento normativo y asesoría legal corporativa.",
};

/**
 * Intervalo de revalidación de datos estáticos en segundos.
 *
 * @remarks
 * La página se revalida cada 5 minutos para mantener la información
 * relativamente actualizada sin perder beneficios de rendimiento.
 */
export const revalidate = 300;

/**
 * Página principal del módulo legal.
 *
 * @returns Vista principal del departamento jurídico con transición de página.
 *
 * @remarks
 * Este componente de servidor:
 * - Determina el nivel de acceso del usuario
 * - Usa una sesión simulada si el bypass está activo
 * - Consulta los datos del módulo legal
 * - Renderiza el contenedor principal de la home legal
 *
 * Flujo general:
 * 1. Resolver el nivel de acceso
 * 2. Obtener la data del servicio legal
 * 3. Renderizar la página con transición
 */
export default async function LegalPage() {
  /**
   * Nivel de acceso efectivo del usuario.
   *
   * @remarks
   * Se resuelve a partir de la sesión real o de la sesión simulada
   * según el entorno de ejecución.
   */
const accessLevel = await getServerAccessLevel();  // ── Datos ─────────────────────────────────────────────────────
  const data = await getLegalData();

  return (
    <PageTransition>
      <LegalHomePage data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}