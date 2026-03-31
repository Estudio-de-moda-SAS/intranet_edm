// ✅ SERVER COMPONENT — sin "use client"

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

type Props = { data: any };

export function HomePageContent({ data }: Props) {
  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        marginTop: "calc(-1 * var(--layout-pt, 0px))",
      }}
    >
      <AnimatedHeroBanner user={data.user} />

      <div className="px-4 pb-10 lg:px-14">

        <AnimatedKPIStrip />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

{/* Left column — News + Solicitudes */}
<div className="flex flex-col gap-6 lg:col-span-9 lg:w-[96%] order-1 lg:order-none">
  <AnimatedCard delay={0}>
    <NewsSection announcements={data.announcements} />
  </AnimatedCard>

  <AnimatedCard delay={0.08}>
    <RequestsPanel />
  </AnimatedCard>
</div>

{/* Aside */}
<aside className="lg:col-span-3 flex flex-col gap-5 lg:w-[112%] lg:-ml-[12%] order-2 lg:order-none">
            {/* 1. Favoritos */}
            <AnimatedCard delay={0.08}>
              <FavoritesCard />
            </AnimatedCard>

            {/* 2. Tareas */}
            <AnimatedCard delay={0.20}>
              <TasksCard tasks={data.tasks} />
            </AnimatedCard>

            {/* 3. Reconocimientos */}
            <AnimatedCard delay={0.24}>
              <RecognitionsCard recognitions={data.recognitions ?? MOCK_RECOGNITIONS} />
            </AnimatedCard>

            <AnimatedCard delay={0.12}>
              <EventsSection events={data.events} />
            </AnimatedCard>

            {/* 4. Cumpleaños */}
            <AnimatedCard delay={0.28}>
              <BirthdaysCard birthdays={data.birthdays} />
            </AnimatedCard>

          </aside>

        </div>

        {/* LeadersSection */}
        <AnimatedViewCard className="mt-6">
          <LeadersSection leaders={homeLeaders} />
        </AnimatedViewCard>

        {/* FeedbackPanel — ancho completo debajo de Leaders */}
        <AnimatedViewCard className="mt-6">
          <FeedbackPanel />
        </AnimatedViewCard>

      </div>
    </main>
  );
}