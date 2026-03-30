// ✅ SERVER COMPONENT — sin "use client"

import { CompanyHeroBanner }     from "../components/KnowUsHeroBanner";
import { CompanyHistorySection }  from "../components/EdmHistorySection";
import { CompanyValuesSection }   from "../components/EdmValuesSection";
import { CompanyLeadersSection }  from "../components/EdmLeadersSection";
import { CompanyBrandsSection }   from "../components/EdmBrandsSection";
import { CompanyCanalesSection }  from "../components/EdmCanalesSection";
import { AnimatedCard }           from "@/app/components/ui/animated/AnimatedCard";
import { AnimatedViewCard }       from "@/app/components/ui/animated/AnimatedViewCard";

export function CompanyPageContent() {
  return (
    <main
      className="min-h-screen w-full bg-slate-50"
      style={{
        fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
        marginTop: "calc(-1 * var(--layout-pt, 0px))",
      }}
    >
      <CompanyHeroBanner />

      <div className="flex flex-col gap-6 px-4 pb-12 pt-6 lg:px-14">

        <AnimatedCard delay={0}>
          <CompanyHistorySection />
        </AnimatedCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AnimatedCard delay={0.08}>
            <CompanyValuesSection />
          </AnimatedCard>
          <AnimatedCard delay={0.14}>
            <CompanyLeadersSection />
          </AnimatedCard>
        </div>

        <AnimatedViewCard>
          <CompanyBrandsSection />
        </AnimatedViewCard>

        <AnimatedViewCard>
          <CompanyCanalesSection />
        </AnimatedViewCard>

        {/* Footer */}
        <footer className="flex items-center justify-between rounded-2xl bg-violet-900 px-7 py-5">
          <p className="text-[12px] text-violet-300/70">
            Estudio de Moda S.A.S. · Medellín, Colombia · Fundada 1980
          </p>
          <p className="text-[13px] font-semibold tracking-wide text-violet-200">
            #EDMBeHappy
          </p>
        </footer>

      </div>
    </main>
  );
}