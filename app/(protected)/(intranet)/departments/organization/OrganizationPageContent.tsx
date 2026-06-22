"use client";

import { DepartmentHeroBanner } from "@/app/components/ui/animated/DepartmentHeroBanner";
import {
  ORGANIZATION_STRUCTURE,
} from "./config/organization.config";
import { OrganizationChart } from "./components/OrganizationChart";
import "./organization.css";

export function OrganizationPageContent() {
  return (
    <main className="organization-page">
      <DepartmentHeroBanner
        title="Nuestra Organización"
        subtitle="Consulta la estructura corporativa de Estudio de Moda S.A.S., sus principales áreas internas y líneas generales de gestión."
        gradientFrom="from-slate-950"
        gradientVia="via-violet-950"
        gradientTo="to-violet-700"
        dotPatternId="organization-hero-pattern"
        pills={[
          { type: "status", text: "Organigrama corporativo" },
          { type: "info", text: "Estructura interna" },
        ]}
      />

      <section className="organization-section-header">
        <span>Organigrama</span>

        <h2>Estructura organizacional</h2>

        <p>
          Explora la estructura de la compañía, conoce las áreas que conforman
          la organización, identifica responsables y comprende las relaciones
          jerárquicas entre equipos. Esta base está preparada para futuras
          integraciones con Microsoft Graph y directorio corporativo.
        </p>
      </section>

      <OrganizationChart
        structure={ORGANIZATION_STRUCTURE}
      />
    </main>
  );
}