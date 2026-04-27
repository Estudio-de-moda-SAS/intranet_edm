"use client";
/**
 * @module DocuSignPanel
 * Panel de firma electrónica — integración pendiente con DocuSign o similar.
 *
 * @remarks
 * Placeholder profesional que:
 * - Muestra documentos pendientes de firma (mock)
 * - Indica el estado de documentos enviados
 * - Está listo para conectar con DocuSign API o Adobe Sign
 *
 * TODO cuando se confirme la herramienta:
 * - DocuSign: usar API /v2.1/accounts/{accountId}/envelopes
 * - Adobe Sign: usar /api/rest/v6/agreements
 * - Power Automate: webhook que recibe estado de firma
 */

import {
  PenLine,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  ExternalLink,
  Plug,
} from "lucide-react";

type SignStatus = "pending" | "sent" | "signed" | "expired";

interface SignDocument {
  id:         string;
  title:      string;
  parties:    string[];
  status:     SignStatus;
  sentAt?:    string;
  expiresAt?: string;
  signedAt?:  string;
}

const MOCK_DOCS: SignDocument[] = [
  {
    id:        "sign-001",
    title:     "Contrato Marco de Servicios — TechProv SAS",
    parties:   ["Carlos Muñoz", "Proveedor TechProv"],
    status:    "sent",
    sentAt:    "2026-04-10T09:00:00Z",
    expiresAt: "2026-04-24T09:00:00Z",
  },
  {
    id:        "sign-002",
    title:     "Otrosí Nº 3 — Contrato Arrendamiento Bello",
    parties:   ["María Cardona", "Arrendatario"],
    status:    "pending",
    expiresAt: "2026-04-30T00:00:00Z",
  },
  {
    id:        "sign-003",
    title:     "Acuerdo de Confidencialidad — Consultor Externo",
    parties:   ["Gerencia Jurídica"],
    status:    "signed",
    sentAt:    "2026-04-01T10:00:00Z",
    signedAt:  "2026-04-03T14:22:00Z",
  },
  {
    id:        "sign-004",
    title:     "Convenio Interinstitucional — SENA",
    parties:   ["RRHH", "SENA Regional Antioquia"],
    status:    "expired",
    sentAt:    "2026-03-01T00:00:00Z",
    expiresAt: "2026-03-31T00:00:00Z",
  },
];

const STATUS_CONFIG: Record<SignStatus, {
  icon:   React.FC<{ size?: number; className?: string }>;
  color:  string;
  bg:     string;
  label:  string;
}> = {
  pending: { icon: Clock,         color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",   label: "Pendiente de envío" },
  sent:    { icon: Send,          color: "text-blue-600",    bg: "bg-blue-50 border-blue-200",     label: "Enviado — esperando firma" },
  signed:  { icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", label: "Firmado" },
  expired: { icon: AlertCircle,   color: "text-red-500",     bg: "bg-red-50 border-red-200",       label: "Vencido" },
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short" });
}

export function DocuSignPanel() {
  const pending = MOCK_DOCS.filter((d) => d.status === "pending" || d.status === "sent").length;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-700">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200">
          <PenLine size={13} className="text-indigo-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            Firma Electrónica
          </p>
          <p className="text-[11px] text-slate-400">Seguimiento de documentos para firmar</p>
        </div>
        {pending > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
            {pending}
          </span>
        )}
      </div>

      {/* Banner de integración pendiente */}
      <div className="mx-4 mt-3 flex items-start gap-2 rounded-lg border border-indigo-100 bg-indigo-50/60 px-3 py-2 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <Plug size={13} className="mt-0.5 shrink-0 text-indigo-500" />
        <div>
          <p className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
            Integración pendiente de configuración
          </p>
          <p className="text-[10px] text-indigo-500 dark:text-indigo-500 leading-relaxed">
            Datos de demostración. Se conectará con DocuSign, Adobe Sign o Power Automate
            una vez se confirme la herramienta de firma electrónica de EDM.
          </p>
        </div>
      </div>

      {/* Lista de documentos */}
      <div className="mt-3 flex flex-col divide-y divide-slate-50 px-0 dark:divide-slate-700/50">
        {MOCK_DOCS.map((doc) => {
          const cfg  = STATUS_CONFIG[doc.status];
          const Icon = cfg.icon;
          return (
            <div
              key={doc.id}
              className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/30"
            >
              <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${cfg.bg}`}>
                <Icon size={12} className={cfg.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-[12px] font-medium text-slate-700 dark:text-slate-200">
                  {doc.title}
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  {doc.parties.join(" · ")}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
                  {doc.signedAt && (
                    <span className="text-[10px] text-slate-400">Firmado: {formatDate(doc.signedAt)}</span>
                  )}
                  {doc.expiresAt && doc.status !== "signed" && (
                    <span className="text-[10px] text-slate-400">
                      Vence: {formatDate(doc.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-2 dark:border-slate-700">
        <p className="text-[11px] text-slate-400">
          {MOCK_DOCS.filter((d) => d.status === "signed").length} firmados · {pending} en proceso
        </p>
        <button className="flex items-center gap-1 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors">
          Ir a plataforma <ExternalLink size={10} />
        </button>
      </div>
    </div>
  );
}