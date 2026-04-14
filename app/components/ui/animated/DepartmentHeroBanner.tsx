/**
 * @module DepartmentHeroBanner
 * Componente cliente para renderizar el banner principal de una sección departamental.
 *
 * @remarks
 * Este archivo implementa un hero reutilizable con:
 * - fondo visual configurable,
 * - breadcrumb, título y subtítulo,
 * - pills informativos,
 * - acciones y enlaces CTA,
 * - animación opcional según configuración global.
 */

"use client";

// 📁 app/components/ui/animated/DepartmentHeroBanner.tsx

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

/**
 * Representa una pill informativa dentro del banner.
 *
 * @remarks
 * Tipos soportados:
 * - `status`: estado activo o en progreso.
 * - `alert`: mensaje de atención o advertencia.
 * - `info`: texto informativo general.
 */
type Pill =
  | { type: "status"; text: string }
  | { type: "alert";  text: string }
  | { type: "info";   text: string };

/**
 * Representa un enlace de acción del banner.
 */
type CtaLink = {
  /**
   * Ruta de destino.
   */
  href: string;

  /**
   * Texto visible del botón.
   */
  label: string;

  /**
   * Variante visual del CTA.
   */
  variant: "ghost" | "solid";
};

/**
 * Props del componente {@link DepartmentHeroBanner}.
 */
export interface DepartmentHeroBannerProps {
  /**
   * Texto superior de contexto o breadcrumb.
   */
  breadcrumb: string;

  /**
   * Título principal del banner.
   */
  title: string;

  /**
   * Subtítulo descriptivo.
   */
  subtitle: string;

  /**
   * Imagen de fondo opcional.
   */
  imageSrc?: string;

  /**
   * Clase Tailwind de color inicial del gradiente.
   */
  gradientFrom: string;

  /**
   * Clase Tailwind de color intermedio del gradiente.
   */
  gradientVia: string;

  /**
   * Clase Tailwind de color final del gradiente.
   */
  gradientTo: string;

  /**
   * ID único para el patrón SVG de puntos.
   */
  dotPatternId: string;

  /**
   * Pills opcionales de estado o contexto.
   */
  pills?: Pill[];

  /**
   * Enlaces CTA opcionales.
   */
  ctaLinks?: CtaLink[];

  /**
   * Acciones adicionales personalizadas.
   */
  actions?: React.ReactNode;
}

/**
 * Variantes de animación para el bloque de texto del hero.
 */
const heroText: Variants = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

/**
 * Variantes estáticas usadas cuando las animaciones están deshabilitadas.
 */
const instant: Variants = {
  hidden: { opacity: 1, x: 0 },
  show:   { opacity: 1, x: 0 },
};

/**
 * Renderiza un banner principal para una sección o departamento.
 *
 * @param props Propiedades del componente.
 * @param props.breadcrumb Texto de contexto superior.
 * @param props.title Título principal.
 * @param props.subtitle Descripción secundaria.
 * @param props.imageSrc Imagen de fondo opcional.
 * @param props.gradientFrom Color inicial del gradiente.
 * @param props.gradientVia Color intermedio del gradiente.
 * @param props.gradientTo Color final del gradiente.
 * @param props.dotPatternId ID único del patrón SVG.
 * @param props.pills Pills informativas opcionales.
 * @param props.ctaLinks Enlaces CTA opcionales.
 * @param props.actions Acciones personalizadas opcionales.
 * @returns Banner visual del departamento con contenido y acciones.
 *
 * @remarks
 * Flujo general:
 * 1. Consulta si las animaciones están habilitadas.
 * 2. Define las variantes visuales a usar.
 * 3. Renderiza el fondo con imagen opcional, gradiente y patrón decorativo.
 * 4. Muestra breadcrumb, título y subtítulo.
 * 5. Si existen, renderiza pills informativas.
 * 6. Si existen, renderiza acciones y CTA en escritorio.
 */
export function DepartmentHeroBanner({
  breadcrumb,
  title,
  subtitle,
  imageSrc,
  gradientFrom,
  gradientVia,
  gradientTo,
  dotPatternId,
  pills = [],
  ctaLinks = [],
  actions,
}: DepartmentHeroBannerProps) {
  /**
   * Indica si las animaciones globales están activadas.
   */
  const animated = useAnimationsEnabled();

  /**
   * Variantes utilizadas según el estado de animaciones.
   */
  const variants = animated ? heroText : instant;

  return (
    <motion.section
      initial={{ opacity: animated ? 0 : 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: animated ? 0.6 : 0 }}
      className="relative border-b border-slate-200/60"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {imageSrc && (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${imageSrc}')` }}
          />
        )}

        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`} />

        <svg
          aria-hidden
          className="absolute inset-0 h-full w-full opacity-[0.035]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id={dotPatternId} width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${dotPatternId})`} />
        </svg>

        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -left-12 -bottom-8 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#f4f6f9]/10 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-16 lg:px-14 lg:py-24">
        <motion.div
          variants={variants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="flex flex-col gap-3 max-w-2xl">
            <div>
              <span className="rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-white/60 backdrop-blur-sm">
                {breadcrumb}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight lg:text-4xl">
              {title}
            </h1>

            <p className="text-white/70 text-[15px] leading-relaxed">
              {subtitle}
            </p>

            {pills.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {pills.map((pill, i) =>
                  pill.type === "status" ? (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[12px] font-medium text-white/80 backdrop-blur-sm"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                      {pill.text}
                    </span>
                  ) : pill.type === "alert" ? (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-[12px] font-medium text-rose-300 backdrop-blur-sm"
                    >
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                      </span>
                      {pill.text}
                    </span>
                  ) : (
                    <span
                      key={i}
                      className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-[12px] font-medium text-white/55 backdrop-blur-sm"
                    >
                      {pill.text}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          {(actions || ctaLinks.length > 0) && (
            <div className="hidden md:flex items-center gap-3 shrink-0 pb-1">
              {actions}

              {ctaLinks.map((cta) =>
                cta.variant === "ghost" ? (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    {cta.label}
                  </Link>
                ) : (
                  <Link
                    key={cta.href}
                    href={cta.href}
                    className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
                  >
                    {cta.label}
                  </Link>
                )
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.section>
  );
}