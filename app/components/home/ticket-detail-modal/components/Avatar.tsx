/**
 * @module TicketDetailModal/components/Avatar
 * Avatar circular con iniciales para autores de comentarios.
 */

interface AvatarProps {
  initials: string;
  color: string;
  size?: number;
}

/**
 * Avatar circular con iniciales para autores de comentarios.
 *
 * @param props Propiedades del componente.
 * @param props.initials Iniciales visibles.
 * @param props.color Color principal del avatar.
 * @param props.size Tamaño del avatar en píxeles.
 * @returns Avatar visual generado con estilos inline.
 */
export function Avatar({ initials, color, size = 28 }: AvatarProps) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color + "20",
        color,
        fontSize: size * 0.35,
        fontWeight: 700,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        border: `1.5px solid ${color}40`,
      }}
    >
      {initials}
    </span>
  );
}