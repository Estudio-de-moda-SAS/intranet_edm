import { FinanceSummary } from "@/types/finance";

export default function FinanceKPIs({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      <div className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]">
        <p className="text-sm text-slate-500 dark:text-[#768390]">Balance</p>
        <p className="text-2xl font-semibold text-slate-800 dark:text-[#e6edf3]">
          ${summary.balance}
        </p>
      </div>

      <div className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]">
        <p className="text-sm text-slate-500 dark:text-[#768390]">Ingresos</p>
        <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
          ${summary.income}
        </p>
      </div>

      <div className="rounded-xl border p-5
                      bg-white border-slate-200
                      dark:bg-[#161b22] dark:border-[#30363d]">
        <p className="text-sm text-slate-500 dark:text-[#768390]">Gastos</p>
        <p className="text-2xl font-semibold text-rose-600 dark:text-rose-400">
          ${summary.expenses}
        </p>
      </div>

    </div>
  );
}

