/**
 * @module AnimatedHeroBanner
 * Banner principal del home: saludo, ícono distintivo y reloj.
 *
 * @remarks
 * Simplificado respecto a la versión original: un solo fondo decorativo
 * (antes había dos, uno aquí y otro duplicado dentro de GreetingCard),
 * sin eyebrow "Portal Corporativo"/"Intranet EDM" (se quitó por pedido,
 * ya no aportaba), sin patrones de puntos ni orbes difuminados, y sin la
 * barra superior de gradiente arcoíris.
 *
 * El fondo usa clases de Tailwind normales (bg-violet-100 / dark:bg-[hex])
 * en vez de `style` inline — se evitó a propósito el modificador de
 * opacidad `/valor` (ej. `bg-violet-100/70`), que en este proyecto no se
 * estaba aplicando en el navegador por un problema de especificidad. Los
 * tonos sólidos sin opacidad sí funcionan de forma consistente en el
 * resto de módulos (Tableros, Aplicaciones, Organigrama), así que se
 * mantiene esa misma convención aquí.
 *
 * El ícono cuadrado junto al saludo replica el mismo patrón visual usado
 * en Tableros/Aplicaciones/Organigrama (h-9/h-10 + rounded-xl + acento
 * violeta), para que el banner conserve un elemento distintivo propio sin
 * volver a acumular las capas decorativas que tenía antes.
 */

"use client";

import { motion, type Variants } from "framer-motion";
import { useEffect, useState } from "react";
import UserGreetingWrapper from "@/app/components/auth/UserGreetingWrapper";
import { Sparkles } from "lucide-react";
import { TrmButton } from "@/app/components/home/TrmButton";

interface Props {
  /** Usuario de respaldo usado en el saludo principal. */
  user: any;
}

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/**
 * Reloj en vivo mostrado en escritorio.
 */
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
    <div className="hidden lg:flex items-center gap-3 shrink-0 select-none">
      <div className="h-9 w-px bg-violet-200/70 dark:bg-violet-400/20" />
      <div className="text-right">
        <p className="text-xl font-medium tabular-nums leading-none text-violet-800 dark:text-violet-200">
          {time}
        </p>
        <p className="mt-1 text-[11px] capitalize tracking-wide text-slate-400 dark:text-violet-300/50">
          {date}
        </p>
      </div>
    </div>
  );
}

/**
 * Banner principal del portal corporativo.
 */
export function AnimatedHeroBanner({ user }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden bg-violet-100 dark:bg-[#1a1030]"
    >
      <div className="relative px-6 py-6 lg:px-14 lg:py-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate="show"
            className="flex flex-1 items-center gap-3"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-violet-500/10">
              <Sparkles className="h-4.5 w-4.5 text-violet-600 dark:text-violet-300" />
            </span>

            <UserGreetingWrapper fallbackUser={user} />
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="flex items-center gap-4"
          >
            <TrmButton />
            <LiveClock />
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}