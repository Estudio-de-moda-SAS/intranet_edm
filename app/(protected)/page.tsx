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

export default async function HomePage() {
  const data = await getHomeData();

  return (
    <PageTransition>
      <HomePageContent data={data} />
    </PageTransition>
  );
}