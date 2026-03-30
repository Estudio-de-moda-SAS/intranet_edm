// app/(protected)/(intranet)/departments/administrative/components/modals/NewRequestModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal wizard de 3 pasos para crear una solicitud administrativa.
// Paso 1 → elegir categoría (acceso / sala / servicio general)
// Paso 2 → detalle según categoría
// Paso 3 → confirmación + resumen
//
// La función createAdminRequest() está lista para conectar a MS Graph o API propia.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import {
  KeyRound, CalendarDays, Wrench,
  User, Mail, Building2, AlertCircle,
  ChevronRight,
} from "lucide-react";
import { Modal }          from "@/app/components/ui/Modal";
import {
  FieldWrapper, Input, Textarea, Select,
  StepIndicator,
  SubmitButton, SuccessBanner,
} from "@/app/(protected)/(intranet)/departments/administrative-services/forms/FormPrimitives";
import {
  createAdminRequest,
  type NewRequestPayload,
  type RequestCategory,
  type NewRequestResult,
} from "@/lib/graph/departments/administrative.service";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open:    boolean;
  onClose: () => void;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STEPS = ["Categoría", "Detalle", "Confirmar"];

const CATEGORIES: {
  value:       RequestCategory;
  label:       string;
  description: string;
  icon:        React.ReactNode;
}[] = [
  {
    value:       "access",
    label:       "Acceso",
    description: "Tarjeta, zona restringida o permiso temporal",
    icon:        <KeyRound size={20} />,
  },
  {
    value:       "room",
    label:       "Sala",
    description: "Reserva puntual con equipamiento",
    icon:        <CalendarDays size={20} />,
  },
  {
    value:       "service",
    label:       "Servicio",
    description: "Mensajería, mantenimiento u otro",
    icon:        <Wrench size={20} />,
  },
];

const PRIORITY_OPTIONS = [
  { value: "low",    label: "Baja"  },
  { value: "medium", label: "Media" },
  { value: "high",   label: "Alta"  },
];

const ACCESS_ZONE_OPTIONS = [
  {
    value:       "general",
    label:       "General",
    description: "Accesos comunes y lobby",
  },
  {
    value:       "offices",
    label:       "Oficinas",
    description: "Pisos de trabajo",
  },
  {
    value:       "warehouse",
    label:       "Bodega",
    description: "Almacén y despacho",
  },
  {
    value:       "restricted",
    label:       "Restringida",
    description: "Sala de servidores, dirección",
  },
];

const SERVICE_TYPE_OPTIONS = [
  { value: "mensajeria",    label: "Mensajería / envíos"     },
  { value: "mantenimiento", label: "Mantenimiento"            },
  { value: "limpieza",      label: "Limpieza especial"        },
  { value: "cafeteria",     label: "Cafetería / suministros"  },
  { value: "otro",          label: "Otro"                     },
];

// ── Initial State ─────────────────────────────────────────────────────────────
// Fix: attendeesCount omitido del objeto inicial para no asignar `undefined`
// a una prop opcional con exactOptionalPropertyTypes: true

const INITIAL: NewRequestPayload = {
  category:        "access",
  title:           "",
  description:     "",
  priority:        "medium",
  accessZones:     [],
  accessStartDate: "",
  accessEndDate:   "",
  roomDate:        "",
  roomStartTime:   "",
  roomEndTime:     "",
  serviceType:     "",
  requesterName:   "",
  requesterEmail:  "",
  department:      "",
  // attendeesCount: omitido intencionalmente — es opcional y no debe ser undefined explícito
};

// ── Validation ────────────────────────────────────────────────────────────────

type Errors = Partial<Record<keyof NewRequestPayload | "accessZones_err", string>>;

function validateStep2(payload: NewRequestPayload): Errors {
  const e: Errors = {};
  if (!payload.title.trim())       e.title       = "Campo requerido";
  if (!payload.description.trim()) e.description = "Campo requerido";
  if (payload.category === "access") {
    if (!payload.accessZones?.length) e.accessZones_err = "Selecciona al menos una zona";
    if (!payload.accessStartDate)     e.accessStartDate = "Fecha requerida";
  }
  if (payload.category === "room") {
    if (!payload.roomDate)       e.roomDate      = "Fecha requerida";
    if (!payload.roomStartTime)  e.roomStartTime = "Hora de inicio requerida";
    if (!payload.roomEndTime)    e.roomEndTime   = "Hora de fin requerida";
  }
  if (payload.category === "service") {
    if (!payload.serviceType)    e.serviceType   = "Selecciona un tipo";
  }
  return e;
}

