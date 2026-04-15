/**
 * @module LeaderCard
 * Tarjeta individual de líder dentro de la sección corporativa.
 *
 * @remarks
 * Este componente renderiza la información resumida de un miembro
 * del equipo directivo, incluyendo:
 *
 * - foto de perfil (si existe)
 * - fallback con iniciales
 * - nombre
 * - cargo
 * - área
 *
 * Además, aplica bordes dinámicos según su posición dentro del grid
 * para mantener consistencia visual en la distribución de tarjetas.
 */

// ✅ SERVER COMPONENT

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Representa la información visual mínima necesaria para renderizar
 * un líder dentro del grid.
 *
 * @property name Nombre del líder.
 * @property role Cargo del líder.
 * @property area Área organizacional.
 * @property initials Iniciales de respaldo para el avatar.
 * @property photoUrl URL de la foto del líder o `null` si no existe.
 */
type LeaderCardItem = {
  name: string;
  role: string;
  area: string;
  initials?: string;
  photoUrl: string | null;
};

/**
 * Props del componente {@link LeaderCard}.
 *
 * @property leader Datos del líder a mostrar.
 * @property index Posición del elemento dentro del grid.
 * @property total Cantidad total de líderes renderizados.
 */
type LeaderCardProps = {
  leader: LeaderCardItem;
  index: number;
  total: number;
};

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Tarjeta individual de líder.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta visual con avatar, nombre, rol y área.
 *
 * @remarks
 * Este componente calcula dos condiciones visuales en función de
 * su posición dentro del grid:
 *
 * - si pertenece a la columna derecha
 * - si está en la última fila
 *
 * Esto permite aplicar bordes condicionales y mantener una grilla
 * visualmente ordenada sin duplicar lógica en el componente contenedor.
 *
 * También maneja fallback de avatar:
 *
 * - si existe `photoUrl`, se renderiza la imagen
 * - si no existe, se usan `initials`
 * - si tampoco hay `initials`, se usan las dos primeras letras del nombre
 *
 * @example
 * ```tsx
 * <LeaderCard leader={leader} index={0} total={6} />
 * ```
 */
export function LeaderCard({
  leader,
  index,
  total,
}: LeaderCardProps) {
  /**
   * Indica si la tarjeta pertenece a la columna derecha del grid.
   */
  const isInRightColumn = index % 2 !== 0;

  /**
   * Indica si la tarjeta pertenece a la última fila del grid.
   *
   * @remarks
   * La lógica actual asume una distribución de dos columnas.
   */
  const isInLastRow = index >= total - 2;

  return (
    <div
      className="flex items-center gap-3 px-5 py-4 transition-colors hover:bg-violet-50/50 dark:hover:bg-gray-800"
      style={{
        borderRight: !isInRightColumn
          ? "0.5px solid rgb(226 232 240)"
          : "none",
        borderBottom: !isInLastRow
          ? "0.5px solid rgb(226 232 240)"
          : "none",
      }}
    >
      {/* Avatar: foto real o fallback por iniciales */}
      {leader.photoUrl ? (
        <img
          src={leader.photoUrl}
          alt={leader.name}
          width={40}
          height={40}
          className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-2 ring-violet-100"
        />
      ) : (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-violet-600 text-[12px] font-bold tracking-wide text-white">
          {leader.initials ?? leader.name.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="min-w-0">
        <p className="truncate text-[13px] font-semibold leading-tight text-slate-700 dark:text-slate-200">
          {leader.name}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-slate-400">
          {leader.role} · {leader.area}
        </p>
      </div>
    </div>
  );
}