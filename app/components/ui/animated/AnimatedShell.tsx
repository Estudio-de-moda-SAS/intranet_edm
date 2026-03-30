"use client";

// ✅ CLIENT COMPONENT — la única razón de existir es el motion.div
// que envuelve el layout completo. Es el boundary cliente más alto
// del árbol, pero al ser tan pequeño no arrastra nada al cliente
// que no lo necesite.
//
// Nota sobre motion.main:
//   Se eliminó el motion.main que estaba en el ClientLayout original.
//   El prop `layout` en un contenedor tan alto en el árbol dispara
//   re-layouts costosos en cada navegación sin beneficio visual real.
//   Si necesitas animar la transición entre páginas, es mejor usar
//   PageTransition a nivel de cada page (como ya lo tienes en HomePage).

import { motion } from "framer-motion";

const TRANSITION = { duration: 0.3, ease: "easeInOut" } as const;

export function AnimatedShell({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      layout
      transition={TRANSITION}
      className="min-h-screen flex flex-col"
    >
      {children}
    </motion.div>
  );
}