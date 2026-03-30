import type { Metadata } from "next";
import { PageTransition } from "@/app/components/ui/PageTransition";
import HelpPageContent from "./components/HelpPageContent";

export const metadata: Metadata = {
  title: "Help Center · EDM",
  description:
    "Centro de ayuda interno para soporte, guías, documentación y estado de servicios.",
};

export default async function HelpPage() {
  return (
    <PageTransition>
      <HelpPageContent />
    </PageTransition>
  );
}