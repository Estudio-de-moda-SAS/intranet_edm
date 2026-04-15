/**
 * @module DirectoryStatsBar
 * Barra de estadísticas para el resumen del directorio de empleados.
 *
 * @remarks
 * Este componente muestra métricas clave del listado de empleados:
 * - Total de empleados
 * - Empleados activos
 * - Empleados remotos
 * - Empleados en licencia
 *
 * Cada métrica incluye:
 * - Valor numérico
 * - Porcentaje relativo al total
 * - Indicador visual mediante barra de progreso
 */

"use client";

/**
 * Estructura de estadísticas del directorio.
 *
 * @property total Total de empleados.
 * @property active Cantidad de empleados activos.
 * @property remote Cantidad de empleados en modalidad remota.
 * @property leave Cantidad de empleados en licencia.
 */
type Stats = {
  total: number;
  active: number;
  remote: number;
  leave: number;
};

/**
 * Props del componente {@link DirectoryStatsBar}.
 *
 * @property stats Objeto con las métricas calculadas del directorio.
 */
type Props = { stats: Stats };

/**
 * Componente de barra de estadísticas del directorio.
 *
 * @param props Propiedades del componente.
 * @returns Grid con métricas resumidas de empleados.
 *
 * @remarks
 * Cada estadística es representada mediante {@link StatItem},
 * incluyendo su proporción respecto al total.
 *
 * Maneja división segura evitando errores cuando `total = 0`.
 *
 * @example
 * ```tsx
 * <DirectoryStatsBar stats={stats} />
 * ```
 */
export function DirectoryStatsBar({ stats }: Props) {
  return (
    <div className="grid grid-cols-4 border-b border-slate-200/80">
      <StatItem
        label="Total"
        value={stats.total}
        suffix="empleados"
        barColor="bg-violet-500"
        pct={100}
      />

      <StatItem
        label="Activos"
        value={stats.active}
        color="text-green-700"
        barColor="bg-green-500"
        pct={
          stats.total
            ? Math.round((stats.active / stats.total) * 100)
            : 0
        }
      />

      <StatItem
        label="Remotos"
        value={stats.remote}
        color="text-blue-700"
        barColor="bg-blue-500"
        pct={
          stats.total
            ? Math.round((stats.remote / stats.total) * 100)
            : 0
        }
      />

      <StatItem
        label="En licencia"
        value={stats.leave}
        color="text-amber-700"
        barColor="bg-amber-500"
        pct={
          stats.total
            ? Math.round((stats.leave / stats.total) * 100)
            : 0
        }
      />
    </div>
  );
}

/**
 * Props del componente {@link StatItem}.
 *
 * @property label Etiqueta descriptiva de la métrica.
 * @property value Valor numérico.
 * @property suffix Texto adicional opcional (ej: "empleados").
 * @property color Clase CSS para el color del valor.
 * @property barColor Clase CSS para la barra de progreso.
 * @property pct Porcentaje relativo al total.
 */
type StatItemProps = {
  label: string;
  value: number;
  suffix?: string;
  color?: string;
  barColor: string;
  pct: number;
};

/**
 * Componente helper para representar una métrica individual.
 *
 * @param props Propiedades del ítem.
 * @returns Bloque visual con valor, etiqueta y barra de progreso.
 *
 * @remarks
 * Características:
 * - Barra inferior proporcional al porcentaje (`pct`)
 * - Estilos diferenciados por tipo de métrica
 * - Soporte para sufijo opcional
 * - Feedback visual en hover
 *
 * El porcentaje se muestra también en formato textual
 * para mayor claridad.
 */
function StatItem({
  label,
  value,
  suffix,
  color = "text-slate-900",
  barColor,
  pct,
}: StatItemProps) {
  return (
    <div className="relative px-6 py-5 border-r border-slate-200/80 last:border-r-0 overflow-hidden group hover:bg-slate-50/60 transition-colors">
      {/* Mini progress bar */}
      <div className="absolute bottom-0 left-0 h-[3px] bg-slate-100 w-full">
        <div
          className={`h-full ${barColor} opacity-60 transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-mono mb-1">
        {label}
      </p>

      <p
        className={`text-2xl font-bold leading-none tracking-tight ${color}`}
      >
        {value}
        {suffix ? (
          <span className="text-[12px] font-normal text-slate-400 ml-1.5">
            {suffix}
          </span>
        ) : null}
      </p>

      <p className="text-[11px] text-slate-400 mt-1.5 font-mono">
        {pct}% del total
      </p>
    </div>
  );
}