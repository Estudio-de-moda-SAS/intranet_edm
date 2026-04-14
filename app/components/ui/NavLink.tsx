/**
 * @module NavLink
 * Componente de enlace de navegación con estado activo y transición visual.
 *
 * @remarks
 * Este componente encapsula `next/link` para:
 * - detectar automáticamente la ruta activa,
 * - aplicar estilos condicionales,
 * - manejar estados visuales durante transiciones.
 */

// app/components/ui/NavLink.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";

/**
 * Props del componente {@link NavLink}.
 */
interface NavLinkProps {
  /**
   * Ruta de destino del enlace.
   */
  href: string;

  /**
   * Contenido interno del enlace (texto o elementos).
   */
  children: React.ReactNode;

  /**
   * Clases base del enlace.
   */
  className?: string;

  /**
   * Clases aplicadas cuando el enlace está activo.
   */
  activeClassName?: string;
}

/**
 * Renderiza un enlace de navegación con detección automática de estado activo.
 *
 * @param props Propiedades del componente.
 * @param props.href Ruta destino.
 * @param props.children Contenido del enlace.
 * @param props.className Clases base.
 * @param props.activeClassName Clases cuando está activo.
 * @returns Enlace estilizado con estado activo y transición.
 *
 * @remarks
 * Funcionalidades clave:
 * - Usa `usePathname` para comparar la ruta actual con `href`.
 * - Aplica `activeClassName` cuando la ruta coincide exactamente.
 * - Usa `useTransition` para detectar navegación en curso (aunque en este caso
 *   no dispara transiciones manuales, puede servir para feedback visual).
 * - Reduce opacidad (`opacity-60`) mientras hay transición pendiente.
 *
 * @example
 * ```tsx
 * <NavLink
 *   href="/dashboard"
 *   className="px-3 py-2 text-sm"
 *   activeClassName="text-violet-600 font-semibold"
 * >
 *   Dashboard
 * </NavLink>
 * ```
 */
export function NavLink({
  href,
  children,
  className = "",
  activeClassName = "",
}: NavLinkProps) {
  /**
   * Ruta actual del navegador.
   */
  const pathname = usePathname();

  /**
   * Estado de transición de React.
   *
   * @remarks
   * En este caso se usa solo para feedback visual (opacidad),
   * aunque no se está invocando `startTransition`.
   */
  const [isPending] = useTransition();

  /**
   * Determina si el enlace está activo.
   *
   * @remarks
   * Comparación estricta (`===`).
   * Si necesitas rutas anidadas, podrías usar `startsWith`.
   */
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      prefetch={true}
      className={`
        ${className}
        ${isActive ? activeClassName : ""}
        ${isPending ? "opacity-60" : "opacity-100"}
        transition-opacity duration-150
      `}
    >
      {children}
    </Link>
  );
}