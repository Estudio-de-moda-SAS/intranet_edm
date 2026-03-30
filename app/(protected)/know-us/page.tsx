// app/company/page.tsx
// ✅ SERVER COMPONENT

import { CompanyPageContent } from "./components/KnowUsPageContent";

export const metadata = {
  title: "Conoce la Empresa | Intranet EDM",
  description: "Historia, valores, marcas y equipo de Estudio de Moda S.A.S.",
};

export default function CompanyPage() {
  return <CompanyPageContent />;
}