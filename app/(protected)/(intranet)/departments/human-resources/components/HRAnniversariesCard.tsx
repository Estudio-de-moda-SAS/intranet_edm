/**
 * @module HRAnniversariesCard
 * Tarjeta de celebraciones del módulo de Recursos Humanos.
 *
 * @remarks
 * Este componente muestra eventos relevantes del equipo como:
 * - Cumpleaños
 * - Aniversarios laborales
 *
 * Incluye:
 * - Indicador de eventos del día
 * - Listado con avatar, tipo de evento y fecha
 * - Diferenciación visual según tipo (`birthday` o `anniversary`)
 *
 * Actualmente utiliza datos mock para propósitos de desarrollo o prototipado.
 */

import { Cake, Star } from "lucide-react";

/**
 * Tipo de evento de celebración.
 *
 * @property name Nombre del colaborador.
 * @property type Tipo de evento (`birthday` o `anniversary`).
 * @property detail Descripción del evento.
 * @property date Fecha relativa del evento (ej: "Hoy", "Mañana").
 * @property initials Iniciales del colaborador.
 * @property hue Valor HSL para generar color dinámico del avatar.
 */
type Event = {
  name: string;
  type: "birthday" | "anniversary";
  detail: string;
  date: string;
  initials: string;
  hue: number;
};

/**
 * Lista de eventos de celebraciones.
 *
 * @remarks
 * Datos simulados que representan eventos próximos o actuales.
 */
const EVENTS: Event[] = [
  { name: "Carolina Mejía", type: "birthday", detail: "Cumpleaños", date: "Hoy", initials: "CM", hue: 320 },
  { name: "Diego Ramírez", type: "anniversary", detail: "5 años en la empresa", date: "Hoy", initials: "DR", hue: 200 },
  { name: "Paola Jiménez", type: "birthday", detail: "Cumpleaños", date: "Mañana", initials: "PJ", hue: 260 },
  { name: "Sebastián Mora", type: "anniversary", detail: "10 años en la empresa", date: "En 2 días", initials: "SM", hue: 160 },
  { name: "Isabel Castro", type: "birthday", detail: "Cumpleaños", date: "En 3 días", initials: "IC", hue: 30 },
];

/**
 * Tarjeta de celebraciones de RRHH.
 *
 * @returns Componente visual con listado de eventos y contador del día.
 *
 * @remarks
 * Funcionalidades principales:
 * - Filtra eventos que ocurren "Hoy"
 * - Muestra un badge con la cantidad de celebraciones actuales
 * - Renderiza una lista con:
 *   - Avatar con color dinámico (HSL)
 *   - Ícono según tipo de evento
 *   - Nombre y detalle
 *   - Fecha destacada
 *
 * Diferenciación visual:
 * - Cumpleaños → ícono {@link Cake}
 * - Aniversarios → ícono {@link Star}
 *
 * @example
 * ```tsx
 * <HRAnniversariesCard />
 * ```
 */
export default function HRAnniversariesCard() {
  /**
   * Cantidad de eventos que ocurren hoy.
   */
  const todayCount = EVENTS.filter((e) => e.date === "Hoy").length;

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50">
            <Cake className="h-3.5 w-3.5 text-rose-500" />
          </span>
          <h2 className="text-sm font-semibold text-slate-800">
            Celebraciones
          </h2>
        </div>

        {todayCount > 0 && (
          <span className="rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-500">
            {todayCount} hoy
          </span>
        )}
      </div>

      <ul className="divide-y divide-slate-50">
        {EVENTS.map((ev, i) => (
          <li
            key={i}
            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors"
          >
            {/* Avatar */}
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[11px] font-bold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, hsl(${ev.hue},65%,58%), hsl(${ev.hue + 20},60%,48%))`,
              }}
            >
              {ev.initials}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-800 truncate">
                {ev.name}
              </p>

              <div className="flex items-center gap-1.5">
                {ev.type === "birthday" ? (
                  <Cake className="h-3 w-3 text-rose-400" />
                ) : (
                  <Star className="h-3 w-3 text-amber-400" />
                )}
                <p className="text-[11px] text-slate-400">{ev.detail}</p>
              </div>
            </div>

            {/* Fecha */}
            <span
              className={`shrink-0 text-[11px] font-semibold ${
                ev.date === "Hoy"
                  ? "text-violet-600"
                  : "text-slate-400"
              }`}
            >
              {ev.date}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}