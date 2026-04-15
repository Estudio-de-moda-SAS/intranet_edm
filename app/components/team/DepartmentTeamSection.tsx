/**
 * @module DepartmentTeamSection
 * Componente cliente para mostrar la sección de equipo de un departamento.
 *
 * @remarks
 * Este archivo renderiza una sección visual con:
 * - encabezado configurable,
 * - tarjetas de miembros del área,
 * - estilos temáticos por acento,
 * - animaciones de entrada,
 * - y un enlace final al directorio completo.
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { useState, useEffect } from "react";
import { Mail, Linkedin, Users } from "lucide-react";
import { DepartmentMember } from "@/types/DepartmentMember";

/**
 * Props del componente {@link DepartmentTeamSection}.
 */
interface Props {
  /**
   * Lista de miembros del departamento.
   */
  members: DepartmentMember[];

  /**
   * Configuración visual opcional del tema de la sección.
   *
   * @remarks
   * Permite personalizar colores, fondos, bordes y gradientes.
   */
  accent?: {
    sectionBg: string;
    sectionBorder: string;
    iconBg: string;
    iconColor: string;
    iconBorder: string;
    barGradient: string;
    pillBg: string;
    pillBorder: string;
    pillText: string;
    hoverBorder: string;
    dividerHover: string;
    avatarFrom: string;
    avatarTo: string;
    avatarRing: string;
    avatarRingHover: string;
    lineColor: string;
    titleColor: string;
    subtitleColor: string;
    topAccent: string;
  };

  /**
   * Título principal de la sección.
   */
  title?: string;

  /**
   * Subtítulo descriptivo de la sección.
   */
  subtitle?: string;

  /**
   * Ruta del enlace al directorio completo.
   */
  directoryHref?: string;
}

/**
 * Configuración visual por defecto para la sección.
 */
const DEFAULT_ACCENT: Required<Props>["accent"] = {
  sectionBg: "bg-white",
  sectionBorder: "border-slate-200",
  iconBg: "bg-emerald-50",
  iconColor: "text-emerald-600",
  iconBorder: "border-emerald-100",
  barGradient: "from-emerald-500 to-teal-500",
  pillBg: "bg-emerald-50",
  pillBorder: "border-emerald-100",
  pillText: "text-emerald-600",
  hoverBorder: "hover:border-emerald-200",
  dividerHover: "group-hover:bg-emerald-100",
  avatarFrom: "from-emerald-500",
  avatarTo: "to-teal-600",
  avatarRing: "ring-emerald-100",
  avatarRingHover: "group-hover:ring-emerald-200",
  lineColor: "bg-emerald-200",
  titleColor: "text-slate-900",
  subtitleColor: "text-slate-400",
  topAccent: "from-emerald-500 via-teal-400 to-cyan-500",
};

/**
 * Genera iniciales a partir del nombre del miembro.
 *
 * @param name Nombre completo.
 * @returns Iniciales en mayúscula.
 */
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * Props del componente {@link MemberAvatar}.
 */
interface MemberAvatarProps {
  /**
   * Miembro a representar visualmente.
   */
  member: DepartmentMember;

  /**
   * Configuración visual aplicada al avatar.
   */
  accent: Required<Props>["accent"];
}

/**
 * Renderiza el avatar del miembro.
 *
 * @param props Propiedades del componente.
 * @param props.member Datos del miembro.
 * @param props.accent Configuración visual.
 * @returns Imagen de perfil o avatar fallback con iniciales.
 *
 * @remarks
 * Si la imagen no existe o falla, se muestra un avatar con gradiente
 * e iniciales generadas.
 */
function MemberAvatar({
  member,
  accent,
}: MemberAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = member.image && member.image.trim() !== "" && !imgError;

  if (hasImage) {
    return (
      <Image
        src={member.image!}
        alt={member.name}
        width={96}
        height={96}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ring-4 ${accent.avatarRing} transition-all duration-300 ${accent.avatarRingHover} group-hover:scale-105`}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${accent.avatarFrom} ${accent.avatarTo} text-white text-xl font-semibold ring-4 ${accent.avatarRing} transition-all duration-300 ${accent.avatarRingHover} group-hover:scale-105 shadow-md`}
    >
      {getInitials(member.name)}
    </div>
  );
}

/**
 * Variantes de animación para cada tarjeta de miembro.
 */
const cardReveal: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
};

/**
 * Variantes de animación del contenedor.
 *
 * @remarks
 * Aplica entrada escalonada a las tarjetas hijas.
 */
const container: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

/**
 * Resuelve el color computado de una clase Tailwind de texto.
 *
 * @param twClass Clase Tailwind que define un color de texto.
 * @returns Color CSS computado o `"currentColor"` como fallback.
 *
 * @remarks
 * Se usa para sincronizar visualmente el hover del enlace al directorio.
 */
function resolveTextColor(twClass: string): string {
  if (typeof window === "undefined") return "currentColor";

  try {
    const el = document.createElement("span");
    el.className = twClass;
    el.style.cssText = "position:absolute;visibility:hidden;pointer-events:none";
    document.body.appendChild(el);
    const color = getComputedStyle(el).color;
    document.body.removeChild(el);
    return color || "currentColor";
  } catch {
    return "currentColor";
  }
}

