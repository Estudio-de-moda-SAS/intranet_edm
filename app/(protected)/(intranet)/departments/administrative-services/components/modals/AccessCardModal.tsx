// app/(protected)/(intranet)/departments/administrative/components/modals/AccessCardModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal para gestión de tarjetas de acceso:
//   · Solicitar tarjeta nueva
//   · Reportar pérdida
//   · Reportar daño
//   · Desactivar
//
// Conecta a submitAccessCardRequest() — stub listo para MS Graph / API propia.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import {
  CreditCard, ShieldAlert, Wrench, ShieldOff,
  User, Mail, Building2, Hash, Zap,
} from "lucide-react";
import { Modal }          from "@/app/components/ui/Modal";
import {
  FieldWrapper, Input, Textarea,
  SubmitButton, SuccessBanner,
} from "@/app/(protected)/(intranet)/departments/administrative-services/forms/FormPrimitives";
import {
  submitAccessCardRequest,
  type AccessCardPayload,
  type AccessCardAction,
  type AccessCardResult,
} from "@/lib/graph/departments/administrative.service";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  open:          boolean;
  onClose:       () => void;
  /** Si viene desde un quick link con acción pre-seleccionada */
  defaultAction?: AccessCardAction;
}

// ── Action catalog ────────────────────────────────────────────────────────────

const ACTIONS: {
  value:       AccessCardAction;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  color:       string;
  accentBg:    string;
  needsCard:   boolean;   // requiere número de tarjeta actual
}[] = [
  {
    value:       "request_new",
    label:       "Solicitar nueva",
    description: "Para colaborador nuevo o sin tarjeta",
    icon:        <CreditCard size={18} />,
    color:       "text-sky-700",
    accentBg:    "bg-sky-50 border-sky-200",
    needsCard:   false,
  },
  {
    value:       "report_lost",
    label:       "Reportar pérdida",
    description: "Bloqueo inmediato y reposición",
    icon:        <ShieldAlert size={18} />,
    color:       "text-amber-700",
    accentBg:    "bg-amber-50 border-amber-200",
    needsCard:   true,
  },
  {
    value:       "report_damaged",
    label:       "Reportar daño",
    description: "Tarjeta dañada que no funciona",
    icon:        <Wrench size={18} />,
    color:       "text-orange-700",
    accentBg:    "bg-orange-50 border-orange-200",
    needsCard:   true,
  },
  {
    value:       "deactivate",
    label:       "Desactivar",
    description: "Retiro, baja o cambio de rol",
    icon:        <ShieldOff size={18} />,
    color:       "text-rose-700",
    accentBg:    "bg-rose-50 border-rose-200",
    needsCard:   true,
  },
];

const ZONE_OPTIONS = [
  { value: "general",    label: "Accesos generales" },
  { value: "offices",    label: "Oficinas"          },
  { value: "warehouse",  label: "Bodega"             },
  { value: "restricted", label: "Área restringida"  },
];

const INITIAL: AccessCardPayload = {
  action:         "request_new",
  employeeName:   "",
  employeeEmail:  "",
  department:     "",
  cardNumber:     "",
  zones:          [],
  reason:         "",
  urgency:        "normal",
};

