// app/(protected)/(intranet)/departments/human-resources/employees/page.tsx

import { Suspense }          from "react";
import { Users, RefreshCw } from "lucide-react";
import { getAllEmployees }   from "@/lib/graph/departments/employees.service";
import { EmployeeDirectory } from "./components/EmployeeDirectoryPage";

export const revalidate = 300;
export const metadata   = { title: "Directorio de Empleados · RRHH" };

export default async function EmployeesPage() {
  const employees = await getAllEmployees();
  const lastSync  = new Date().toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const total    = employees.length;
  const active   = employees.filter((e) => e.status === "active").length;
  const deptSet  = new Set(employees.map((e) => e.department).filter(Boolean));

  return (
    <main
      className="min-h-screen w-full bg-[#f4f6f9]"
      style={{ fontFamily: "'DM Sans', 'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* ── Hero banner ── */}
      <div className="bg-gradient-to-br from-violet-900 via-violet-800 to-violet-700 relative overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Glow orb */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-violet-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-10">
          {/* Breadcrumb */}
          <p className="text-violet-300/80 text-[11px] font-medium uppercase tracking-widest font-mono mb-5">
            Recursos Humanos · Directorio
          </p>

          <div className="flex items-start justify-between gap-6 flex-wrap">
            {/* Left */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg">
                <Users size={26} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight leading-tight">
                  Directorio de Empleados
                </h1>
                <p className="text-violet-200/80 text-sm mt-1">
                  Consulta, filtra y gestiona el personal activo de la empresa.
                </p>
              </div>
            </div>

            {/* Right — quick stats + actions */}
            <div className="flex items-center gap-3 flex-wrap">
              <HeroPill label="Total" value={total} suffix="personas" />
              <HeroPill label="Activos" value={active} accent />
              <HeroPill label="Departamentos" value={deptSet.size} />

              <div className="w-px h-8 bg-white/20 mx-1 hidden sm:block" />

              <button className="flex items-center gap-2 h-9 px-4 text-sm font-medium text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition backdrop-blur-sm">
                + Nuevo empleado
              </button>
            </div>
          </div>

          {/* Sync note */}
          <div className="flex items-center gap-1.5 mt-6">
            <RefreshCw size={11} className="text-violet-300/60" />
            <p className="text-[11px] text-violet-300/60 font-mono">Última sincronización: {lastSync}</p>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
          <Suspense fallback={<DirectorySkeleton />}>
            <EmployeeDirectory employees={employees} />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

function HeroPill({ label, value, suffix, accent }: {
  label: string; value: number; suffix?: string; accent?: boolean;
}) {
  return (
    <div className={`px-4 py-2 rounded-xl border backdrop-blur-sm ${accent ? "bg-white/15 border-white/30" : "bg-white/8 border-white/15"}`}>
      <p className="text-[10px] text-violet-300/70 uppercase tracking-widest font-mono">{label}</p>
      <p className="text-xl font-bold text-white leading-tight">
        {value}
        {suffix ? <span className="text-[11px] font-normal text-violet-200/60 ml-1">{suffix}</span> : null}
      </p>
    </div>
  );
}

function DirectorySkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex border-b border-slate-100 bg-slate-50/60">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="px-6 py-4 border-r border-slate-100 last:border-r-0">
            <div className="h-2.5 w-14 rounded bg-slate-200 mb-2" />
            <div className="h-6 w-8 rounded bg-slate-200" />
          </div>
        ))}
      </div>
      <div className="flex gap-3 px-8 py-3 border-b border-slate-100">
        <div className="h-8 flex-1 max-w-xs rounded-lg bg-slate-100" />
        <div className="h-8 w-40 rounded-lg bg-slate-100" />
        <div className="h-8 w-32 rounded-lg bg-slate-100" />
      </div>
      <div className="px-8 py-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-2.5 w-24 rounded bg-slate-100" />
          <div className="flex-1 h-px bg-slate-100" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-slate-100" />
          ))}
        </div>
      </div>
    </div>
  );
}