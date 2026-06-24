"use client";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import { ORGANIZATION_GRAPH_CONFIG } from "./config/organizationGraph.config";
import { OrganizationChart } from "./components/OrganizationChart";
import "./organization.css";

export function OrganizationPageContent() {
  return (
    <main className="organization-page">
      <DepartmentHeroBanner
        title="Organigrama"
        subtitle="Consulta la estructura corporativa de Estudio de Moda S.A.S., sus áreas internas y relaciones jerárquicas."
        gradientFrom="from-slate-950"
        gradientVia="via-violet-950"
        gradientTo="to-violet-700"
        dotPatternId="organization-hero-pattern"
        pills={[
          { type: "status", text: "Organigrama corporativo" },
          { type: "info", text: "Microsoft Graph" },
        ]}
      />

      <section className="organization-section-header">
        <span>Organigrama</span>

        <h2>Estructura organizacional</h2>

        <p>
          Explora la estructura real de la compañía,
          consulta cargos corporativos, responsables y relaciones jerárquicas.
        </p>
      </section>

      <OrganizationChart
        rootUserEmail={ORGANIZATION_GRAPH_CONFIG.rootUserEmail}
        maxDepth={ORGANIZATION_GRAPH_CONFIG.maxDepth}
      />
    </main>
  );
}