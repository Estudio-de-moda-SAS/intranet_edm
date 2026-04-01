"use client";

// 📁 app/components/ui/animated/AnimatedShell.tsx

import { motion } from "framer-motion";
import { useAnimationsEnabled } from "@/app/hooks/useAnimationsEnabled";

const TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;

export function AnimatedShell({ children }: { children: React.ReactNode }) {
  const animated = useAnimationsEnabled();

  return (
    <motion.div
      layout={animated}
      transition={animated ? TRANSITION : { duration: 0 }}
      className="min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}
