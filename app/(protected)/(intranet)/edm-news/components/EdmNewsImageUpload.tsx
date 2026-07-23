// app/(protected)/(intranet)/edm-news/components/EdmNewsImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import { getIdToken } from "@/app/api/auth/msal";

interface Props {
  value: string | null;
  onChange: (url: string | null) => void;
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 3,              // antes 1.5 — más margen para no perder detalle
  maxWidthOrHeight: 2200,    // antes 1600 — más resolución para piezas verticales largas
  initialQuality: 0.92,      // prioriza nitidez sobre peso
  useWebWorker: true,
  fileType: "image/jpeg" as const,
};

export function EdmNewsImageUpload({ value, onChange }: Props) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsUploading(true);

    try {
      // 1. Comprimir en el navegador ANTES de subir — reduce tamaño real
      //    tanto para Storage (1GB) como para el bandwidth de subida.
      const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

      // 2. Subir al backend
      const formData = new FormData();
      formData.append("file", compressed, file.name);

      const token = await getIdToken();
      const res = await fetch("/api/edm-news/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }, // sin Content-Type: el browser lo arma para FormData
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Error al subir la imagen");

      onChange(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al procesar la imagen");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  if (value) {
    return (
      <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-[#30363d]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={value} alt="Vista previa del aviso" className="w-full max-h-[320px] object-contain bg-slate-50 dark:bg-[#0d1117]" />
        <button
          type="button"
          onClick={() => onChange(null)}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-md"
          title="Quitar imagen"
        >
          <X className="h-4 w-4 text-slate-600" />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label
        className={`flex flex-col items-center justify-center gap-2 h-40 rounded-xl border-2 border-dashed cursor-pointer transition-colors
          ${isUploading ? "border-slate-200 bg-slate-50" : "border-slate-300 hover:border-violet-400 hover:bg-violet-50/50 dark:border-[#30363d] dark:hover:bg-violet-500/[0.06]"}`}
      >
        {isUploading ? (
          <>
            <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
            <span className="text-xs text-slate-400">Comprimiendo y subiendo...</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-slate-400" />
            <span className="text-xs text-slate-500">Haz clic para subir una imagen (JPG, PNG, WEBP)</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
        />
      </label>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}