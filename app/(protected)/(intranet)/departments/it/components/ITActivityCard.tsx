/**
 * @module ITActivityCard
 * Tarjeta simple de actividad reciente de servidores.
 *
 * @remarks
 * Este componente renderiza un listado básico de eventos de actividad
 * asociados a servidores o infraestructura de TI.
 *
 * Muestra:
 * - Mensaje descriptivo del evento
 * - Hora o marca temporal asociada
 *
 * Está pensado como una versión ligera de visualización de actividad,
 * útil para paneles compactos o vistas resumidas.
 */

/**
 * Evento de actividad mostrado en la tarjeta.
 *
 * @property message Descripción breve del evento registrado.
 * @property time Hora o referencia temporal del evento.
 */
type ActivityEvent = {
  message: string;
  time: string;
};

/**
 * Props del componente {@link ITServerActivityCard}.
 *
 * @property data Objeto que contiene la lista de eventos de actividad.
 */
type ITServerActivityCardProps = {
  data: {
    activity: ActivityEvent[];
  };
};

/**
 * Tarjeta de actividad reciente de servidores.
 *
 * @param props Propiedades del componente.
 * @returns Tarjeta con listado de eventos y su hora asociada.
 *
 * @remarks
 * Este componente presenta una estructura simple y directa para visualizar
 * actividad reciente de infraestructura.
 *
 * Actualmente:
 * - Recorre la colección `activity`
 * - Renderiza cada evento como una fila
 * - Muestra el mensaje a la izquierda y la hora a la derecha
 *
 * @example
 * ```tsx
 * <ITServerActivityCard data={data} />
 * ```
 */
export default function ITServerActivityCard({ data }: ITServerActivityCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="font-semibold mb-4">
        Actividad Servidores
      </h2>

      <ul className="space-y-2 text-sm">
        {data.activity.map((event, i) => (
          <li key={i} className="flex justify-between">
            <span>{event.message}</span>

            <span className="text-gray-400">
              {event.time}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}