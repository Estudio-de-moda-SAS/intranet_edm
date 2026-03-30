"use client";

import { motion } from "framer-motion";
import { Users, TrendingUp, TrendingDown, Minus } from "lucide-react";

type Dept = {
  name: string;
  total: number;
  change: number;
  fill: number; // % of max headcount capacity
  color: string;
  bg: string;
};

const DEPARTMENTS: Dept[] = [
  { name: "Ventas",       total: 68,  change: +3,  fill: 85, color: "bg-violet-500",  bg: "bg-violet-50"  },
  { name: "Operaciones",  total: 74,  change: +1,  fill: 92, color: "bg-indigo-500",  bg: "bg-indigo-50"  },
  { name: "TI",           total: 28,  change: +2,  fill: 70, color: "bg-sky-500",     bg: "bg-sky-50"     },
  { name: "Finanzas",     total: 19,  change: 0,   fill: 95, color: "bg-emerald-500", bg: "bg-emerald-50" },
  { name: "RRHH",         total: 12,  change: +1,  fill: 80, color: "bg-rose-500",    bg: "bg-rose-50"    },
  { name: "Marketing",    total: 22,  change: -1,  fill: 73, color: "bg-amber-500",   bg: "bg-amber-50"   },
  { name: "Diseño",       total: 31,  change: +2,  fill: 88, color: "bg-purple-500",  bg: "bg-purple-50"  },
  { name: "Logística",    total: 30,  change: 0,   fill: 60, color: "bg-teal-500",    bg: "bg-teal-50"    },
];

export default function HRHeadcountSection() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <Users className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800">Headcount por Departamento</h2>
        <div className="flex-1 h-px bg-slate-100 ml-2" />
        <span className="text-[11px] font-semibold text-slate-400">
          284 empleados totales
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {DEPARTMENTS.map((dept, i) => (
          <motion.div
            key={dept.name}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-violet-200 transition-all duration-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${dept.bg}`}>
                <Users className={`h-3.5 w-3.5 ${dept.color.replace("bg-", "text-")}`} />
              </span>
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                dept.change > 0 ? "text-emerald-600" :
                dept.change < 0 ? "text-rose-500" : "text-slate-400"
              }`}>
                {dept.change > 0 ? <TrendingUp className="h-2.5 w-2.5" /> :
                 dept.change < 0 ? <TrendingDown className="h-2.5 w-2.5" /> :
                 <Minus className="h-2.5 w-2.5" />}
                {dept.change > 0 ? `+${dept.change}` : dept.change}
              </span>
            </div>

            <p className="text-2xl font-bold text-slate-900 tabular-nums leading-none">
              {dept.total}
            </p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-500">{dept.name}</p>

            {/* Capacity bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${dept.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${dept.fill}%` }}
                transition={{ duration: 0.7, delay: 0.2 + i * 0.05, ease: "easeOut" }}
              />
            </div>
            <p className="mt-1 text-[9px] text-slate-400">{dept.fill}% capacidad</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}