"use client";

import { BarChart2 } from "lucide-react";

export default function DocumentosDashboard() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">

      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="h-4 w-4 text-indigo-600" />
        <p className="text-sm font-semibold text-slate-800">
          Analítica documental
        </p>
      </div>

      <div className="text-sm text-slate-500">
        Aquí se integrarán métricas como:

        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>Documentos creados por mes</li>
          <li>Tiempo medio de aprobación</li>
          <li>Cumplimiento documental</li>
          <li>Documentos por área</li>
        </ul>
      </div>

    </div>
  );
}