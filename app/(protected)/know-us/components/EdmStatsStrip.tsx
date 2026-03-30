"use client";
// ✅ CLIENT COMPONENT — stagger animation igual que AnimatedKPIStrip

import { motion } from "framer-motion";

type Stat = {
  label: string;
  value: string;
  icon?: string;
};

type Props = { stats: Stat[] };

export function CompanyStatsStrip({ stats }: Props) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.08 } },
      }}
      className="grid grid-cols-2 gap-3 py-5 sm:grid-cols-4"
    >
      {stats.map((stat) => (
        <motion.div
          key={stat.label}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
          className="flex flex-col items-center justify-center rounded-2xl bg-white px-4 py-5 shadow-sm border border-gray-100 text-center gap-1"
        >
          {stat.icon && <span className="text-2xl mb-1">{stat.icon}</span>}
          <span className="text-2xl font-bold text-[#1e4976]">{stat.value}</span>
          <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
        </motion.div>
      ))}
    </motion.div>
  );
}