function validateStep3(payload: NewRequestPayload): Errors {
  const e: Errors = {};
  if (!payload.requesterName?.trim())  e.requesterName  = "Campo requerido";
  if (!payload.requesterEmail?.trim()) e.requesterEmail = "Campo requerido";
  if (!payload.department?.trim())     e.department     = "Campo requerido";
  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NewRequestModal({ open, onClose }: Props) {
  const [step,    setStep]    = useState(0);
  const [payload, setPayload] = useState<NewRequestPayload>(INITIAL);
  const [errors,  setErrors]  = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<NewRequestResult | null>(null);

  // ── helpers ──────────────────────────────────────────────────────────────

  const set = <K extends keyof NewRequestPayload>(
    key: K,
    value: NewRequestPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }));

  const handleClose = () => {
    onClose();
    // reset al cerrar — pequeño delay para no ver el flash
    setTimeout(() => {
      setStep(0);
      setPayload(INITIAL);
      setErrors({});
      setResult(null);
    }, 300);
  };

  // ── navigation ───────────────────────────────────────────────────────────

  const goNext = () => {
    if (step === 1) {
      const e = validateStep2(payload);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    if (step === 2) {
      const e = validateStep3(payload);
      if (Object.keys(e).length) { setErrors(e); return; }
    }
    setErrors({});
    setStep((s) => s + 1);
  };

  const goBack = () => { setErrors({}); setStep((s) => s - 1); };

  // ── submit ───────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const e = validateStep3(payload);
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res = await createAdminRequest(payload);
      setResult(res);
      setStep(3); // pantalla de éxito
    } catch {
      setErrors({ title: "Error al enviar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  // ── modal title por paso ─────────────────────────────────────────────────

  const MODAL_TITLES = [
    "Nueva solicitud",
    "Detalle de solicitud",
    "Solicitante",
  ];
  const MODAL_SUBTITLES = [
    "¿Qué tipo de solicitud necesitas?",
    "Completa la información requerida",
    "¿Quién realiza esta solicitud?",
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      // Fix: no pasar las props cuando sean undefined (exactOptionalPropertyTypes)
      {...(step < 3 && { title: MODAL_TITLES[step] })}
      {...(step < 3 && { subtitle: MODAL_SUBTITLES[step] })}
      size="md"
      accentColor="bg-rose-700"
      disableBackdropClose={step > 0}
      {...(step < 3
        ? {
            footer: (
              <div className="flex items-center justify-between">
                {step > 0 ? (
                  <SubmitButton
                    loading={false}
                    label="← Atrás"
                    onClick={goBack}
                    variant="ghost"
                  />
                ) : (
                  <span />
                )}
                {step < 2 ? (
                  <SubmitButton
                    loading={false}
                    label="Continuar"
                    onClick={goNext}
                  />
                ) : (
                  <SubmitButton
                    loading={loading}
                    label="Enviar solicitud"
                    loadingLabel="Enviando…"
                    onClick={handleSubmit}
                  />
                )}
              </div>
            ),
          }
        : {}
      )}
    >
      {/* Step indicator */}
      {step < 3 && (
        <div className="-mt-1 mb-5">
          <StepIndicator steps={STEPS} current={step} />
        </div>
      )}

      {/* ── STEP 0 — Categoría ─────────────────────────────────────────── */}
      {step === 0 && (
        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => {
            const selected = payload.category === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => {
                  set("category", cat.value);
                  // auto-avanza al paso 1
                  setTimeout(() => {
                    setErrors({});
                    setStep(1);
                  }, 180);
                }}
                className={`
                  group flex items-center gap-4 rounded-2xl border p-4 text-left
                  transition-all duration-200
                  ${selected
                    ? "border-rose-300 bg-rose-50 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:border-rose-200 hover:bg-rose-50/50"
                  }
                `}
              >
                <span className={`
                  flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border
                  transition-colors
                  ${selected
                    ? "border-rose-300 bg-rose-100 text-rose-700"
                    : "border-slate-200 bg-white text-slate-400 group-hover:border-rose-200 group-hover:text-rose-600"
                  }
                `}>
                  {cat.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${selected ? "text-rose-800" : "text-slate-800"}`}>
                    {cat.label}
                  </p>
                  <p className="text-[12px] text-slate-400">{cat.description}</p>
                </div>
                <ChevronRight
                  size={16}
                  className={`shrink-0 transition-colors
                    ${selected ? "text-rose-400" : "text-slate-300 group-hover:text-rose-300"}`
                  }
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── STEP 1 — Detalle ───────────────────────────────────────────── */}
      {step === 1 && (
        <div className="flex flex-col gap-4">
          {/* Error global */}
          {errors.title && (
            <p className="flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200
              px-3 py-2 text-xs text-rose-700">
              <AlertCircle size={13} /> {errors.title}
            </p>
          )}

          {/* Fix: spread condicional en lugar de pasar undefined directamente */}
          <FieldWrapper label="Título" required {...(errors.title && { error: errors.title })}>
            <Input
              placeholder="Ej. Tarjeta de acceso para colaborador nuevo"
              value={payload.title}
              onChange={(e) => set("title", e.target.value)}
              error={!!errors.title}
            />
          </FieldWrapper>

          <FieldWrapper label="Prioridad">
            <Select
              options={PRIORITY_OPTIONS}
              value={payload.priority}
              onChange={(e) => set("priority", e.target.value as NewRequestPayload["priority"])}
            />
          </FieldWrapper>

          <FieldWrapper label="Descripción" required {...(errors.description && { error: errors.description })}>
            <Textarea
              placeholder="Describe el motivo y cualquier detalle relevante…"
              value={payload.description}
              onChange={(e) => set("description", e.target.value)}
              error={!!errors.description}
            />
          </FieldWrapper>

          {/* ── ACCESO ── */}
          {payload.category === "access" && (
            <>
              <FieldWrapper
                label="Zonas de acceso"
                required
                {...(errors.accessZones_err && { error: errors.accessZones_err })}
              >
                <div className="grid grid-cols-2 gap-2">
                  {ACCESS_ZONE_OPTIONS.map((zone) => {
                    const checked = payload.accessZones?.includes(zone.value as never) ?? false;
                    return (
                      <button
                        key={zone.value}
                        type="button"
                        onClick={() => {
                          const current = payload.accessZones ?? [];
                          set(
                            "accessZones",
                            checked
                              ? current.filter((z) => z !== zone.value)
                              : [...current, zone.value as never],
                          );
                        }}
                        className={`
                          rounded-xl border p-2.5 text-left transition-all duration-150
                          ${checked
                            ? "border-rose-300 bg-rose-50"
                            : "border-slate-200 bg-slate-50 hover:border-rose-200"
                          }
                        `}
                      >
                        <p className={`text-xs font-semibold ${checked ? "text-rose-700" : "text-slate-700"}`}>
                          {zone.label}
                        </p>
                        <p className="text-[10px] text-slate-400">{zone.description}</p>
                      </button>
                    );
                  })}
                </div>
                {errors.accessZones_err && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-600 mt-1">
                    <AlertCircle size={11} /> {errors.accessZones_err}
                  </p>
                )}
              </FieldWrapper>

              <div className="grid grid-cols-2 gap-3">
                <FieldWrapper label="Fecha inicio" required {...(errors.accessStartDate && { error: errors.accessStartDate })}>
                  <Input
                    type="date"
                    value={payload.accessStartDate}
                    onChange={(e) => set("accessStartDate", e.target.value)}
                    error={!!errors.accessStartDate}
                  />
                </FieldWrapper>
                <FieldWrapper label="Fecha fin" hint="Opcional para acceso permanente">
                  <Input
                    type="date"
                    value={payload.accessEndDate}
                    onChange={(e) => set("accessEndDate", e.target.value)}
                  />
                </FieldWrapper>
              </div>
            </>
          )}

          {/* ── SALA ── */}
          {payload.category === "room" && (
            <>
              <FieldWrapper label="Fecha de reserva" required {...(errors.roomDate && { error: errors.roomDate })}>
                <Input
                  type="date"
                  value={payload.roomDate}
                  onChange={(e) => set("roomDate", e.target.value)}
                  error={!!errors.roomDate}
                />
              </FieldWrapper>
              <div className="grid grid-cols-2 gap-3">
                <FieldWrapper label="Hora inicio" required {...(errors.roomStartTime && { error: errors.roomStartTime })}>
                  <Input
                    type="time"
                    value={payload.roomStartTime}
                    onChange={(e) => set("roomStartTime", e.target.value)}
                    error={!!errors.roomStartTime}
                  />
                </FieldWrapper>
                <FieldWrapper label="Hora fin" required {...(errors.roomEndTime && { error: errors.roomEndTime })}>
                  <Input
                    type="time"
                    value={payload.roomEndTime}
                    onChange={(e) => set("roomEndTime", e.target.value)}
                    error={!!errors.roomEndTime}
                  />
                </FieldWrapper>
              </div>
              {/* Fix: attendeesCount — usar set condicional para no asignar undefined explícito */}
              <FieldWrapper label="Nº asistentes" hint="Opcional">
                <Input
                  type="number"
                  min={1}
                  max={100}
                  placeholder="Ej. 8"
                  value={payload.attendeesCount ?? ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      set("attendeesCount", Number(e.target.value));
                    } else {
                      // Fix: para eliminar la prop, reconstruimos el payload sin attendeesCount
                      setPayload((p) => {
                        const { attendeesCount: _, ...rest } = p;
                        return rest as NewRequestPayload;
                      });
                    }
                  }}
                />
              </FieldWrapper>
            </>
          )}

          {/* ── SERVICIO ── */}
          {payload.category === "service" && (
            <FieldWrapper label="Tipo de servicio" required {...(errors.serviceType && { error: errors.serviceType })}>
              <Select
                placeholder="Selecciona…"
                options={SERVICE_TYPE_OPTIONS}
                value={payload.serviceType ?? ""}
                onChange={(e) => set("serviceType", e.target.value)}
                error={!!errors.serviceType}
              />
            </FieldWrapper>
          )}
        </div>
      )}

      {/* ── STEP 2 — Solicitante ───────────────────────────────────────── */}
      {step === 2 && (
        <div className="flex flex-col gap-4">
          <p className="rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5
            text-[12px] text-slate-500 leading-relaxed">
            💡 Estos datos se pre-llenarán automáticamente cuando la autenticación
            con MS Graph esté activa.
          </p>

          <FieldWrapper label="Nombre completo" required {...(errors.requesterName && { error: errors.requesterName })}>
            <Input
              icon={<User size={14} />}
              placeholder="Tu nombre"
              value={payload.requesterName ?? ""}
              onChange={(e) => set("requesterName", e.target.value)}
              error={!!errors.requesterName}
            />
          </FieldWrapper>

          <FieldWrapper label="Correo corporativo" required {...(errors.requesterEmail && { error: errors.requesterEmail })}>
            <Input
              icon={<Mail size={14} />}
              type="email"
              placeholder="nombre@empresa.com"
              value={payload.requesterEmail ?? ""}
              onChange={(e) => set("requesterEmail", e.target.value)}
              error={!!errors.requesterEmail}
            />
          </FieldWrapper>

          <FieldWrapper label="Departamento" required {...(errors.department && { error: errors.department })}>
            <Input
              icon={<Building2 size={14} />}
              placeholder="Ej. Marketing"
              value={payload.department ?? ""}
              onChange={(e) => set("department", e.target.value)}
              error={!!errors.department}
            />
          </FieldWrapper>

          {/* Resumen de lo que se enviará */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Resumen
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <dt className="text-slate-500">Tipo</dt>
              <dd className="font-medium text-slate-800 capitalize">{payload.category}</dd>
              <dt className="text-slate-500">Título</dt>
              <dd className="font-medium text-slate-800 truncate">{payload.title || "—"}</dd>
              <dt className="text-slate-500">Prioridad</dt>
              <dd className="font-medium text-slate-800 capitalize">{payload.priority}</dd>
            </dl>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Éxito ─────────────────────────────────────────────── */}
      {step === 3 && result && (
        <SuccessBanner
          title="¡Solicitud enviada!"
          message="El equipo administrativo revisará tu solicitud y te notificará por correo."
          id={result.id}
          onClose={handleClose}
        />
      )}
    </Modal>
  );
}