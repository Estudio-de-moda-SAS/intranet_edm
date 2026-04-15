/**
 * @module FinanceModulesSection
 * Sección de navegación principal hacia los submódulos del área financiera.
 *
 * @remarks
 * Este componente presenta el conjunto de accesos principales
 * a los módulos funcionales del departamento de Finanzas.
 *
 * Su objetivo es ofrecer una navegación clara, visual y directa
 * hacia las capacidades más relevantes del dominio financiero,
 * tales como:
 *
 * - facturación
 * - gastos
 * - presupuestos
 * - reportes
 * - pagos
 * - proveedores
 *
 * La sección está construida a partir de una configuración estática
 * de módulos y delega en la interfaz visual la representación
 * del acceso, descripción e identidad cromática de cada bloque.
 */

import Link from "next/link";
import {
  FileText,
  Receipt,
  PieChart,
  BarChart2,
  CreditCard,
  Users,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";

/* -------------------------------------------------------------------------- */
/* Tipos de dominio                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Representa un módulo navegable dentro del área financiera.
 *
 * @property label Nombre visible del módulo.
 * @property description Descripción breve de su propósito funcional.
 * @property href Ruta de navegación asociada.
 * @property icon Ícono representativo del módulo.
 * @property accent Clases visuales del contenedor del ícono.
 * @property iconColor Clases visuales del color del ícono.
 */
type Module = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  accent: string;
  iconColor: string;
};

/* -------------------------------------------------------------------------- */
/* Configuración de módulos                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Colección de módulos disponibles en la home financiera.
 *
 * @remarks
 * Cada entrada define:
 *
 * - identidad del módulo
 * - descripción funcional
 * - ruta objetivo
 * - iconografía
 * - estilo visual del acceso
 *
 * Esta configuración permite desacoplar la definición
 * del catálogo de módulos respecto al render visual.
 */
const MODULES: Module[] = [
  {
    label: "Facturas",
    description: "Gestiona y haz seguimiento de facturas",
    href: "/departments/finance/invoices",
    icon: FileText,
    accent:
      "bg-violet-50 border-violet-100 dark:bg-violet-500/[0.10] dark:border-violet-500/20",
    iconColor: "text-violet-600 dark:text-violet-400",
  },
  {
    label: "Gastos",
    description: "Registrar y revisar gastos operativos",
    href: "/departments/finance/expenses",
    icon: Receipt,
    accent:
      "bg-amber-50 border-amber-100 dark:bg-amber-500/[0.10] dark:border-amber-500/20",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    label: "Presupuestos",
    description: "Asignaciones de presupuesto por departamento",
    href: "/departments/finance/budget",
    icon: PieChart,
    accent:
      "bg-emerald-50 border-emerald-100 dark:bg-emerald-500/[0.10] dark:border-emerald-500/20",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    label: "Reportes",
    description: "Reportes financieros y análisis estratégico",
    href: "/departments/finance/reports",
    icon: BarChart2,
    accent:
      "bg-sky-50 border-sky-100 dark:bg-sky-500/[0.10] dark:border-sky-500/20",
    iconColor: "text-sky-600 dark:text-sky-400",
  },
  {
    label: "Pagos",
    description: "Gestionar pagos salientes y proveedores",
    href: "/departments/finance/payments",
    icon: CreditCard,
    accent:
      "bg-rose-50 border-rose-100 dark:bg-rose-500/[0.10] dark:border-rose-500/20",
    iconColor: "text-rose-500 dark:text-rose-400",
  },
  {
    label: "Proveedores",
    description: "Gestión de proveedores y suministradores",
    href: "/departments/finance/vendors",
    icon: Users,
    accent:
      "bg-indigo-50 border-indigo-100 dark:bg-indigo-500/[0.10] dark:border-indigo-500/20",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
];

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Sección de módulos del área de Finanzas.
 *
 * @returns Grid de accesos navegables a los principales submódulos financieros.
 *
 * @remarks
 * Este componente:
 *
 * - renderiza un encabezado contextual para la sección
 * - recorre la colección de módulos configurados
 * - construye una tarjeta navegable por cada módulo
 * - aplica estados visuales de hover y realce
 *
 * Cada tarjeta actúa como punto de entrada
 * a una capacidad funcional del dominio financiero.
 *
 * @example
 * ```tsx
 * <FinanceModulesSection />
 * ```
 */
export default function FinanceModulesSection() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg
                         bg-violet-50 dark:bg-violet-500/[0.12]"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
        </span>

        <h2 className="text-sm font-semibold text-slate-800 dark:text-[#e6edf3]">
          Módulos de Finanzas
        </h2>

        <div className="flex-1 h-px bg-slate-100 dark:bg-[#21262d] ml-1" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <Link
            key={mod.label}
            href={mod.href}
            className="group relative flex flex-col gap-3 rounded-xl border p-5 shadow-sm
                       transition-all duration-200
                       border-slate-200 bg-white
                       hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5
                       dark:border-[#30363d] dark:bg-[#161b22]
                       dark:hover:border-violet-500/40 dark:hover:bg-[#1c2128]
                       overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${mod.accent}`}>
                <mod.icon className={`h-4 w-4 ${mod.iconColor}`} />
              </span>

              <ArrowRight
                className="h-4 w-4 transition-all duration-200
                                     text-slate-200 group-hover:text-violet-400 group-hover:translate-x-0.5
                                     dark:text-[#30363d] dark:group-hover:text-violet-400"
              />
            </div>

            <div>
              <h3
                className="text-[13px] font-semibold transition-colors
                             text-slate-800 group-hover:text-violet-700
                             dark:text-[#e6edf3] dark:group-hover:text-violet-400"
              >
                {mod.label}
              </h3>

              <p
                className="mt-0.5 text-[12px] leading-relaxed
                            text-slate-500 dark:text-[#768390]"
              >
                {mod.description}
              </p>
            </div>

            {/* Bottom hover bar */}
            <div
              className="absolute bottom-0 left-0 h-[2px] w-0 rounded-b-xl
                            bg-gradient-to-r from-violet-500 to-fuchsia-500
                            transition-all duration-300 group-hover:w-full"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}