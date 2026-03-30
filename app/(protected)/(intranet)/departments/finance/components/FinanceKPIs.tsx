import { FinanceSummary } from "@/types/finance"

export default function FinanceKPIs({ summary }: { summary: FinanceSummary }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">

      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Balance</p>
        <p className="text-2xl font-semibold">${summary.balance}</p>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Ingresos</p>
        <p className="text-2xl font-semibold text-green-600">
          ${summary.income}
        </p>
      </div>

      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Gastos</p>
        <p className="text-2xl font-semibold text-red-600">
          ${summary.expenses}
        </p>
      </div>

    </div>
  )
}