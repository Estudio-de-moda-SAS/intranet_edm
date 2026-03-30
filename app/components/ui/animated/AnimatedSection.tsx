"use client";

// 📁 UBICACIÓN CANÓNICA: app/components/ui/animated/AnimatedSection.tsx
//
// Contenedor con staggerChildren para grids y columnas.
// Reemplaza el patrón motion.div variants={sectionReveal} que se repite
// en CommercialPageClient, y que también aparecerá en RRHH, Producción, etc.
//
// Uso:
//   <AnimatedSection className="grid grid-cols-12 gap-6">
//     <AnimatedCard><MiCard /></AnimatedCard>
//     <AnimatedCard delay={0.1}><OtraCard /></AnimatedCard>
//   </AnimatedSection>

import { motion, type Variants } from "framer-motion";

type Props = {
  children:   React.ReactNode;
  className?: string;
  delay?:     number;      // delayChildren
  stagger?:   number;      // staggerChildren (default 0.1)
};

const container = (delay: number, stagger: number): Variants => ({
  hidden: {},
  show:   { transition: { staggerChildren: stagger, delayChildren: delay } },
});

export function AnimatedSection({ children, className, delay = 0.2, stagger = 0.1 }: Props) {
  return (
    <motion.div
      variants={container(delay, stagger)}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}