/**
 * @module AnimatedSection
 * Contenedor animado para layouts con múltiples elementos (grids, columnas, listas).
 *
 * @remarks
 * Este componente aplica animación tipo "stagger" a sus hijos, permitiendo que
 * cada elemento animado (ej: {@link AnimatedCard}) aparezca de forma escalonada.
 */

"use client";

// 📁 app/components/ui/animated/AnimatedSection.tsx
//
// Contenedor con staggerChildren para grids y columnas.
// Fusiona AnimatedSection + el patrón container/card de AnimatedKPIStrip y demás.
//
// Uso:
//   <AnimatedSection className="grid grid-cols-12 gap-6">
//     <AnimatedCard><MiCard /></AnimatedCard>
//   </AnimatedSection>

import { motion, type Variants } from "framer-motion";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

/**
 * Props del componente {@link AnimatedSection}.
 */
interface Props {
  /**
   * Elementos hijos que serán animados de forma escalonada.
   */
  children: React.ReactNode;

  /**
   * Clases CSS del contenedor.
   */
  className?: string;

  /**
   * Retraso inicial antes de comenzar la animación de los hijos.
   *
   * @defaultValue 0.2
   */
  delay?: number;

  /**
   * Tiempo entre la animación de cada hijo (stagger).
   *
   * @defaultValue 0.1
   */
  stagger?: number;
}

/**
 * Contenedor animado con efecto stagger.
 *
 * @param props Propiedades del componente.
 * @param props.children Elementos hijos a renderizar.
 * @param props.className Clases CSS del contenedor.
 * @param props.delay Retraso inicial.
 * @param props.stagger Intervalo entre animaciones de hijos.
 * @returns Contenedor `motion.div` con animación escalonada.
 *
 * @remarks
 * Flujo:
 * 1. Verifica si las animaciones están habilitadas.
 * 2. Si lo están, aplica `staggerChildren` y `delayChildren`.
 * 3. Si no, renderiza sin animación (instantáneo).
 * 4. Los hijos deben tener sus propias variantes (ej: AnimatedCard).
 */
export function AnimatedSection({
  children,
  className,
  delay = 0.2,
  stagger = 0.1,
}: Props) {
  /**
   * Estado global de animaciones (activas o deshabilitadas).
   */
  const animated = useAnimationsEnabled();

  /**
   * Variantes del contenedor.
   *
   * @remarks
   * - Con animación: aplica stagger entre hijos.
   * - Sin animación: transición vacía (render inmediato).
   */
  const container: Variants = animated
    ? {
        hidden: {},
        show: {
          transition: {
            staggerChildren: stagger,
            delayChildren: delay,
          },
        },
      }
    : {
        hidden: {},
        show: {},
      };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}