/**
 * @module AnimatedCard
 * Componente cliente reutilizable para aplicar animaciones de entrada
 * a bloques de contenido.
 *
 * @remarks
 * Este archivo unifica dos comportamientos:
 * - animación al montar el componente,
 * - animación al entrar en el viewport.
 *
 * El comportamiento se controla mediante la prop `whenInView`.
 */

"use client";

// 📁 app/components/ui/animated/AnimatedCard.tsx
//
// Wrapper de animación de entrada reutilizable.
// Fusiona AnimatedCard (animate) + AnimatedViewCard (whileInView).
//
// Uso:
//   <AnimatedCard>               ← anima al montar
//   <AnimatedCard whenInView>    ← anima cuando entra al viewport

import { motion, type Variants } from "framer-motion";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

/**
 * Props del componente {@link AnimatedCard}.
 */
interface Props {
  /**
   * Contenido interno que será envuelto por la animación.
   */
  children: React.ReactNode;

  /**
   * Retraso opcional antes de iniciar la animación.
   *
   * @defaultValue 0
   */
  delay?: number;

  /**
   * Clases CSS opcionales del contenedor.
   */
  className?: string;

  /**
   * Define si la animación ocurre al entrar al viewport.
   *
   * @remarks
   * - `true`: usa `whileInView`.
   * - `false`: anima inmediatamente al montar.
   *
   * @defaultValue false
   */
  whenInView?: boolean;

  /**
   * Margen del viewport usado cuando `whenInView` es `true`.
   *
   * @defaultValue "-60px"
   */
  margin?: string;
}

/**
 * Variantes de animación estándar para entrada con desplazamiento vertical.
 */
const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/**
 * Variantes estáticas usadas cuando las animaciones están deshabilitadas.
 */
const instant: Variants = {
  hidden: { opacity: 1, y: 0 },
  show: { opacity: 1, y: 0 },
};

/**
 * Wrapper animado reutilizable para contenido visual.
 *
 * @param props Propiedades del componente.
 * @param props.children Contenido a envolver.
 * @param props.delay Retraso de animación.
 * @param props.className Clases opcionales del contenedor.
 * @param props.whenInView Define si la animación ocurre al entrar al viewport.
 * @param props.margin Margen del viewport para `whileInView`.
 * @returns Contenedor `motion.div` con comportamiento animado configurable.
 *
 * @remarks
 * Flujo general:
 * 1. Consulta si las animaciones están habilitadas mediante {@link useAnimationsEnabled}.
 * 2. Selecciona las variantes:
 *    - `reveal` si hay animaciones activas.
 *    - `instant` si están deshabilitadas.
 * 3. Si `whenInView` es `true`, usa `whileInView`.
 * 4. En caso contrario, anima inmediatamente al montar con `animate`.
 */
export function AnimatedCard({
  children,
  delay = 0,
  className,
  whenInView = false,
  margin = "-60px",
}: Props) {
  /**
   * Indica si las animaciones del sistema están habilitadas.
   */
  const animated = useAnimationsEnabled();

  /**
   * Variantes aplicadas según el estado de animación global.
   */
  const variants = animated ? reveal : instant;

  /**
   * Estado inicial compartido de la animación.
   */
  const initial = "hidden";

  if (whenInView) {
    return (
      <motion.div
        variants={variants}
        initial={initial}
        whileInView="show"
        viewport={{ once: true, margin }}
        transition={{ delay: animated ? delay : 0 }}
        className={className}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={variants}
      initial={initial}
      animate="show"
      transition={{ delay: animated ? delay : 0 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}