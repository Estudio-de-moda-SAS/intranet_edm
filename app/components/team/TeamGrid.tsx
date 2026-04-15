/**
 * @component TeamGrid
 * Renderiza una grilla flexible de miembros del equipo.
 *
 * @description
 * Este componente organiza una lista de {@link TeamMember} en un layout tipo
 * "wrap" (flexible), mostrando cada elemento mediante el componente
 * {@link TeamMemberCard}.
 *
 * @param props.members Lista de miembros del equipo a renderizar.
 *
 * @returns Contenedor con tarjetas de miembros distribuidas en filas adaptativas.
 */
import { TeamMember } from "./types"; 
import TeamMemberCard from "./TeamMemberCard";

interface Props {
  /**
   * Array de miembros del equipo.
   */
  members: TeamMember[];
}

export default function TeamGrid({ members }: Props) {
  return (
    <div
      className="flex flex-wrap justify-center gap-4 w-full"
    >
      {members.map((member, index) => (
        <div
          key={member.id}
          className="w-56 shrink-0"
        >
          {/* Tarjeta individual del miembro */}
          <TeamMemberCard member={member} index={index} />
        </div>
      ))}
    </div>
  );
}