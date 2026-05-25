/**
 * @module HomePageContent
 * Composición principal del Home de la intranet.
 *
 * @remarks
 * Este componente actúa como el layout base del Home, organizando
 * y renderizando las diferentes secciones de la página principal.
 *
 * Es un **Server Component**, por lo que:
 *
 * - no maneja estado local
 * - no utiliza hooks de cliente
 * - recibe los datos ya preparados desde el servidor
 *
 * Su responsabilidad es exclusivamente de **composición de UI**,
 * delegando la lógica y renderizado específico a subcomponentes.
 */

// app/(protected)/(intranet)/home/HomePageContent.tsx

import { NewsSection }        from "@/app/components/home/news/NewsSection";
import { EventsSection }      from "@/app/components/home/EventsSection";
import { TasksCard }          from "@/app/components/home/TasksCard";
import { BirthdaysCard }      from "@/app/components/home/BirthdaysCard";
import { LeadersSection }     from "@/app/components/home/LeadersSection";
import { homeLeaders }        from "@/app/components/home/config/homeLeaders";

import { FavoritesCard }      from "@/app/components/home/FavoritesCard";
import { FeedbackPanel }      from "@/app/components/home/FeedbackPanel";
import { RequestsPanel }      from "@/app/components/home/RequestsPanel";
import { RecognitionsCard }   from "@/app/components/home/RecognitionCenterCard";
import { MOCK_RECOGNITIONS }  from "@/lib/recognitions";

import { AnimatedHeroBanner } from "@/app/components/home/AnimatedHeroBanner";
import { AnimatedKPIStrip }   from "@/app/components/home/AnimatedKPIStrip";
import { AnimatedCard }       from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedViewCard }   from "@/app/components/ui/animated/AnimatedViewCard";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link HomePageContent}.
 *
 * @property data Datos agregados necesarios para renderizar el Home.
 *
 * @remarks
 * Este objeto normalmente proviene de una capa superior (server-side),
 * e incluye información como:
 *
 * - usuario autenticado
 * - anuncios
 * - tareas
 * - eventos
 * - cumpleaños
 * - reconocimientos
 *
 * Idealmente, este tipo debería tiparse explícitamente en lugar de `any`
 * para mejorar la mantenibilidad y el autocompletado.
 */
type HomePageContentProps = {
  data: any;
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Contenido principal del Home de la intranet.
 *
 * @param props Propiedades del componente.
 * @returns Layout completo del Home con todas sus secciones.
 *
 * @remarks
 * Este componente:
 *
 * - organiza la estructura visual del Home
 * - distribuye contenido en columnas responsivas
 * - aplica contenedores animados para mejorar la experiencia de usuario
 *
 * Estructura general:
 *
 * 1. Hero banner (bienvenida)
 * 2. KPI strip
 * 3. Grid principal:
 *    - columna izquierda: noticias + solicitudes
 *    - sidebar: favoritos, tareas, reconocimientos, eventos, cumpleaños
 * 4. Sección de líderes
 * 5. Panel de feedback
 *
 * No contiene lógica de negocio directa.
 *
 * @example
 * ```tsx
 * <HomePageContent data={homeData} />
 * ```
 */
export function HomePageContent({ data }: HomePageContentProps) {
  const SHOW_REQUESTS_PANEL = false;
  const SHOW_BIRTHDYAS_CARD = false;
  const SHOW_RECOGNITIONS_CARD = false;
  const SHOW_EVENTS_SECTION = false;
  const SHOW_TASKS_CARD = false;
  return (
    <main
      className="min-h-screen w-full"
      style={{
        fontFamily:
          "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        marginTop: "calc(-1 * var(--layout-pt, 0px))",
        backgroundColor: "var(--bg-base)",
      }}
    >
      {/* ============================================================ */}
      {/* Hero Banner                                                  */}
      {/* ============================================================ */}
      <AnimatedHeroBanner user={data.user} />

<div className="px-6 pb-10">

        {/* ========================================================== */}
        {/* KPI Strip                                                  */}
        {/* ========================================================== */}
        <AnimatedKPIStrip />

        {/* ========================================================== */}
        {/* Grid principal                                             */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* -------------------------------------------------------- */}
          {/* Columna izquierda: noticias + solicitudes                */}
          {/* -------------------------------------------------------- */}
          <div className="flex flex-col gap-6 lg:col-span-9 lg:w-[96%] order-1 lg:order-none">

            <AnimatedCard delay={0}>
              <NewsSection announcements={data.announcements} />
            </AnimatedCard>

            {SHOW_REQUESTS_PANEL && (
            <AnimatedCard delay={0.08}>
              <RequestsPanel />
            </AnimatedCard>
            )}
          </div>

          {/* -------------------------------------------------------- */}
          {/* Sidebar                                                  */}
          {/* -------------------------------------------------------- */}
          <aside className="lg:col-span-3 flex flex-col gap-5 lg:w-[112%] lg:-ml-[12%] order-2 lg:order-none">

            {/* Favoritos */}
            <AnimatedCard delay={0.08}>
              <FavoritesCard />
            </AnimatedCard>

            {/* Tareas */}
            {SHOW_TASKS_CARD && (
              <AnimatedCard delay={0.20}>
                <TasksCard tasks={data.tasks} />
              </AnimatedCard>
            )}

            {/* Reconocimientos */}
            {SHOW_RECOGNITIONS_CARD && (
              <AnimatedCard delay={0.24}>
                <RecognitionsCard
                  recognitions={data.recognitions ?? MOCK_RECOGNITIONS}
                />
              </AnimatedCard>
            )}

            {/* Eventos */}
            {SHOW_EVENTS_SECTION && (
              <AnimatedCard delay={0.12}>
                <EventsSection events={data.events} />
              </AnimatedCard>
            )}

            {/* Cumpleaños */}
            {SHOW_BIRTHDYAS_CARD && (
              <AnimatedCard delay={0.28}>
                <BirthdaysCard birthdays={data.birthdays} />
              </AnimatedCard>
            )}

          </aside>
        </div>

        {/* ========================================================== */}
        {/* Sección de líderes                                         */}
        {/* ========================================================== */}
        <AnimatedViewCard className="mt-6">
          <LeadersSection leaders={homeLeaders} />
        </AnimatedViewCard>

        {/* ========================================================== */}
        {/* Panel de feedback                                          */}
        {/* ========================================================== */}
        <AnimatedViewCard className="mt-6">
          <FeedbackPanel />
        </AnimatedViewCard>

      </div>
    </main>
  );
}