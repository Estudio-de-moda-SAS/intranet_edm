/**
 * @module FilterSelect
 * Componente cliente para renderizar un selector de filtro (select).
 *
 * @remarks
 * Se utiliza dentro de barras de filtrado para permitir seleccionar
 * valores de manera simple y consistente con el diseño del sistema.
 */

"use client";

/**
 * Representa una opción dentro del select.
 */
type Option = {
  /**
   * Valor interno de la opción.
   */
  value: string;

  /**
   * Texto visible para el usuario.
   */
  label: string;
};

/**
 * Props del componente {@link FilterSelect}.
 */
interface FilterSelectProps {
  /**
   * Valor actualmente seleccionado.
   */
  value: string;

  /**
   * Callback que se ejecuta al cambiar la selección.
   */
  onChange: (value: string) => void;

  /**
   * Lista de opciones disponibles.
   */
  options: Option[];
}

/**
 * Renderiza un select estilizado para filtros.
 *
 * @param props Propiedades del componente.
 * @param props.value Valor actual.
 * @param props.onChange Función de cambio.
 * @param props.options Opciones del select.
 * @returns Elemento `<select>` estilizado.
 *
 * @remarks
 * Flujo:
 * 1. Renderiza un `<select>` controlado.
 * 2. Mapea las opciones recibidas.
 * 3. Notifica cambios mediante `onChange`.
 */
export default function FilterSelect({ value, onChange, options }: FilterSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border px-2 py-1.5 text-xs transition-colors cursor-pointer
                 border-slate-200 bg-white text-slate-600
                 focus:outline-none focus:ring-2 focus:ring-slate-200
                 dark:border-[#30363d] dark:bg-[#1c2128] dark:text-[#adbac7]
                 dark:focus:ring-violet-500/20 dark:focus:border-violet-500/50"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}