"use client";

import { Network } from "lucide-react";
import { ORGANIZATION_GRAPH_CONFIG } from "./config/organizationGraph.config";
import { OrganizationChart } from "./components/OrganizationChart";
import "./organization.css";

export function OrganizationPageContent() {
  return (
    <main className="organization-page">
      <div className="mb-6 flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50">
          <Network className="h-4 w-4 text-violet-600" />
        </span>

        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Estructura organizacional
          </h2>
          <p className="text-sm text-slate-500">
            Explora la estructura real de la compañía, consulta cargos
            corporativos, responsables y relaciones jerárquicas.
          </p>
        </div>
      </div>

      <OrganizationChart
        rootUserEmail={ORGANIZATION_GRAPH_CONFIG.rootUserEmail}
        maxDepth={ORGANIZATION_GRAPH_CONFIG.maxDepth}
      />
    </main>
  );
}