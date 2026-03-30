"use client";

import { Building2, ArrowRight, Users, Globe, Award } from "lucide-react";
import Link from "next/link";

const HIGHLIGHTS = [
  { icon: Users,  label: "Nuestra cultura"  },
  { icon: Globe,  label: "Presencia global" },
  { icon: Award,  label: "Valores y misión" },
];

interface KnowUsCardProps {
  backgroundImage?: string;
  overlayOpacity?: number;
  fallbackGradient?: string;
  href?: string;
}

export function KnowUsCard({
  backgroundImage,
  overlayOpacity = 30,
  fallbackGradient = "linear-gradient(135deg, #8b5cf6 0%, #a855f7 35%, #d946ef 65%, #c026d3 100%)",
  href = "/know-us",
}: KnowUsCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl shadow-lg shadow-violet-500/25 ring-1 ring-violet-400/30 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/40 hover:ring-violet-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {/* ── Background: imagen o gradiente ── */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-in-out group-hover:scale-110"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          background: backgroundImage ? undefined : fallbackGradient,
        }}
      />

      {/* ── Overlay oscuro (más fuerte en hover) ── */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{ background: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />
      <div className="absolute inset-0 bg-black/0 transition-all duration-500 group-hover:bg-black/20" />

      {/* ── Gradiente bottom para texto ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      {/* ── Orbes decorativos vivos ── */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-purple-400/25 blur-xl transition-transform duration-700 group-hover:scale-125" />
      <div className="pointer-events-none absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-violet-300/20 blur-lg transition-transform duration-700 group-hover:scale-125" />
      {/* Destello central en hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(ellipse at 60% 20%, rgba(192,132,252,0.18) 0%, transparent 65%)" }}
      />

      {/* ── Header ── */}
      <div className="relative z-10 flex items-start justify-between p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 group-hover:gap-2">
          Explorar <ArrowRight className="h-2.5 w-2.5 transition-transform duration-300 group-hover:translate-x-0.5" />
        </span>
      </div>

      {/* ── Footer ── */}
      <div className="relative z-10 p-4 pt-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200">
          Nuestra organización
        </p>
        <h3
          className="mt-0.5 text-sm font-black leading-snug text-white"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Conoce más<br />la empresa
        </h3>

        <ul className="mt-3 flex flex-col gap-1.5 overflow-hidden transition-all duration-500 max-h-0 opacity-0 group-hover:max-h-40 group-hover:opacity-100">
          {HIGHLIGHTS.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-fuchsia-400/40 ring-1 ring-fuchsia-300/30">
                <Icon className="h-3 w-3 text-white" />
              </span>
              <span className="text-[11px] font-medium text-white/90">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </Link>
  );
}