/**
 * @module CompanyHeroBanner
 * Hero principal de la sección "Conoce la Empresa".
 *
 * @remarks
 * Este componente representa la cabecera visual e informativa de la página
 * corporativa, mostrando la identidad de la empresa a través de:
 *
 * - título principal (branding institucional)
 * - subtítulo descriptivo
 * - listado de marcas del portafolio
 * - métricas clave (stats corporativos)
 *
 * Incluye animaciones progresivas usando `framer-motion` para mejorar
 * la percepción visual y jerarquía del contenido.
 *
 * Es un **Client Component** porque:
 * - utiliza animaciones (`motion`)
 * - requiere render dinámico en el cliente
 */

"use client";

import { motion } from "framer-motion";
import { companyStats } from "../config/edmStats";

/* -------------------------------------------------------------------------- */
/* Constantes                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Lista de marcas destacadas del portafolio.
 *
 * @remarks
 * Se renderiza como "pills" dentro del hero para reforzar branding.
 */
const BRANDS = [
  "Diesel",
  "Kipling",
  "Superdry",
  "Marithé + François Girbaud",
  "Pilatos",
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Banner principal de la página corporativa.
 *
 * @returns Hero animado con branding, descripción, marcas y métricas.
 *
 * @remarks
 * Este componente está estructurado en 4 bloques principales:
 *
 * 1. **Encabezado institucional**
 *    - breadcrumb contextual
 *
 * 2. **Mensaje principal**
 *    - título destacado con tipografía serif
 *    - descripción corporativa
 *
 * 3. **Marcas**
 *    - listado visual tipo "pill"
 *
 * 4. **Stats corporativos**
 *    - métricas clave renderizadas en grid dinámico
 *
 * Animaciones:
 * - Fade-in global del hero
 * - Entrada progresiva (stagger) de textos
 * - Aparición secuencial de marcas y métricas
 *
 * @example
 * ```tsx
 * <CompanyHeroBanner />
 * ```
 */
export function CompanyHeroBanner() {
  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-gradient-to-br from-violet-900 via-violet-800 to-purple-700 text-white"
    >
      {/* ============================================================ */}
      {/* Textura de fondo                                             */}
      {/* ============================================================ */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 24px)",
        }}
      />

      {/* ============================================================ */}
      {/* Contenido principal                                          */}
      {/* ============================================================ */}
      <div className="relative px-8 pt-12 pb-0 lg:px-14 lg:pt-14">

        {/* Breadcrumb */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="mb-4 text-[10px] font-semibold uppercase tracking-[0.22em] text-violet-300"
        >
          Intranet EDM · Nuestra Organización
        </motion.p>

        {/* Título principal */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="mb-5 max-w-2xl text-[40px] font-black leading-[1.08] tracking-tight text-white lg:text-[50px]"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Más de 45 años{" "}
          <em className="font-black italic text-fuchsia-300">
            transformando
          </em>{" "}
          la moda en Colombia
        </motion.h1>

        {/* Descripción */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28, duration: 0.4 }}
          className="mb-7 max-w-xl text-[15px] leading-relaxed text-violet-200/80"
        >
          Somos una empresa familiar nacida en Medellín con una pasión: inspirar
          al consumidor a verse y sentirse especial.
        </motion.p>

        {/* ---------------------------------------------------------- */}
        {/* Marcas                                                     */}
        {/* ---------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.34, duration: 0.4 }}
          className="flex flex-wrap gap-2"
        >
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="rounded-full border border-violet-400/30 bg-white/10 px-4 py-1 text-[11px] font-medium tracking-wide text-white/80 backdrop-blur-sm"
            >
              {brand}
            </span>
          ))}
        </motion.div>

        {/* ---------------------------------------------------------- */}
        {/* Estadísticas                                               */}
        {/* ---------------------------------------------------------- */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.44, duration: 0.4 }}
          className="mt-10 grid border-t border-white/10"
          style={{ gridTemplateColumns: `repeat(${companyStats.length}, 1fr)` }}
        >
          {companyStats.map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-5"
              style={{
                borderRight:
                  i < companyStats.length - 1
                    ? "1px solid rgba(255,255,255,0.1)"
                    : "none",
              }}
            >
              <p
                className="text-[30px] font-bold leading-none text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] tracking-[0.04em] text-violet-300/70">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>
    </motion.header>
  );
}