"use client";

// ✅ CLIENT COMPONENT — solo porque necesita:
//   - motion.header / motion.div de framer-motion
//   - LiveClock con useState + useEffect
//
// Todo lo demás (estructura, estilos) ya estaba aquí,
// la diferencia es que ahora el resto de la página NO
// hereda este boundary de cliente.

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import UserGreetingWrapper from "@/app/components/auth/UserGreetingWrapper";

// ── Types ─────────────────────────────────────────────────────────

type Props = {
  user: any; // mismo tipo que data.user del HomePageContent
};

// ── Animation Variants ────────────────────────────────────────────

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── LiveClock ─────────────────────────────────────────────────────

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

    // ✅ Mejora: sincroniza al próximo minuto exacto en vez de interval cada 30s
    const msToNextMinute = 60_000 - (Date.now() % 60_000);
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      tick();
      interval = setInterval(tick, 60_000);
    }, msToNextMinute);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="hidden lg:flex flex-col items-end justify-center select-none shrink-0 gap-1">
      <div className="flex items-center gap-3">
        <div className="h-10 w-px bg-violet-200/70" />
        <div className="text-right">
          <p className="text-4xl font-light text-violet-800 tabular-nums tracking-widest leading-none">
            {time}
          </p>
          <p className="mt-1.5 text-[11px] capitalize text-slate-400 tracking-wide">{date}</p>
        </div>
      </div>
    </div>
  );
}

// ── AnimatedHeroBanner ────────────────────────────────────────────

export function AnimatedHeroBanner({ user }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative border-b border-violet-100/80"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)", marginTop: 0 }}
    >
      <div className="absolute inset-0 overflow-hidden rounded-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-violet-50/60 to-purple-100/70" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-violet-200/40 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-purple-200/30 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 h-40 w-40 rounded-full bg-fuchsia-100/40 blur-2xl" />
        </div>
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.18]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="home-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" fill="#7c3aed" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-dots)" />
        </svg>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-purple-500" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#f4f6f9]/60 to-transparent" />
      </div>

      <div className="relative px-6 py-14 lg:px-14 lg:py-20">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div variants={slideLeft} initial="hidden" animate="show" className="flex-1">
            <div className="mb-3">
              <span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-violet-500">
                Portal Corporativo
              </span>
            </div>
            <UserGreetingWrapper fallbackUser={user} />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[12px] font-medium text-emerald-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                Todos los sistemas operativos
              </span>
              <span className="rounded-full bg-violet-50 border border-violet-200 px-3 py-1 text-[12px] font-medium text-violet-500">
                6 eventos esta semana
              </span>
              <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[12px] font-medium text-amber-600">
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