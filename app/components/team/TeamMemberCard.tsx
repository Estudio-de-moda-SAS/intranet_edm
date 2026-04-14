/**
 * @module TeamMemberCard
 * Componente cliente para mostrar la información resumida de un integrante del equipo.
 *
 * @remarks
 * Este archivo renderiza una tarjeta individual con animación de entrada,
 * avatar, cargo, departamento, biografía y accesos de contacto.
 */

"use client";

import { motion } from "framer-motion";
import { Mail, Linkedin, Building2 } from "lucide-react";
import { TeamMember } from "./types";

/**
 * Props del componente {@link TeamMemberCard}.
 */
interface Props {
  /**
   * Información del integrante a renderizar.
   */
  member: TeamMember;

  /**
   * Índice opcional usado para escalonar la animación.
   *
   * @defaultValue 0
   */
  index?: number;
}

/**
 * Renderiza una tarjeta individual de miembro del equipo.
 *
 * @param props Propiedades del componente.
 * @param props.member Datos del integrante.
 * @param props.index Índice usado para el delay de animación.
 * @returns Tarjeta visual con información resumida y acciones de contacto.
 *
 * @remarks
 * Flujo general:
 * 1. Aplica una animación de entrada con `framer-motion`.
 * 2. Muestra avatar, nombre, rol y departamento.
 * 3. Renderiza biografía opcional si existe.
 * 4. Muestra acciones de contacto según disponibilidad:
 *    - correo,
 *    - perfil de LinkedIn.
 */
export default function TeamMemberCard({ member, index = 0 }: Props) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-violet-200 overflow-hidden"
    >
      {/* Fondo hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-violet-50/0 to-violet-50/60 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Barra superior */}
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-400 to-purple-500 scale-x-0 transition-transform duration-300 origin-left group-hover:scale-x-100" />

      {/* Avatar */}
      <div className="relative mb-4">
        <div className="h-20 w-20 rounded-full ring-4 ring-white ring-offset-2 ring-offset-slate-50 group-hover:ring-violet-100 transition-all duration-300 overflow-hidden shadow-md">
          <img
            src={member.image}
            alt={member.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Indicador decorativo */}
        <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-sm" />
      </div>

      {/* Información */}
      <div className="relative flex flex-col items-center gap-1 w-full">
        <h3 className="text-[15px] font-semibold text-slate-800 leading-tight group-hover:text-violet-700 transition-colors duration-200">
          {member.name}
        </h3>

        <p className="text-[12px] font-medium text-slate-500 leading-tight">
          {member.role}
        </p>

        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 group-hover:bg-violet-50 group-hover:text-violet-600 transition-colors duration-200">
          <Building2 className="h-2.5 w-2.5" />
          {member.department}
        </span>

        {member.bio && (
          <p className="mt-2.5 text-[11px] text-slate-400 leading-relaxed line-clamp-2 px-1">
            {member.bio}
          </p>
        )}
      </div>

      {/* Separador */}
      <div className="relative my-4 h-px w-full bg-slate-100 group-hover:bg-violet-100 transition-colors duration-200" />

      {/* Acciones */}
      <div className="relative flex items-center justify-center gap-2 w-full">
        {member.email && (
          <a
            href={`mailto:${member.email}`}
            className="flex items-center gap-1.5 rounded-lg bg-violet-50 border border-violet-100 px-3 py-1.5 text-[11px] font-semibold text-violet-600 transition-all duration-200 hover:bg-violet-600 hover:text-white hover:border-violet-600"
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
    </motion.article>
  );
}