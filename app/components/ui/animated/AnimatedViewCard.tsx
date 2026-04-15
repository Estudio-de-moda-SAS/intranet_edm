/**
 * @module AnimatedViewCard
 * Wrapper animado para elementos que deben aparecer al entrar al viewport.
 *
 * @remarks
 * Similar a {@link AnimatedCard}, pero enfocado en contenido "below the fold".
 * Utiliza `whileInView` en lugar de `animate`, evitando animaciones innecesarias
 * hasta que el usuario realmente ve el componente.
 */

"use client";

// 📁 UBICACIÓN CANÓNICA: app/components/ui/animated/AnimatedViewCard.tsx
//
// Igual que AnimatedCard pero usa whileInView en vez de animate.
// Para secciones debajo del fold (dashboards, equipos, tablas largas)
// que no deben animarse hasta que el usuario las ve.
//
// Uso:
//   <AnimatedViewCard className="mt-6">
//     <CommercialDashboard />
//   </AnimatedViewCard>

import { motion, type Variants } from "framer-motion";

/**
 * Props del componente {@link AnimatedViewCard}.
 */
interface Props {
  /**
   * Contenido interno que será animado.
   */
  children: React.ReactNode;

  /**
   * Clases CSS opcionales del contenedor.
   */
  className?: string;

  /**
   * Margen del viewport para activar la animación antes/después.
   *
   * @defaultValue "-60px"
   */
  margin?: string;
}

/**
 * Variantes de animación para la entrada del componente.
 */
const reveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

/**
 * Componente que anima su contenido al entrar en el viewport.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a renderizar.
 * @param props.className Clases CSS del contenedor.
 * @param props.margin Margen del viewport.
 * @returns Contenedor `motion.div` con animación basada en visibilidad.
 *
 * @remarks
 * Flujo:
 * 1. Inicia en estado `hidden`.
 * 2. Cuando entra al viewport, pasa a `show`.
 * 3. Se ejecuta una sola vez (`once: true`).
 *
 * Ideal para:
 * - dashboards,
 * - listados largos,
 * - secciones que no están visibles al cargar la página.
 */
export function AnimatedViewCard({
  children,
  className,
  margin = "-60px",
}: Props) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin }}
      className={className}
    >
      {children}
    </motion.div>
  );
}