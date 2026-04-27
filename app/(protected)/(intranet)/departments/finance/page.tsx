/**
 * @module financePage
 * Punto de entrada del módulo de Finanzas.
 *
 * @remarks
 * Este archivo define la página principal del área de Finanzas dentro
 * de la aplicación, resolviendo:
 * - metadatos SEO de la página
 * - nivel de acceso del usuario
 * - obtención de datos del módulo
 * - renderizado del contenido principal con transición
 *
 * El componente se ejecuta en servidor, lo que permite:
 * - consultar la sesión antes del render
 * - obtener datos iniciales del módulo
 * - entregar una vista ya preparada al componente de contenido
 *
 * En entornos de desarrollo también soporta un modo bypass de autenticación
 * controlado por la variable `NEXT_PUBLIC_AUTH_BYPASS`.
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getFinanceData }     from "@/lib/graph/departments/finance.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import FinancePageContent     from "./components/FinanceHomePage";
import { cookies }     from "next/headers";

/**
 * Metadatos de la página del módulo de Finanzas.
 *
 * @remarks
 * Estos metadatos se utilizan para definir el título y la descripción
 * visibles en el navegador y en contextos de indexación o previsualización.
 */
export const metadata: Metadata = {
  title: "Finanzas · EDM",
  description: "Gestión financiera, reportes, presupuesto y control operativo.",
};

/**
 * Indica si la autenticación debe omitirse en el entorno actual.
 *
 * @remarks
 * Este flag permite utilizar una sesión simulada en desarrollo
 * para acelerar pruebas locales del módulo sin depender del flujo real
 * de autenticación.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Página principal del módulo de Finanzas.
 *
 * @returns La vista principal del área de Finanzas envuelta en una transición de página.
 *
 * @remarks
 * Este componente actúa como punto de entrada del módulo y coordina
 * tres responsabilidades principales:
 *
 * 1. **Resolver el nivel de acceso**
 *    Determina el `accessLevel` del usuario, ya sea desde una sesión
 *    simulada en modo bypass o desde la sesión real autenticada.
 *
 * 2. **Obtener los datos iniciales**
 *    Consulta la fuente de datos del módulo mediante
 *    {@link getFinanceData}.
 *
 * 3. **Renderizar el contenido**
 *    Entrega los datos y el nivel de acceso al componente
 *    {@link FinancePageContent}, envuelto en {@link PageTransition}
 *    para mantener consistencia visual en la navegación.
 *
 * Si no existe sesión válida, el nivel de acceso cae por defecto
 * en `"employee"`.
 *
 * @example
 * ```tsx
 * <FinanceHomePage />
 * ```
 */
export default async function FinanceHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────

  /**
   * Nivel de acceso efectivo del usuario dentro del módulo.
   *
   * @remarks
   * Este valor gobierna qué secciones, acciones y paneles
   * estarán disponibles dentro de la homepage de Finanzas.
   */
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const cookieStore = await cookies();
    accessLevel = (cookieStore.get("edm_access_level")?.value as AccessLevel) ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────

  /**
   * Datos iniciales del módulo de Finanzas.
   *
   * @remarks
   * Este dataset es consumido por el componente principal
   * de contenido para renderizar la homepage del área.
   */
  const data = await getFinanceData();

  return (
    <PageTransition>
      <FinancePageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}