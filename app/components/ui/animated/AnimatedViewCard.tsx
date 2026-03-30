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

type Props = {
  children:   React.ReactNode;
  className?: string;
  margin?:    string;  // viewport margin (default "-60px")
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function AnimatedViewCard({ children, className, margin = "-60px" }: Props) {
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