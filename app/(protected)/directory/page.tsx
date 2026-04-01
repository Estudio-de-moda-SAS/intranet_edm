// ✅ SERVER COMPONENT — sin "use client"

import { Metadata } from "next";
import { MOCK_EMPLOYEES } from "./mockEmployees";
import { DirectoryClient } from "./components/DirectoryHomePage";

export const metadata: Metadata = {
  title: "Directorio | Intranet",
  description: "Directorio corporativo de empleados",
};

async function getEmployees() {
  // 🔄 TODO: Reemplazar con Microsoft Graph API
  return MOCK_EMPLOYEES;
}

export default async function DirectoryPage() {
  const employees = await getEmployees();

  return (
    <main className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg-base)' }}>

      {/* ── Page Header ── */}
      <div className="bg-gradient-to-br from-[#1e3a5f] via-[#1e40af] to-[#1d4ed8]
                       dark:from-[#0d1829] dark:via-[#111d3a] dark:to-[#0f2347]
                       px-4 lg:px-14 py-10 relative overflow-hidden">
        {/* Decoración */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }}
        />
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />

        <div className="relative">
          <p className="text-xs font-semibold text-white/50 uppercase tracking-widest mb-1">
            Intranet · Directorio
          </p>
          <h1
            className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Directorio de Empleados
          </h1>
          <p className="text-sm text-white/60 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Encuentra información de contacto de todos los colaboradores
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 lg:px-14 py-7 pb-12">
        <DirectoryClient employees={employees} />
      </div>

    </main>
  );
}