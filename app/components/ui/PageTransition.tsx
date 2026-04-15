/**
 * @module PageTransition
 * Componentes de animación para transiciones de página y elementos individuales.
 *
 * @remarks
 * Este archivo centraliza animaciones comunes usando `framer-motion`,
 * permitiendo mantener consistencia visual en toda la aplicación.
 */

// app/components/ui/PageTransition.tsx
"use client";

import { motion } from "framer-motion";

/**
 * Props base para componentes animados.
 */
type BaseProps = {
  /**
   * Contenido a renderizar dentro del contenedor animado.
   */
  children: React.ReactNode;

  /**
   * Clases adicionales opcionales.
   */
  className?: string;
};

/**
 * Componente de transición de página principal.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido de la página.
 * @returns Contenedor con animación de entrada.
 *
 * @remarks
 * - Se utiliza para envolver páginas completas.
 * - Aplica una animación suave de fade + desplazamiento vertical.
 * - Ideal para layouts o vistas principales.
 *
 * @example
 * ```tsx
 * <PageTransition>
 *   <Dashboard />
 * </PageTransition>
 * ```
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Props del componente {@link AnimateItem}.
 */
type AnimateItemProps = BaseProps & {
  /**
   * Delay opcional de la animación en segundos.
   *
   * @defaultValue 0
   */
  delay?: number;
};

/**
 * Componente para animar elementos individuales.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a animar.
 * @param props.delay Retraso de animación.
 * @param props.className Clases adicionales.
 * @returns Contenedor animado.
 *
 * @remarks
 * - Útil para listas, cards o elementos repetidos.
 * - Permite crear efectos de stagger manual usando `delay`.
 * - Animación: fade + desplazamiento vertical.
 *
 * @example
 * ```tsx
 * {items.map((item, i) => (
 *   <AnimateItem key={item.id} delay={i * 0.05}>
 *     <Card {...item} />
 *   </AnimateItem>
 * ))}
 * ```
 */
export function AnimateItem({
  children,
  delay = 0,
  className = "",
}: AnimateItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.45,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Componente de entrada simple para páginas o bloques.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a renderizar.
 * @param props.className Clases adicionales.
 * @returns Contenedor con fade-in.
 *
 * @remarks
 * - Más minimalista que {@link PageTransition}.
 * - Solo aplica fade (sin desplazamiento).
 * - Ideal para overlays, modales o cambios suaves de contenido.
 *
 * @example
 * ```tsx
 * <PageEnter className="mt-4">
 *   <Section />
 * </PageEnter>
 * ```
 */
export function PageEnter({
  children,
  className = "",
}: BaseProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}