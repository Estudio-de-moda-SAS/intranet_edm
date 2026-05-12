// app/(protected)/(intranet)/[tu-ruta]/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Próximamente | EDM Intranet",
  description: "Esta sección está en desarrollo.",
};

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-5xl">🚧</div>
      <h1 className="text-2xl font-semibold text-gray-800 dark:text-gray-100">
        Sección en desarrollo
      </h1>
      <p className="text-gray-500 dark:text-gray-400 max-w-sm">
        Esta página aún no está disponible. Estará lista próximamente.
      </p>
    </div>
  );
}