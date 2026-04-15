/**
 * @module AnimatedShell
 * Contenedor raíz animado para la aplicación.
 *
 * @remarks
 * Este componente envuelve la estructura principal (layout) y habilita
 * animaciones suaves de cambio de layout usando `framer-motion`.
 */

"use client";

// 📁 app/components/ui/animated/AnimatedShell.tsx

import { motion } from "framer-motion";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

/**
 * Configuración de transición estándar para cambios de layout.
 */
const TRANSITION = {
  duration: 0.3,
  ease: "easeInOut",
} as const;

/**
 * Props del componente {@link AnimatedShell}.
 */
interface Props {
  /**
   * Contenido principal de la aplicación.
   */
  children: React.ReactNode;
}

/**
 * Wrapper global que aplica animaciones de layout a toda la app.
 *
 * @param props Propiedades del componente.
 * @param props.children Estructura completa de la UI (layout).
 * @returns Contenedor `motion.div` con animación de layout opcional.
 *
 * @remarks
 * Funcionalidad:
 * - Usa `layout` de framer-motion para animar cambios estructurales.
 * - Si las animaciones están deshabilitadas, evita cualquier transición.
 * - Ideal para envolver layouts principales (ej: páginas, dashboards).
 */
export function AnimatedShell({ children }: Props) {
  /**
   * Indica si las animaciones globales están activadas.
   */
  const animated = useAnimationsEnabled();

  return (
    <motion.div
      /**
       * Activa animaciones de layout solo si están habilitadas.
       */
      layout={animated}

      /**
       * Transición condicional:
       * - animado → transición suave
       * - no animado → instantáneo
       */
      transition={animated ? TRANSITION : { duration: 0 }}

      /**
       * Layout base de la aplicación.
       */
      className="min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}