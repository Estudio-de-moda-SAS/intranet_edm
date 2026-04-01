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

type Props = {
  children:   React.ReactNode;
  delay?:     number;
  className?: string;
  whenInView?: boolean;   // true → whileInView, false → animate al montar
  margin?:    string;     // viewport margin para whenInView (default "-60px")
};

const reveal: Variants = {
  hidden: { opacity: 0, y: 28 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const instant: Variants = {
  hidden: { opacity: 1, y: 0 },
  show:   { opacity: 1, y: 0 },
};

export function AnimatedCard({ children, delay = 0, className, whenInView = false, margin = "-60px" }: Props) {
  const animated = useAnimationsEnabled();
  const variants = animated ? reveal : instant;
  const initial  = "hidden";

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
