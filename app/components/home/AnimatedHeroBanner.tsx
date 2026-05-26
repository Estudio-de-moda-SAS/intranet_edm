/**
 * @module AnimatedHeroBanner
 * Componente cliente que renderiza el banner principal animado del home.
 *
 * @remarks
 * Este archivo muestra una cabecera visual con saludo al usuario,
 * métricas rápidas y reloj en tiempo real.
 */

"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import UserGreetingWrapper from "@/app/components/auth/UserGreetingWrapper";

/**
 * Props del componente {@link AnimatedHeroBanner}.
 */
interface Props {
  /**
   * Usuario de respaldo usado en el saludo principal.
   */
  user: any;
}

/**
 * Variantes de animación para entrada lateral.
 */
const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

/**
 * Variantes de animación para entrada vertical.
 */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/**
 * Reloj en vivo mostrado en escritorio.
 *
 * @returns Bloque con hora y fecha actualizadas por minuto.
 */
function LiveClock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  /**
   * Actualiza hora y fecha en formato local.
   */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" }));
    };

    tick();

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

/**
 * Banner principal animado del portal corporativo.
 *
 * @param props Propiedades del componente.
 * @param props.user Usuario de respaldo para el saludo.
 * @returns Cabecera principal con fondo decorativo, saludo y reloj.
 *
 * @remarks
 * Flujo general:
 * - Renderiza un fondo decorativo con gradientes y patrones.
 * - Muestra el saludo del usuario mediante {@link UserGreetingWrapper}.
 * - Presenta indicadores rápidos del portal.
 * - Muestra un reloj en tiempo real en pantallas grandes.
 */
export function AnimatedHeroBanner({ user }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
className="relative border-b border-violet-100/80 dark:border-violet-500/15"
    >
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden rounded-none">
        <div className="absolute inset-0
                        bg-gradient-to-br from-white via-violet-50/60 to-purple-100/70
                        dark:from-[#0c0d1a] dark:via-[#1a1035] dark:to-[#150a2e]" />

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
          <div className="hidden dark:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          h-[30rem] w-[50rem] rounded-full blur-3xl bg-violet-500/[0.04]" />
        </div>

        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.18] dark:opacity-[0.12]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="home-dots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.2" className="fill-violet-600 dark:fill-violet-400" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#home-dots)" />
        </svg>

        <div className="absolute inset-x-0 top-0 h-1
                        bg-gradient-to-r from-violet-500 via-fuchsia-400 to-purple-500
                        dark:from-violet-400 dark:via-fuchsia-400 dark:to-purple-400" />

        <div className="absolute inset-x-0 bottom-0 h-16
                        bg-gradient-to-t from-[#f4f6f9]/60 to-transparent
                        dark:from-[#0d1117] dark:to-transparent" />
      </div>

      {/* Contenido */}
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

          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" animate="show">
            <LiveClock />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}