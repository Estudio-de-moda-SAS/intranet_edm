// ✅ SERVER COMPONENT — sin "use client"
import { ChevronRight, Receipt } from 'lucide-react';
import Link from 'next/link';

export function ExpensePageHeader() {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-2">
        <Link
          href="/departments/finance"
          className="hover:text-violet-600 transition-colors"
        >
          Finanzas
        </Link>
        <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
        <span className="text-violet-600 font-medium">Gastos operativos</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
          <Receipt className="h-5 w-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-[26px] font-bold tracking-tight text-slate-900 leading-tight">
            Gestión de Gastos
          </h1>
          <p className="text-[13px] text-slate-400 mt-0.5">
            Registra, aprueba y controla los gastos operativos de la empresa
          </p>
        </div>
      </div>
    </div>
  );
}
