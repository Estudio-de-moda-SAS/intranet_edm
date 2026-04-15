/**
 * @module CompanyPage
 * Página principal de la sección "Conoce la Empresa".
 *
 * @remarks
 * Este archivo define la ruta `/company` dentro de la intranet y actúa como
 * punto de entrada (entry point) para la sección corporativa.
 *
 * Responsabilidades:
 *
 * - declarar metadata SEO de la página
 * - renderizar el contenedor principal {@link CompanyPageContent}
 *
 * Es un **Server Component**, lo que permite:
 *
 * - mejor rendimiento en render inicial
 * - integración directa con metadata de Next.js
 * - separación clara entre layout y lógica de cliente
 */

// app/company/page.tsx
// ✅ SERVER COMPONENT

import { CompanyPageContent } from "./components/KnowUsPageContent";

/* -------------------------------------------------------------------------- */
/* Metadata                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Metadata de la página para SEO y navegación.
 *
 * @remarks
 * Utilizado por el sistema de rutas de Next.js para:
 *
 * - título del navegador
 * - descripción de la página
 * - posibles integraciones futuras (Open Graph, etc.)
 */
export const metadata = {
  title: "Conoce la Empresa | Intranet EDM",
  description: "Historia, valores, marcas y equipo de Estudio de Moda S.A.S.",
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Página de "Conoce la Empresa".
 *
 * @returns Contenedor principal de la sección corporativa.
 *
 * @remarks
 * Este componente delega completamente la lógica y presentación
 * al componente {@link CompanyPageContent}, manteniendo este archivo
 * como una capa limpia de enrutamiento.
 *
 * @example
 * ```tsx
 * // Ruta: /company
 * <CompanyPage />
 * ```
 */
export default function CompanyPage() {
  return <CompanyPageContent />;
}