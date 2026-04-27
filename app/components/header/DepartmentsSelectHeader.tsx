/**
 * @module DepartmentSelectHeader
 * Componente cliente para seleccionar y navegar entre distintas áreas
 * dentro de la aplicación.
 *
 * @remarks
 * Este archivo implementa un selector desplegable que permite al usuario
 * cambiar rápidamente entre las páginas principales ("home") de cada área.
 *
 * Su responsabilidad incluye:
 *
 * - Renderizar un selector (`<select>`) con las áreas disponibles.
 * - Gestionar el estado local de la opción seleccionada.
 * - Redirigir al usuario mediante el router de Next.js.
 * - Mantener una experiencia limpia reseteando el valor tras la navegación.
 *
 * Este componente está pensado para ubicarse en headers o barras de navegación
 * como acceso rápido a módulos funcionales.
 */

// app/_components/AreaSelectHeader.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

/**
 * Representa una opción de área disponible en el selector.
 */
export type Area = {
  /**
   * Identificador único del área.
   */
  id: string;

  /**
   * Nombre visible del área.
   */
  label: string;

  /**
   * Ruta de navegación asociada al área.
   *
   * @remarks
   * Se utiliza para redirigir al usuario mediante el router.
   */
  href: string;
};

/**
 * Props del componente {@link AreaSelectHeader}.
 */
interface Props {
  /**
   * Lista de áreas disponibles para selección.
   */
  areas: Area[];
}

/**
 * Componente cliente que renderiza un selector de navegación por áreas.
 *
 * @param props Propiedades del componente.
 * @param props.areas Lista de áreas disponibles.
 * @returns Selector desplegable con navegación automática.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Inicializa el router de Next.js para navegación programática.
 * 2. Mantiene un estado local `val` para controlar el valor del `<select>`.
 * 3. Renderiza un selector con las áreas disponibles.
 * 4. Cuando el usuario selecciona una opción:
 *    - Obtiene la ruta (`href`) seleccionada.
 *    - Resetea el valor del selector.
 *    - Si existe una ruta válida, navega hacia ella mediante `router.push`.
 *
 * Este componente permite una navegación rápida y contextual entre
 * distintas secciones de la aplicación.
 */
export default function AreaSelectHeader({ areas }: Props) {
  /**
   * Instancia del router para navegación entre rutas.
   */
  const router = useRouter();

  /**
   * Estado local del valor seleccionado en el `<select>`.
   */
  const [val, setVal] = useState('');

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <span className="text-xs text-gray-600 dark:text-gray-400">
        Home de área:
      </span>

      <select
        value={val}
        onChange={(e) => {
          const href = e.target.value;

          /**
           * Se limpia el valor para evitar que quede seleccionado
           * después de la navegación.
           */
          setVal('');

          /**
           * Si existe una ruta válida, se navega hacia ella.
           */
          if (href) router.push(href);
        }}
        aria-label="Cambiar a home de área"
        className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
      >
        <option value="">Selecciona…</option>

        {areas.map((a) => (
          <option key={a.id} value={a.href}>
            {a.label}
          </option>
        ))}
      </select>
    </div>
  );
}