/**
 * @module ProductPage
 * Página principal del módulo de Producto.
 *
 * @remarks
 * Este archivo define un Server Component de Next.js encargado de:
 * - Resolver el nivel de acceso del usuario autenticado
 * - Obtener los datos del módulo de producto
 * - Renderizar el contenido principal del dashboard de producto
 *
 * ⚠️ No contiene lógica de UI directamente, delega la renderización
 * al componente `ProductPageContent`.
 *
 * Flujo general:
 * 1. Determina si el sistema está en modo bypass (desarrollo)
 * 2. Obtiene el nivel de acceso del usuario
 * 3. Consulta los datos del servicio de producto
 * 4. Renderiza la vista con transición
 */

import type { Metadata }      from "next";
import { auth }               from "@/auth";
import { DEV_SESSION }        from "@/lib/devSession";
import type { AccessLevel }   from "@/lib/roles";
import { getProductData }     from "@/lib/graph/departments/product.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import ProductPageContent     from "./components/ProductPageContent";

/**
 * Metadatos de la página para SEO y configuración del documento.
 *
 * @remarks
 * Define el título y descripción que serán utilizados por Next.js
 * en el `<head>` de la aplicación.
 */
export const metadata: Metadata = {
  title: "Producto · EDM",
  description: "Colecciones, fichas técnicas, muestras y lanzamientos de Estudio de Moda SAS.",
};

/**
 * Indicador de bypass de autenticación.
 *
 * @remarks
 * Cuando está activo (`true`), permite simular una sesión sin necesidad
 * de autenticación real, usando datos definidos en `DEV_SESSION`.
 *
 * Usado principalmente en entornos de desarrollo.
 */
const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

/**
 * Página principal del módulo de Producto.
 *
 * @returns Componente renderizado con los datos del módulo y nivel de acceso.
 *
 * @remarks
 * Este Server Component:
 *
 * - Evalúa el nivel de acceso del usuario:
 *   - Usa `DEV_SESSION` si el bypass está activo
 *   - Usa `auth()` si el sistema está en modo normal
 *
 * - Obtiene los datos del módulo mediante `getProductData()`
 *
 * - Renderiza el contenido dentro de un `PageTransition`
 *   para mejorar la experiencia visual entre navegaciones
 *
 * Props delegadas a `ProductPageContent`:
 * - `data`: información del módulo de producto
 * - `accessLevel`: nivel de permisos del usuario
 */
export default async function ProductHomePage() {

  // ── Resolver nivel de acceso ──────────────────────────────────

  /**
   * Nivel de acceso del usuario actual.
   *
   * @remarks
   * Define los permisos para visualizar o interactuar con
   * el contenido del módulo.
   */
  let accessLevel: AccessLevel;

  if (isBypass) {
    accessLevel = DEV_SESSION.user.accessLevel;
  } else {
    const session = await auth();
    accessLevel   = session?.user?.accessLevel ?? "employee";
  }

  // ── Datos ─────────────────────────────────────────────────────

  /**
   * Datos del módulo de producto.
   *
   * @remarks
   * Obtenidos desde el servicio `product.service`, contienen
   * toda la información necesaria para renderizar el dashboard:
   * - Colecciones
   * - Fichas técnicas
   * - Muestras
   * - Lanzamientos
   */
  const data = await getProductData();

  return (
    <PageTransition>
      <ProductPageContent data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}