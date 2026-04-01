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

type Props = {
  children:   React.ReactNode;
  className?: string;
  delay?:     number;
  stagger?:   number;
};

export function AnimatedSection({ children, className, delay = 0.2, stagger = 0.1 }: Props) {
  const animated = useAnimationsEnabled();

  const container: Variants = animated
    ? { hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }
    : { hidden: {}, show: {} };

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
