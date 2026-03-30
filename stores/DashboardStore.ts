import { create } from "zustand";

interface DashboardState {
  revenue: number[]
  setRevenue: (data:number[]) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  revenue: [400,300,500,700,600,800],
  setRevenue: (data) => set({ revenue:data })
}));