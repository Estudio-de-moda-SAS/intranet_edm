"use client";

// 📁 app/components/ui/animated/DepartmentHeroBanner.tsx

import { motion, type Variants } from "framer-motion";
import Link from "next/link";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

type Pill =
  | { type: "status"; text: string }
  | { type: "alert";  text: string }
  | { type: "info";   text: string };

type CtaLink = {
  href:    string;
  label:   string;
  variant: "ghost" | "solid";
};

export type DepartmentHeroBannerProps = {
  breadcrumb:   string;
  title:        string;
  subtitle:     string;
  imageSrc?:    string;
  gradientFrom: string;
  gradientVia:  string;
  gradientTo:   string;
  dotPatternId: string;
  pills?:       Pill[];
  ctaLinks?:    CtaLink[];
  actions?:     React.ReactNode;
};

const heroText: Variants = {
  hidden: { opacity: 0, x: -24 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const instant: Variants = {
  hidden: { opacity: 1, x: 0 },
  show:   { opacity: 1, x: 0 },
};

export function DepartmentHeroBanner({
  breadcrumb, title, subtitle, imageSrc,
  gradientFrom, gradientVia, gradientTo,
  dotPatternId, pills = [], ctaLinks = [], actions,
}: DepartmentHeroBannerProps) {
  const animated = useAnimationsEnabled();
  const variants = animated ? heroText : instant;

  return (
    <motion.section
      initial={{ opacity: animated ? 0 : 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: animated ? 0.6 : 0 }}
      className="relative border-b border-slate-200/60"
      style={{ width: "100vw", marginLeft: "calc(50% - 50vw)" }}
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 overflow-hidden">
        {imageSrc && (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${imageSrc}')` }} />
        )}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientVia} ${gradientTo}`} />
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
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

      {/* CONTENT */}
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
            <h1 className="text-3xl font-bold text-white tracking-tight leading-tight lg:text-4xl">{title}</h1>
            <p className="text-white/70 text-[15px] leading-relaxed">{subtitle}</p>

            {pills.length > 0 && (
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {pills.map((pill, i) =>
                  pill.type === "status" ? (
                    <span key={i} className="flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-[12px] font-medium text-white/80 backdrop-blur-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
                      </span>
                      {pill.text}
                    </span>
                  ) : pill.type === "alert" ? (
                    <span key={i} className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-400/30 px-3 py-1 text-[12px] font-medium text-rose-300 backdrop-blur-sm">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-400" />
                      </span>
                      {pill.text}
                    </span>
                  ) : (
                    <span key={i} className="rounded-full bg-white/8 border border-white/15 px-3 py-1 text-[12px] font-medium text-white/55 backdrop-blur-sm">
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
                  <Link key={cta.href} href={cta.href} className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20">
                    {cta.label}
                  </Link>
                ) : (
                  <Link key={cta.href} href={cta.href} className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50">
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
