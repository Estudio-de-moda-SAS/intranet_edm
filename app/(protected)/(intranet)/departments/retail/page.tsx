/**
 * @module RetailPage
 * Página principal del módulo de Retail.
 *
 * @remarks
 * Este archivo define la entrada principal de la sección de Retail
 * dentro de la intranet.
 *
 * Se trata de un Server Component encargado de:
 * - resolver el nivel de acceso del usuario
 * - obtener los datos agregados del módulo de retail
 * - delegar la renderización del contenido al componente principal de la vista
 *
 * El módulo integra información de distintos frentes operativos,
 * incluyendo:
 * - canal comercial
 * - e-commerce
 * - tiendas físicas
 *
 * Este componente actúa como capa de orquestación de página,
 * manteniendo separadas las responsabilidades de:
 * - autenticación y permisos
 * - carga de datos
 * - composición visual
 */

// ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }      from "next";
import { getRetailData }      from "@/lib/graph/departments/retail.service";
import { PageTransition }     from "@/app/components/ui/PageTransition";
import RetailPageContent      from "./components/RetailHomePage";
import { getServerAccessLevel } from "@/lib/getServerAccessLevel";

/**
 * Metadatos de la página del módulo de Retail.
 *
 * @remarks
 * Define información utilizada por Next.js para configurar
 * el título y la descripción de la página.
 *
 * Estos metadatos pueden contribuir a:
 * - identificación del módulo en navegación
 * - organización del documento
 * - configuración general del head de la página
 */
export const metadata: Metadata = {
  title: "Retail · EDM",
  description: "Visión unificada de los canales comercial, e-commerce y tiendas físicas.",
};

/**
 * Página principal del módulo de Retail.
 *
 * @returns La vista principal del módulo con datos agregados
 * y nivel de acceso resuelto.
 *
 * @remarks
 * Este componente ejecuta el flujo principal de inicialización
 * de la página:
 *
 * 1. Resuelve el nivel de acceso del usuario:
 *    - usando `DEV_SESSION` si el bypass está habilitado
 *    - usando `auth()` en ejecución normal
 *
 * 2. Obtiene la información consolidada del módulo de Retail
 *    mediante {@link getRetailData}
 *
 * 3. Renderiza el contenido dentro de {@link PageTransition}
 *    para mantener consistencia visual en la navegación
 *
 * Los datos recuperados se desestructuran en tres dominios:
 * - `commercial`
 * - `ecommerce`
 * - `stores`
 *
 * Posteriormente se delegan al componente
 * {@link RetailPageContent}, que se encarga de la composición
 * visual de la homepage del módulo.
 */
export default async function RetailHomePage() {

  /**
   * Nivel de acceso del usuario actual.
   *
   * @remarks
   * Determina qué secciones, acciones o bloques del módulo
   * podrán mostrarse en la interfaz.
   */
const accessLevel = await getServerAccessLevel();
  /**
   * Datos agregados del módulo de Retail.
   *
   * @remarks
   * Esta llamada retorna la información principal del módulo
   * segmentada por frente operativo:
   * - comercial
   * - e-commerce
   * - tiendas físicas
   *
   * Estos datos son consumidos por la vista principal
   * para construir la experiencia del dashboard.
   */
  const { commercial, ecommerce, stores } = await getRetailData();

  return (
    <PageTransition>
      <RetailPageContent
        commercial={commercial}
        ecommerce={ecommerce}
        stores={stores}
        accessLevel={accessLevel}
      />
    </PageTransition>
  );
}