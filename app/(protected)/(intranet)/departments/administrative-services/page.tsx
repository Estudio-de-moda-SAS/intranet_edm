/**
 * @module AdministrativeServicesPage
 * Página principal del módulo de Servicios Administrativos.
 *
 * Este Server Component se encarga de:
 * - Obtener el nivel de acceso del usuario (real o en modo desarrollo).
 * - Consultar los datos administrativos desde Microsoft Graph.
 * - Renderizar la vista principal del módulo mediante {@link AdminHomePage}.
 *
 * @remarks
 * Este módulo permite a los usuarios:
 * - Gestionar trámites administrativos.
 * - Descargar formatos oficiales.
 * - Consultar fechas clave del área administrativa.
 *
 * ⚠️ Este componente se ejecuta en el servidor (Server Component).
 * No utiliza `"use client"` y puede acceder directamente a lógica segura
 * como autenticación y consumo de servicios.
 */

 // ✅ SERVER COMPONENT — sin "use client"

import type { Metadata }    from "next";
import { DEV_SESSION }      from "@/lib/devSession";
import { getAdminData }     from "@/lib/graph/departments/administrative.service";
import { PageTransition }   from "@/app/components/ui/PageTransition";
import AdminHomePage        from "./components/AdminHomePage";
import { getServerAccessLevel } from "@/lib/getServerAccessLevel";

/**
 * Metadatos de la página para SEO y configuración de la vista.
 */
export const metadata: Metadata = {
  title:       "Servicios Administrativos · EDM",
  description: "Gestiona trámites, descarga formatos y consulta fechas clave del área administrativa.",
};

/**
 * Tiempo de revalidación de la página (ISR).
 *
 * La información se actualiza cada 5 minutos (300 segundos).
 */
export const revalidate = 300;

/**
 * Componente principal del módulo de Servicios Administrativos.
 *
 * @returns Página renderizada con los datos administrativos y el nivel de acceso del usuario.
 *
 * @remarks
 * Flujo de ejecución:
 * 1. Determina el nivel de acceso del usuario:
 *    - En desarrollo → usa {@link DEV_SESSION}.
 *    - En producción → usa {@link auth}.
 * 2. Obtiene los datos del módulo mediante {@link getAdminData}.
 * 3. Renderiza la vista usando {@link AdminHomePage}.
 */
export default async function AdministrativePage() {

const accessLevel = await getServerAccessLevel();
  /**
   * Datos del módulo de Servicios Administrativos obtenidos desde la API.
   */
  const data = await getAdminData();

  return (
    <PageTransition>
      <AdminHomePage data={data} accessLevel={accessLevel} />
    </PageTransition>
  );
}