/**
 * @module NewsMosaicGrid
 * Componente cliente para renderizar noticias en formato de grilla tipo mosaico.
 *
 * @remarks
 * Este componente organiza una colección de anuncios en un layout responsive
 * utilizando CSS Grid, delegando la representación visual de cada elemento
 * a {@link NewsTileSquare}.
 */

'use client';

import { NewsTileSquare } from './NewsTileSquare';
import type { Announcement } from '@/types/announcement';

/**
 * Props del componente {@link NewsMosaicGrid}.
 */
interface Props {
  /**
   * Lista de anuncios a mostrar en la grilla.
   */
  items: Announcement[];
}

/**
 * Renderiza una grilla tipo mosaico de noticias.
 *
 * @param props Propiedades del componente.
 * @param props.items Lista de anuncios a visualizar.
 * @returns Lista de elementos organizados en grid responsive.
 *
 * @remarks
 * - Utiliza un layout adaptable según el tamaño de pantalla.
 * - Cada elemento se representa mediante {@link NewsTileSquare}.
 * - Mantiene proporciones uniformes con `auto-rows-fr`.
 */
export function NewsMosaicGrid({ items }: Props) {
  return (
    <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-fr">
      {items.map((a) => (
        <NewsTileSquare key={a.id} news={a} />
      ))}
    </ul>
  );
}