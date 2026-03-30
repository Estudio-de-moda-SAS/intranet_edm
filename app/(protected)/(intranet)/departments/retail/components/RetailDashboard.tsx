// ✅ SERVER COMPONENT — sin "use client"
//
// RetailDashboard.tsx
// Wrapper Server Component del dashboard analítico cross-canal.
// Delega la selección de canal al Client Component RetailDashboardTabs.
// Aquí se puede añadir data-fetching SSR en el futuro (getRetailAnalytics()).

import { RetailDashboardTabs } from "./RetailDashboardTabs";

export default function RetailDashboard() {
  // En el futuro: const analytics = await getRetailAnalytics();
  // Por ahora los dashboards de canal tienen sus propios datos internos.
  return <RetailDashboardTabs />;
}