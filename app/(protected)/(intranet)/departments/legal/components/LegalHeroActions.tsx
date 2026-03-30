"use client";
// app/(protected)/(intranet)/departments/legal/components/LegalHeroActions.tsx

import { FilePlus, FileSignature, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LegalHeroActions() {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => router.push("/legal/requests/new")}
        className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200"
      >
        <FilePlus size={15} />
        Nueva solicitud
      </button>
      <button
        onClick={() => router.push("/legal/contracts")}
        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-all duration-200"
      >
        <FileSignature size={15} />
        Contratos
      </button>
      <button
        onClick={() => router.push("/legal/compliance")}
        className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm border border-white/15 hover:bg-white/20 transition-all duration-200"
      >
        <ShieldCheck size={15} />
        Compliance
      </button>
    </div>
  );
}