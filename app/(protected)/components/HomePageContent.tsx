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
import { EdmNewsSection }     from "@/app/components/home/edm-news/EdmNewsSection";
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
 *    - columna izquierda: EDM News (7/12) + Mi espacio de trabajo (5/12) + solicitudes
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
  const SHOW_FAVORITES_CARD = false;
  const SHOW_LEADERS_SECTION = false;
  const SHOW_KPI_STRIP = false;
  const SHOW_FEEDBACK_PANEL = false;

  const SHOW_SIDEBAR =
  SHOW_FAVORITES_CARD ||
  SHOW_TASKS_CARD ||
  SHOW_RECOGNITIONS_CARD ||
  SHOW_EVENTS_SECTION ||
  SHOW_BIRTHDYAS_CARD;

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

<div className="px-6 pb-10 pt-6 lg:pt-8">

        {/* ========================================================== */}
        {/* KPI Strip                                                  */}
        {/* ========================================================== */}
        {SHOW_KPI_STRIP && <AnimatedKPIStrip />}

        {/* ========================================================== */}
        {/* Grid principal                                             */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

          {/* -------------------------------------------------------- */}
          {/* Columna izquierda: EDM News + workspace + solicitudes    */}
          {/* -------------------------------------------------------- */}
          <div
  className={`
    flex flex-col gap-6 order-1 lg:order-none
    ${SHOW_SIDEBAR ? "lg:col-span-9 lg:w-[96%]" : "lg:col-span-12"}
  `}
>
            {/* ------------------------------------------------------ */}
            {/* EDM News + Mi espacio de trabajo (lado a lado)         */}
            {/* ------------------------------------------------------ */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-7">
                <AnimatedCard delay={0}>
                  <EdmNewsSection />
                </AnimatedCard>
              </div>
              <div className="lg:col-span-5">
                <AnimatedCard delay={0.04}>
                  <NewsSection announcements={data.announcements} />
                </AnimatedCard>
              </div>
            </div>

            {SHOW_REQUESTS_PANEL && (
            <AnimatedCard delay={0.08}>
              <RequestsPanel />
            </AnimatedCard>
            )}
          </div>

          {/* -------------------------------------------------------- */}
          {/* Sidebar                                                  */}
          {/* -------------------------------------------------------- */}
          {SHOW_SIDEBAR && (<aside className="lg:col-span-3 flex flex-col gap-5 lg:w-[112%] lg:-ml-[12%] order-2 lg:order-none">

           {/* Favoritos */}
{SHOW_FAVORITES_CARD && (
  <AnimatedCard delay={0.08}>
    <FavoritesCard />
  </AnimatedCard>
)}
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
          )}
        </div>

        {/* ========================================================== */}
        {/* Sección de líderes                                         */}
        {/* ========================================================== */}
        {SHOW_LEADERS_SECTION && (
          <AnimatedViewCard className="mt-6">
            <LeadersSection leaders={homeLeaders} />
          </AnimatedViewCard>
        )}

        {/* ========================================================== */}
        {/* Panel de feedback                                          */}
        {/* ========================================================== */}
        {SHOW_FEEDBACK_PANEL && (
          <AnimatedViewCard className="mt-6">
            <FeedbackPanel />
          </AnimatedViewCard>
        )}

      </div>
    </main>
  );
}