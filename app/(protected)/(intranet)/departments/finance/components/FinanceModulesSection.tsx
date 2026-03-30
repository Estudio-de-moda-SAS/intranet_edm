import Link from "next/link";
import {
  FileText, Receipt, PieChart, BarChart2,
  CreditCard, Users, ArrowRight, LayoutGrid,
} from "lucide-react";

type Module = {
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  accent: string;
  iconColor: string;
};

const MODULES: Module[] = [
  { label: "Facturas",     description: "Gestiona y haz seguimiento de facturas",         href: "/departments/finance/invoices",  icon: FileText,   accent: "bg-violet-50 border-violet-100", iconColor: "text-violet-600"  },
  { label: "Gastos",       description: "Registrar y revisar gastos operativos",           href: "/departments/finance/expenses",  icon: Receipt,    accent: "bg-amber-50 border-amber-100",   iconColor: "text-amber-600"   },
  { label: "Presupuestos", description: "Asignaciones de presupuesto por departamento",   href: "/departments/finance/budget",   icon: PieChart,   accent: "bg-emerald-50 border-emerald-100", iconColor: "text-emerald-600"},
  { label: "Reportes",     description: "Reportes financieros y análisis estratégico",    href: "/departments/finance/reports",   icon: BarChart2,  accent: "bg-sky-50 border-sky-100",       iconColor: "text-sky-600"     },
  { label: "Pagos",        description: "Gestionar pagos salientes y proveedores",        href: "/departments/finance/payments",  icon: CreditCard, accent: "bg-rose-50 border-rose-100",     iconColor: "text-rose-500"    },
  { label: "Proveedores",  description: "Gestión de proveedores y suministradores",       href: "/departments/finance/vendors",   icon: Users,      accent: "bg-indigo-50 border-indigo-100", iconColor: "text-indigo-600"  },
];

export default function FinanceModulesSection() {
  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50">
          <LayoutGrid className="h-3.5 w-3.5 text-violet-600" />
        </span>
        <h2 className="text-sm font-semibold text-slate-800">Módulos de Finanzas</h2>
        <div className="flex-1 h-px bg-slate-100 ml-1" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((mod) => (
          <Link
            key={mod.label}
            href={mod.href}
            className="group flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:border-violet-200 hover:-translate-y-0.5"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl border ${mod.accent}`}>
                <mod.icon className={`h-4 w-4 ${mod.iconColor}`} />
              </span>
              <ArrowRight className="h-4 w-4 text-slate-200 transition-all duration-200 group-hover:text-violet-400 group-hover:translate-x-0.5" />
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-slate-800 group-hover:text-violet-700 transition-colors">
                {mod.label}
              </h3>
              <p className="mt-0.5 text-[12px] text-slate-500 leading-relaxed">{mod.description}</p>
            </div>

            {/* Bottom hover bar */}
            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-300 group-hover:w-full rounded-b-xl" />
          </Link>
        ))}
      </div>
    </section>
  );
}