type Errors = Partial<Record<keyof AccessCardPayload, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(payload: AccessCardPayload): Errors {
  const e: Errors = {};
  const meta = ACTIONS.find((a) => a.value === payload.action)!;

  if (!payload.employeeName?.trim())  e.employeeName  = "Campo requerido";
  if (!payload.employeeEmail?.trim()) e.employeeEmail = "Campo requerido";
  if (!payload.department?.trim())    e.department    = "Campo requerido";

  if (meta.needsCard && !payload.cardNumber?.trim())
    e.cardNumber = "Ingresa el número de tarjeta";

  if (payload.action === "request_new" && !payload.zones?.length)
    e.zones = "Selecciona al menos una zona" as never;

  if (!payload.reason?.trim()) e.reason = "Campo requerido";

  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AccessCardModal({ open, onClose, defaultAction }: Props) {
  const [payload, setPayload] = useState<AccessCardPayload>({
    ...INITIAL,
    action: defaultAction ?? "request_new",
  });
  const [errors,  setErrors]  = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<AccessCardResult | null>(null);
  const [done,    setDone]    = useState(false);

  const set = <K extends keyof AccessCardPayload>(
    key: K,
    value: AccessCardPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }));

  const toggleZone = (zone: string) => {
    const cur = payload.zones ?? [];
    set("zones", (cur.includes(zone as never)
      ? cur.filter((z) => z !== zone)
      : [...cur, zone]) as never
    );
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPayload({ ...INITIAL, action: defaultAction ?? "request_new" });
      setErrors({});
      setResult(null);
      setDone(false);
    }, 300);
  };

  const handleSubmit = async () => {
    const e = validate(payload);
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await submitAccessCardRequest(payload);
      setResult(res);
      setDone(true);
    } catch {
      setErrors({ reason: "Error al enviar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  const selectedAction = ACTIONS.find((a) => a.value === payload.action)!;
  const needsCard      = selectedAction.needsCard;

  const URGENCY_LABELS: Record<string, string> = {
    report_lost: "Esta acción bloqueará la tarjeta inmediatamente.",
    deactivate:  "La tarjeta quedará inactiva al procesar la solicitud.",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      // ↓ Fix: no pasar la prop cuando sea undefined (exactOptionalPropertyTypes)
      {...(!done && { title: "Gestión de tarjeta de acceso" })}
      {...(!done && { subtitle: "Solicita, reporta o desactiva tarjetas" })}
      size="md"
      accentColor="bg-rose-700"
      disableBackdropClose={loading}
      {...(!done
        ? {
            footer: (
              <div className="flex items-center justify-end gap-3">
                <SubmitButton
                  loading={false}
                  label="Cancelar"
                  onClick={handleClose}
                  variant="ghost"
                />
                <SubmitButton
                  loading={loading}
                  label="Enviar solicitud"
                  loadingLabel="Enviando…"
                  onClick={handleSubmit}
                />
              </div>
            ),
          }
        : {}
      )}
    >
      {done && result ? (
        <SuccessBanner
          title="Solicitud registrada"
          message={`Tiempo estimado de resolución: ${result.estimatedResolution}`}
          id={result.ticketId}
          onClose={handleClose}
          extra={
            payload.action === "report_lost" ? (
              <p className="rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5
                text-xs text-amber-700 font-medium">
                ⚠️ Tu tarjeta ha sido marcada como bloqueada. Por favor preséntate
                en recepción con tu documento de identidad para reactivar accesos temporales.
              </p>
            ) : null
          }
        />
      ) : (
        <div className="flex flex-col gap-4">

          {/* ── Selector de acción ──────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-2">
            {ACTIONS.map((action) => {
              const active = payload.action === action.value;
              return (
                <button
                  key={action.value}
                  type="button"
                  onClick={() => set("action", action.value)}
                  className={`
                    flex items-start gap-2.5 rounded-xl border p-3 text-left
                    transition-all duration-150
                    ${active
                      ? `${action.accentBg} shadow-sm`
                      : "border-slate-200 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/40"
                    }
                  `}
                >
                  <span className={`mt-0.5 ${active ? action.color : "text-slate-400"} transition-colors`}>
                    {action.icon}
                  </span>
                  <span>
                    <span className={`block text-xs font-semibold ${active ? action.color : "text-slate-700"}`}>
                      {action.label}
                    </span>
                    <span className="block text-[10px] text-slate-400 leading-tight">
                      {action.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Aviso contextual para acciones críticas */}
          {URGENCY_LABELS[payload.action] && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200
              px-3.5 py-2.5 text-[12px] text-amber-700 font-medium">
              <ShieldAlert size={14} className="shrink-0" />
              {URGENCY_LABELS[payload.action]}
            </p>
          )}

          {/* ── Datos del colaborador ──────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3">
            {/* ↓ Fix: spread condicional en lugar de pasar undefined directamente */}
            <FieldWrapper
              label="Nombre"
              required
              className="col-span-2"
              {...(errors.employeeName && { error: errors.employeeName })}
            >
              <Input
                icon={<User size={13} />}
                placeholder="Nombre completo"
                value={payload.employeeName ?? ""}
                onChange={(e) => set("employeeName", e.target.value)}
                error={!!errors.employeeName}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Correo"
              required
              {...(errors.employeeEmail && { error: errors.employeeEmail })}
            >
              <Input
                icon={<Mail size={13} />}
                type="email"
                placeholder="correo@empresa.com"
                value={payload.employeeEmail ?? ""}
                onChange={(e) => set("employeeEmail", e.target.value)}
                error={!!errors.employeeEmail}
              />
            </FieldWrapper>

            <FieldWrapper
              label="Departamento"
              required
              {...(errors.department && { error: errors.department })}
            >
              <Input
                icon={<Building2 size={13} />}
                placeholder="Departamento"
                value={payload.department ?? ""}
                onChange={(e) => set("department", e.target.value)}
                error={!!errors.department}
              />
            </FieldWrapper>
          </div>

          {/* Número de tarjeta — solo si needsCard */}
          {needsCard && (
            <FieldWrapper
              label="Número de tarjeta"
              required
              hint="Impreso en el anverso de la tarjeta"
              {...(errors.cardNumber && { error: errors.cardNumber })}
            >
              <Input
                icon={<Hash size={13} />}
                placeholder="Ej. TAR-004821"
                value={payload.cardNumber ?? ""}
                onChange={(e) => set("cardNumber", e.target.value)}
                error={!!errors.cardNumber}
              />
            </FieldWrapper>
          )}

          {/* Zonas — solo para request_new */}
          {payload.action === "request_new" && (
            <FieldWrapper
              label="Zonas de acceso requeridas"
              required
              {...(errors.zones && { error: errors.zones as string })}
            >
              <div className="grid grid-cols-2 gap-2">
                {ZONE_OPTIONS.map((z) => {
                  const checked = payload.zones?.includes(z.value as never) ?? false;
                  return (
                    <button
                      key={z.value}
                      type="button"
                      onClick={() => toggleZone(z.value)}
                      className={`
                        rounded-xl border px-3 py-2 text-left text-xs font-medium
                        transition-all duration-150
                        ${checked
                          ? "border-sky-300 bg-sky-50 text-sky-700"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-sky-200"
                        }
                      `}
                    >
                      {z.label}
                    </button>
                  );
                })}
              </div>
            </FieldWrapper>
          )}

          {/* Urgencia */}
          <FieldWrapper label="Urgencia">
            <div className="flex gap-2">
              {(["normal", "urgent"] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => set("urgency", u)}
                  className={`
                    flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium
                    transition-all duration-150
                    ${payload.urgency === u
                      ? u === "urgent"
                        ? "border-rose-300 bg-rose-50 text-rose-700"
                        : "border-slate-300 bg-slate-100 text-slate-700"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                    }
                  `}
                >
                  {u === "urgent" && <Zap size={12} className="text-rose-500" />}
                  {u === "urgent" ? "Urgente (24h)" : "Normal (48h)"}
                </button>
              ))}
            </div>
          </FieldWrapper>

          {/* Motivo / observaciones */}
          <FieldWrapper
            label="Motivo"
            required
            {...(errors.reason && { error: errors.reason })}
          >
            <Textarea
              placeholder="Describe brevemente el motivo de la solicitud…"
              value={payload.reason ?? ""}
              onChange={(e) => set("reason", e.target.value)}
              error={!!errors.reason}
            />
          </FieldWrapper>

        </div>
      )}
    </Modal>
  );
}