/**
 * Props del componente {@link DirectoryLink}.
 */
interface DirectoryLinkProps {
  /**
   * Ruta de destino.
   */
  href: string;

  /**
   * Clase de color usada para derivar el color activo del enlace.
   */
  pillText: string;
}

/**
 * Renderiza el enlace al directorio completo.
 *
 * @param props Propiedades del componente.
 * @param props.href Ruta de navegación.
 * @param props.pillText Clase base para resolver el color de hover.
 * @returns Enlace estilizado hacia el directorio.
 */
function DirectoryLink({ href, pillText }: DirectoryLinkProps) {
  const [accentColor, setAccentColor] = useState("currentColor");

  useEffect(() => {
    setAccentColor(resolveTextColor(pillText));
  }, [pillText]);

  return (
    <div className="flex justify-end px-6 pb-5 -mt-2">
      <Link
        href={href}
        className="group inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors duration-200"
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.color = accentColor;
          const span = e.currentTarget.querySelector("span");
          const svg = e.currentTarget.querySelector("svg");
          if (span) (span as HTMLElement).style.borderColor = accentColor;
          if (svg) (svg as SVGElement & { style: CSSStyleDeclaration }).style.color = accentColor;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.color = "";
          const span = e.currentTarget.querySelector("span");
          const svg = e.currentTarget.querySelector("svg");
          if (span) (span as HTMLElement).style.borderColor = "";
          if (svg) (svg as SVGElement & { style: CSSStyleDeclaration }).style.color = "";
        }}
      >
        <span className="border-b border-slate-300 transition-colors duration-200">
          Ver directorio completo
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-all duration-200"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </Link>
    </div>
  );
}

/**
 * Renderiza la sección de equipo de un departamento.
 *
 * @param props Propiedades del componente.
 * @param props.members Miembros del área.
 * @param props.accent Configuración visual opcional.
 * @param props.title Título de la sección.
 * @param props.subtitle Subtítulo descriptivo.
 * @param props.directoryHref Ruta al directorio completo.
 * @returns Sección visual con tarjetas de miembros y enlace final.
 *
 * @remarks
 * Flujo general:
 * 1. Aplica un tema visual configurable mediante `accent`.
 * 2. Renderiza el encabezado con título, subtítulo y contador.
 * 3. Muestra los miembros en una grilla animada.
 * 4. Cada tarjeta incluye avatar, rol, descripción y acciones de contacto.
 * 5. Finaliza con un enlace al directorio completo.
 */
export function DepartmentTeamSection({
  members,
  accent = DEFAULT_ACCENT,
  title = "Conoce al equipo",
  subtitle = "Las personas que hacen posible el trabajo del área.",
  directoryHref = "/directory",
}: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.55,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      }}
      className={`relative rounded-2xl border ${accent.sectionBorder} ${accent.sectionBg} shadow-sm overflow-hidden`}
    >
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accent.topAccent}`}
      />

      <div className="relative px-6 pt-7 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent.iconBg} border ${accent.iconBorder}`}
          >
            <Users className={`h-4 w-4 ${accent.iconColor}`} />
          </span>

          <div>
            <h2
              className={`text-[15px] font-semibold ${accent.titleColor} leading-none`}
            >
              {title}
            </h2>
            <p className={`mt-0.5 text-[11px] ${accent.subtitleColor}`}>
              {members.length} personas en el área
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <span className={`h-px w-10 rounded-full ${accent.lineColor}`} />
          <p className={`text-[12px] ${accent.subtitleColor}`}>{subtitle}</p>
          <span className={`h-px w-10 rounded-full ${accent.lineColor}`} />
        </div>
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
        className="px-6 py-6 flex flex-wrap justify-center gap-6"
      >
        {members.map((member) => (
          <motion.div
            key={member.id}
            variants={cardReveal}
            whileHover={{ y: -6 }}
            className={`group relative rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg ${accent.hoverBorder} w-[calc(25%-18px)] min-w-[220px]`}
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="relative">
                <MemberAvatar member={member} accent={accent} />
                <div className="pointer-events-none absolute inset-0 rounded-full bg-emerald-500/0 blur-xl transition-all duration-300 group-hover:bg-emerald-400/15" />
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">{member.name}</h3>
                <p className={`text-sm font-medium ${accent.pillText}`}>
                  {member.role}
                </p>

                {member.description && (
                  <p className="mt-2 text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {member.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className={`flex items-center gap-1.5 rounded-lg ${accent.pillBg} border ${accent.pillBorder} px-3 py-1.5 text-[11px] font-semibold ${accent.pillText} transition-all duration-200 hover:bg-emerald-600 hover:text-white hover:border-emerald-600`}
                  >
                    <Mail className="h-3 w-3" />
                    Contactar
                  </a>
                )}

                {member.linkedin && (
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`LinkedIn de ${member.name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-slate-400 transition-all duration-200 hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r ${accent.barGradient} transition-all duration-300 group-hover:w-full rounded-b-xl`}
            />
          </motion.div>
        ))}
      </motion.div>

      <DirectoryLink href={directoryHref} pillText={accent.pillText} />
    </motion.section>
  );
}