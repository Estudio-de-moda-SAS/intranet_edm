"use client";

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import HRHeroKPIs from "./HRHeroKPIs";

const titleVariant: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

const actionsVariant: Variants = {
  hidden: { opacity: 0, x: 12 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HRHeroBanner() {
  return (
    <section
      className="relative overflow-hidden border-b border-slate-200"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hr-banner.jpg')" }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-rose-900/80 via-violet-900/70 to-violet-700/60" />

      {/* Dot grid */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hr-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.5" fill="white" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hr-dots)" />
      </svg>

      {/* Glows */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-rose-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/3 h-48 w-48 rounded-full bg-violet-400/15 blur-2xl" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Content */}
      <div className="relative px-6 py-10 lg:px-14 lg:py-14">
        {/* Title + actions */}
        <div className="flex flex-col gap-1 lg:flex-row lg:items-end lg:justify-between">

          <motion.div variants={titleVariant} initial="hidden" animate="show">
            <div className="mb-1">
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/70 backdrop-blur-sm">
                Área
              </span>
            </div>

            <h1 className="text-4xl font-bold text-white tracking-tight leading-none">
              Recursos Humanos
            </h1>

            <p className="mt-2 text-rose-100 text-base">
              Gestión de personas, nómina, reclutamiento y bienestar organizacional.
            </p>
          </motion.div>

          <motion.div
            variants={actionsVariant}
            initial="hidden"
            animate="show"
            className="hidden md:flex items-center gap-3 pb-1"
          >
            <Link
              href="/rrhh/empleados/nuevo"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Nuevo empleado
            </Link>

            <Link
              href="/rrhh/nomina"
              className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-violet-900 shadow-sm transition hover:bg-violet-50"
            >
              Procesar nómina
            </Link>
          </motion.div>

        </div>

        {/* Divider */}
        <motion.div
          className="my-8 h-px bg-white/[0.08]"
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
          style={{ originX: 0 }}
        />

        {/* KPI strip */}
        <HRHeroKPIs />
      </div>
    </section>
  );
}