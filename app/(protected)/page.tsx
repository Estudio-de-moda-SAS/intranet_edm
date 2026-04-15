/**
 * @module HomePage
 * Página principal de la intranet (Home).
 *
 * @remarks
 * Este archivo define un **Server Component puro** que actúa como punto
 * de entrada para la vista principal de la aplicación.
 *
 * Responsabilidades principales:
 *
 * 1. Obtener los datos necesarios desde el servidor mediante {@link getHomeData}.
 * 2. Pasar dichos datos al componente de presentación {@link HomePageContent}.
 * 3. Envolver la página en {@link PageTransition} para manejar animaciones
 *    de entrada entre rutas.
 *
 * @architecture
 * Este componente forma parte de la capa de **orquestación del servidor**:
 *
 * - No contiene estado cliente.
 * - No utiliza hooks de React.
 * - Reduce la cantidad de JavaScript enviado al navegador.
 *
 * Además, al delegar la lógica visual en `HomePageContent` (también Server Component),
 * se optimiza el rendimiento general de la página.
 *
 * @example
 * ```tsx
 * export default async function HomePage() {
 *   const data = await getHomeData();
 *
 *   return (
 *     <PageTransition>
 *       <HomePageContent data={data} />
 *     </PageTransition>
 *   );
 * }
 * ```
 */

// ✅ SERVER COMPONENT — sin cambios estructurales.
//
// Este archivo ya estaba bien. Es un Server Component puro que:
//   1. Fetcha datos en servidor con getHomeData()
//   2. Pasa los datos a HomePageContent como props
//   3. Envuelve en PageTransition para la animación de entrada de página
//
// El único cambio es que ahora HomePageContent también es Server Component,
// así que el árbol de servidor es más profundo y se envía menos JS al cliente.

import { getHomeData } from "@/lib/graph/home.service";
import { HomePageContent } from "./components/HomePageContent";
import { PageTransition } from "@/app/components/ui/PageTransition";

/**
 * Componente principal de la página Home.
 *
 * @returns Página renderizada con datos obtenidos en servidor.
 *
 * @remarks
 * - Ejecuta `getHomeData()` en el servidor.
 * - No hidrata lógica innecesaria en el cliente.
 * - Mantiene separación clara entre datos y presentación.
 */
export default async function HomePage() {
  const data = await getHomeData();

  return (
    <PageTransition>
      <HomePageContent data={data} />
    </PageTransition>
  );
}