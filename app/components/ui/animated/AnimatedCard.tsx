"use client";

// 📁 UBICACIÓN CANÓNICA: app/components/ui/animated/AnimatedCard.tsx
//
// Wrapper de animación de entrada reutilizable para cualquier card/sección.
// Úsalo en HOME, COMERCIAL, RRHH, y cualquier página futura.
//
// Uso:
//   <AnimatedCard delay={0.12}>
//     <MiServerComponent />   ← sus children siguen siendo Server Components
//   </AnimatedCard>

import { motion, type Variants } from "framer-motion";

type Props = {
  children:  React.ReactNode;
  delay?:    number;
  className?: string;
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function AnimatedCard({ children, delay = 0, className }: Props) {
  return (
    <motion.div
      variants={reveal}
      initial="hidden"
      animate="show"
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}