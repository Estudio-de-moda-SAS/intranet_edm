import { apiGet } from "./client";
import type { FinanceKPIs, FinanceDashboard } from "@/types/finance";

export const financeApi = {
  getKPIs:      () => apiGet<FinanceKPIs>("/finance/kpis"),
  getDashboard: () => apiGet<FinanceDashboard>("/finance/dashboard"),
};