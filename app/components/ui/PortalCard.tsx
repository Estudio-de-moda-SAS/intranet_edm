/**
 * @module PortalCard
 * Componente contenedor reutilizable tipo tarjeta para secciones del portal.
 *
 * @remarks
 * Este componente proporciona una estructura simple y consistente para mostrar
 * contenido agrupado en forma de card, con un header opcional y un body.
 */

"use client";

/**
 * Props del componente {@link PortalCard}.
 */
interface PortalCardProps {
  /**
   * Título opcional de la tarjeta.
   */
  title?: string;

  /**
   * Contenido principal de la tarjeta.
   */
  children: React.ReactNode;
}

/**
 * Renderiza una tarjeta base con estilo limpio y header opcional.
 *
 * @param props Propiedades del componente.
 * @param props.title Título opcional mostrado en la parte superior.
 * @param props.children Contenido interno de la tarjeta.
 * @returns Contenedor visual tipo card.
 *
 * @remarks
 * Estructura:
 * - Contenedor principal con borde, fondo y sombra.
 * - Header opcional (solo si `title` está definido).
 * - Body con padding uniforme.
 *
 * Características:
 * - Diseño minimalista reutilizable.
 * - Separación clara entre header y contenido.
 * - Fácil de extender con acciones, footer o variantes.
 *
 * @example
 * ```tsx
 * <PortalCard title="Resumen">
 *   <p>Contenido del módulo</p>
 * </PortalCard>
 * ```
 *
 * @example Sin título
 * ```tsx
 * <PortalCard>
 *   <CustomComponent />
 * </PortalCard>
 * ```
 */
export default function PortalCard({
  title,
  children,
}: PortalCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      
      {title && (
        <div className="border-b px-5 py-3">
          <h3 className="text-sm font-semibold text-gray-700">
            {title}
          </h3>
        </div>
      )}

      <div className="p-5">
        {children}
      </div>

    </div>
  );
}