export type FinanceTransaction = {
  id: string
  type: "income" | "expense"
  category: string
  amount: number
  date: string
}

export type FinanceSummary = {
  balance: number
  income: number
  expenses: number
}

export type FinanceCategory = {
  name: string
  total: number
}

export type FinanceKPIs = {
  balance: number
  income: number
  expenses: number
  transactions: number
}

export type FinanceDashboard = {
  summary: FinanceSummary
  transactions: FinanceTransaction[]
  categories: FinanceCategory[]
}