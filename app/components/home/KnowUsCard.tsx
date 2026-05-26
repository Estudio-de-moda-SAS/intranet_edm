/**
 * @module KnowUsCard
 * Componente cliente para mostrar una tarjeta destacada de acceso
 * a la sección “Conoce más la empresa”.
 *
 * @remarks
 * Este archivo renderiza una tarjeta visual interactiva con fondo dinámico,
 * efectos decorativos y una lista de aspectos destacados de la organización.
 */

"use client";

import { Building2, ArrowRight, Users, Globe, Award } from "lucide-react";
import Link from "next/link";

/**
 * Lista de elementos destacados mostrados al hacer hover.
 */
const HIGHLIGHTS = [
  { icon: Users, label: "Nuestra cultura" },
  { icon: Globe, label: "Presencia global" },
  { icon: Award, label: "Valores y misión" },
];

/**
 * Props del componente {@link KnowUsCard}.
 */
interface KnowUsCardProps {
  /**
   * Imagen de fondo opcional para la tarjeta.
   */
  backgroundImage?: string;

  /**
   * Opacidad del overlay oscuro aplicado sobre el fondo.
   *
   * @defaultValue 30
   */
  overlayOpacity?: number;

  /**
   * Gradiente de respaldo usado cuando no hay imagen.
   */
  fallbackGradient?: string;

  /**
   * Ruta de navegación al hacer clic en la tarjeta.
   *
   * @defaultValue "/know-us"
   */
  href?: string;
}

/**
 * Renderiza una tarjeta promocional de navegación hacia la sección institucional.
 *
 * @param props Propiedades del componente.
 * @param props.backgroundImage Imagen de fondo opcional.
 * @param props.overlayOpacity Opacidad del overlay oscuro.
 * @param props.fallbackGradient Gradiente alternativo sin imagen.
 * @param props.href Ruta de destino.
 * @returns Tarjeta interactiva con contenido institucional.
 *
 * @remarks
 * - Usa una imagen de fondo si está disponible.
 * - Si no hay imagen, aplica un gradiente decorativo.
 * - Muestra highlights adicionales al hacer hover.
 */
export function KnowUsCard({
  backgroundImage,
  overlayOpacity = 30,
  fallbackGradient = "linear-gradient(135deg, #7c3aed 0%, #9333ea 35%, #c026d3 68%, #581c87 100%)",
  href = "/know-us",
}: KnowUsCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl shadow-lg shadow-violet-500/20 ring-1 ring-violet-400/25 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/35 hover:ring-violet-400/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {/* Fondo: imagen o gradiente */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-105"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          background: backgroundImage ? undefined : fallbackGradient,
        }}
      />

      {/* Overlay principal */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/10" />

      {/* Gradiente inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />

      {/* Glow superior */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(255,255,255,0.14) 0%, transparent 35%)",
        }}
      />

{/* Watermark corporativo */}
<div className="pointer-events-none absolute inset-0 flex items-center justify-center">
  <img
    src="/brand/logoEDM.png"
    alt=""
    aria-hidden="true"
    className="
      h-[320px] w-[320px]
      object-contain
      opacity-[0.14]
      transition-all duration-700
      group-hover:scale-105
      group-hover:opacity-[0.18]
    "
  />
</div>
      {/* Orbes decorativos */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-36 w-36 rounded-full bg-fuchsia-400/20 blur-2xl transition-transform duration-700 group-hover:scale-125" />

      <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-violet-300/15 blur-xl transition-transform duration-700 group-hover:scale-125" />

      {/* Encabezado */}
      <div className="relative z-10 flex items-start justify-between p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md transition-all duration-300 group-hover:bg-white/20">
          <Building2 className="h-4 w-4 text-white" />
        </div>

        <span className="flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md transition-all duration-300 group-hover:bg-white/25 group-hover:gap-2">
          Explorar

          <ArrowRight className="h-2.5 w-2.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* Contenido inferior */}
      <div className="relative z-10 p-5 pt-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-fuchsia-200/90">
          Nuestra organización
        </p>

        <h3
          className="mt-1 text-[26px] font-black leading-[1.05] text-white"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Descubre
          <br />
          EDM
        </h3>

        <ul className="mt-4 flex flex-col gap-2 overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10 backdrop-blur-sm">
                <Icon className="h-3.5 w-3.5 text-white" />
              </span>

              <span className="text-xs font-medium text-white/90">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}