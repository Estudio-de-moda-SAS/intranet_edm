"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import UserGreetingWrapper from "@/app/components/auth/UserGreetingWrapper";

type Props = { user: any };

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }));
    };
    tick();
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => { tick(); interval = setInterval(tick, 60_000); }, msToNextMinute);
    return () => { clearTimeout(timeout); clearInterval(interval); };
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end justify-center select-none shrink-0 gap-1">
      <div className="flex items-center gap-3">
        <div className="h-10 w-px
                        bg-violet-200/70
                        dark:bg-violet-400/30" />
        <div className="text-right">
          <p className="text-4xl font-light tabular-nums tracking-widest leading-none
                        text-violet-800
                        dark:text-violet-200">
            {time}
          </p>
          <p className="mt-1.5 text-[11px] capitalize tracking-wide
                        text-slate-400
                        dark:text-violet-300/50">
            {date}
          </p>
        </div>
      </div>
    </div>
  );
}

export function AnimatedHeroBanner({ user }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative border-b
                 border-violet-100/80
                 dark:border-violet-500/15"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginTop: 0 }}
    >
      {/* ── Background ── */}
      <div className="absolute inset-0 overflow-hidden rounded-none">

        {/* Base gradient */}
        <div className="absolute inset-0
                        bg-gradient-to-br from-white via-violet-50/60 to-purple-100/70
                        dark:from-[#0c0d1a] dark:via-[#1a1035] dark:to-[#150a2e]" />

        {/* Glow orbs — strong presence in dark */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full blur-3xl
                          bg-violet-200/40
                          dark:bg-violet-600/20" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full blur-3xl
                          bg-purple-200/30
                          dark:bg-purple-500/15" />
          <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full blur-2xl
                          bg-fuchsia-100/40
                          dark:bg-fuchsia-500/10" />
          {/* Dark-only center glow */}
          <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          h-[30rem] w-[50rem] rounded-full blur-3xl bg-violet-500/[0.04]" />
        </div>

        {/* Dot pattern */}
        <svg aria-hidden
             className="absolute inset-0 h-full w-full opacity-[0.18] dark:opacity-[0.12]"
             xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="home-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" className="fill-violet-600 dark:fill-violet-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-dots)" />
        </svg>

        {/* Top accent line */}
        <div className="absolute inset-x-0 top-0 h-1
                        bg-gradient-to-r from-violet-500 via-fuchsia-400 to-purple-500
                        dark:from-violet-400 dark:via-fuchsia-400 dark:to-purple-400" />

        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-16
                        bg-gradient-to-t from-[#f4f6f9]/60 to-transparent
                        dark:from-[#0d1117] dark:to-transparent" />
      </div>

      {/* ── Content ── */}
      <div className="relative px-6 py-14 lg:px-14 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

          <motion.div variants={slideLeft} initial="hidden" animate="show" className="flex-1">
            <div className="mb-3">
              <span className="rounded-full border px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest
                               border-violet-200 bg-violet-50 text-violet-500
                               dark:border-violet-400/30 dark:bg-violet-500/15 dark:text-violet-300">
                Portal Corporativo
              </span>
            </div>

            <UserGreetingWrapper fallbackUser={user} />

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border px-3 py-1 text-[12px] font-medium
                               bg-violet-50 border-violet-200 text-violet-500
                               dark:bg-violet-500/15 dark:border-violet-400/25 dark:text-violet-300">
                6 eventos esta semana
              </span>
              <span className="rounded-full border px-3 py-1 text-[12px] font-medium
                               bg-amber-50 border-amber-200 text-amber-600
                               dark:bg-amber-500/15 dark:border-amber-400/25 dark:text-amber-300">
                13 noticias sin leer
              </span>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <LiveClock />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}