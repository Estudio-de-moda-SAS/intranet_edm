// app/(protected)/(intranet)/departments/administrative/components/modals/VisitorRegistrationModal.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Modal para pre-registrar un visitante.
// Conecta a registerVisitor() — stub listo para MS Graph / API propia.
// ─────────────────────────────────────────────────────────────────────────────
"use client";

import { useState } from "react";
import {
  User, Building2, Mail, Phone,
  IdCard, Calendar, Clock, FileText, Car,
} from "lucide-react";
import { Modal }          from "@/app/components/ui/Modal";
import {
  FieldWrapper, Input, Textarea, Select,
  SubmitButton, SuccessBanner,
} from "@/app/(protected)/(intranet)/departments/administrative-services/forms/FormPrimitives";
import {
  registerVisitor,
  type VisitorPayload,
  type VisitorResult,
} from "@/lib/graph/departments/administrative.service";

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  open:    boolean;
  onClose: () => void;
}

// ── Options ───────────────────────────────────────────────────────────────────

const VISIT_TYPE_OPTIONS = [
  { value: "supplier",   label: "Proveedor"         },
  { value: "client",     label: "Cliente"            },
  { value: "candidate",  label: "Candidato / RRHH"  },
  { value: "contractor", label: "Contratista"        },
  { value: "personal",   label: "Visita personal"   },
  { value: "other",      label: "Otro"               },
];

const DOCUMENT_OPTIONS = [
  { value: "cedula",     label: "Cédula de ciudadanía" },
  { value: "passport",   label: "Pasaporte"             },
  { value: "foreign_id", label: "Cédula de extranjería" },
];

const INITIAL: VisitorPayload = {
  visitorName:    "",
  visitorCompany: "",
  visitorEmail:   "",
  visitorPhone:   "",
  documentType:   "cedula",
  documentNumber: "",
  visitType:      "supplier",
  hostName:       "",
  hostEmail:      "",
  hostDepartment: "",
  visitDate:      "",
  visitTime:      "",
  purpose:        "",
  vehiclePlate:   "",
  notes:          "",
};

type Errors = Partial<Record<keyof VisitorPayload, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

function validate(p: VisitorPayload): Errors {
  const e: Errors = {};
  if (!p.visitorName.trim())    e.visitorName    = "Campo requerido";
  if (!p.documentNumber.trim()) e.documentNumber = "Campo requerido";
  if (!p.hostName.trim())       e.hostName       = "Campo requerido";
  if (!p.hostDepartment.trim()) e.hostDepartment = "Campo requerido";
  if (!p.visitDate)             e.visitDate      = "Fecha requerida";
  if (!p.visitTime)             e.visitTime      = "Hora requerida";
  if (!p.purpose.trim())        e.purpose        = "Campo requerido";
  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function VisitorRegistrationModal({ open, onClose }: Props) {
  const [payload, setPayload] = useState<VisitorPayload>(INITIAL);
  const [errors,  setErrors]  = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<VisitorResult | null>(null);
  const [done,    setDone]    = useState(false);

  const set = <K extends keyof VisitorPayload>(
    key: K,
    value: VisitorPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }));

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPayload(INITIAL);
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
      const res = await registerVisitor(payload);
      setResult(res);
      setDone(true);
    } catch {
      setErrors({ purpose: "Error al registrar. Intenta de nuevo." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      // Fix: spread condicional para no pasar undefined (exactOptionalPropertyTypes)
      {...(!done && { title: "Pre-registro de visitante" })}
      {...(!done && { subtitle: "Registra el acceso de una persona externa con anticipación" })}
      size="lg"
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
                  label="Registrar visita"
                  loadingLabel="Registrando…"
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
          title="Visita pre-registrada"
          message="Recepción recibirá la notificación. El visitante puede presentarse el día indicado."
          id={result.visitorId}
          onClose={handleClose}
          extra={
            <div className="w-full rounded-2xl bg-slate-50 border border-slate-200 p-4 text-left">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Resumen de visita
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-slate-500">Visitante</dt>
                <dd className="font-medium text-slate-800">{payload.visitorName}</dd>
                <dt className="text-slate-500">Empresa</dt>
                <dd className="font-medium text-slate-800">{payload.visitorCompany || "—"}</dd>
                <dt className="text-slate-500">Anfitrión</dt>
                <dd className="font-medium text-slate-800">{payload.hostName}</dd>
                <dt className="text-slate-500">Fecha / hora</dt>
                <dd className="font-medium text-slate-800">
                  {payload.visitDate} · {payload.visitTime}
                </dd>
              </dl>
            </div>
          }
        />
      ) : (
        <div className="flex flex-col gap-5">

          {/* ── Sección: Datos del visitante ──────────────────────── */}
          <Section title="Datos del visitante">
            <div className="grid grid-cols-2 gap-3">
              {/* Fix: spread condicional en error para todos los FieldWrapper */}
              <FieldWrapper
                label="Nombre completo"
                required
                className="col-span-2"
                {...(errors.visitorName && { error: errors.visitorName })}
              >
                <Input
                  icon={<User size={13} />}
                  placeholder="Nombre y apellidos"
                  value={payload.visitorName}
                  onChange={(e) => set("visitorName", e.target.value)}
                  error={!!errors.visitorName}
                />
              </FieldWrapper>

              <FieldWrapper label="Empresa / Entidad">
                <Input
                  icon={<Building2 size={13} />}
                  placeholder="Opcional"
                  value={payload.visitorCompany}
                  onChange={(e) => set("visitorCompany", e.target.value)}
                />
              </FieldWrapper>

              <FieldWrapper label="Tipo de visita" required>
                <Select
                  options={VISIT_TYPE_OPTIONS}
                  value={payload.visitType}
                  onChange={(e) =>
                    set("visitType", e.target.value as VisitorPayload["visitType"])
                  }
                />
              </FieldWrapper>

              <FieldWrapper label="Tipo de documento" required>
                <Select
                  options={DOCUMENT_OPTIONS}
                  value={payload.documentType}
                  onChange={(e) =>
                    set("documentType", e.target.value as VisitorPayload["documentType"])
                  }
                />
              </FieldWrapper>

              <FieldWrapper
                label="Número de documento"
                required
                {...(errors.documentNumber && { error: errors.documentNumber })}
              >
                <Input
                  icon={<IdCard size={13} />}
                  placeholder="Ej. 1234567890"
                  value={payload.documentNumber}
                  onChange={(e) => set("documentNumber", e.target.value)}
                  error={!!errors.documentNumber}
                />
              </FieldWrapper>

              <FieldWrapper label="Correo">
                <Input
                  icon={<Mail size={13} />}
                  type="email"
                  placeholder="Opcional"
                  value={payload.visitorEmail ?? ""}
                  onChange={(e) => set("visitorEmail", e.target.value)}
                />
              </FieldWrapper>

              <FieldWrapper label="Teléfono">
                <Input
                  icon={<Phone size={13} />}
                  type="tel"
                  placeholder="Opcional"
                  value={payload.visitorPhone ?? ""}
                  onChange={(e) => set("visitorPhone", e.target.value)}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* ── Sección: Anfitrión ─────────────────────────────────── */}
          <Section title="Anfitrión">
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper
                label="Nombre del anfitrión"
                required
                {...(errors.hostName && { error: errors.hostName })}
              >
                <Input
                  icon={<User size={13} />}
                  placeholder="Colaborador que recibe"
                  value={payload.hostName}
                  onChange={(e) => set("hostName", e.target.value)}
                  error={!!errors.hostName}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Departamento"
                required
                {...(errors.hostDepartment && { error: errors.hostDepartment })}
              >
                <Input
                  icon={<Building2 size={13} />}
                  placeholder="Departamento anfitrión"
                  value={payload.hostDepartment}
                  onChange={(e) => set("hostDepartment", e.target.value)}
                  error={!!errors.hostDepartment}
                />
              </FieldWrapper>

              <FieldWrapper label="Correo anfitrión" hint="Para enviar notificación">
                <Input
                  icon={<Mail size={13} />}
                  type="email"
                  placeholder="anfitrion@empresa.com"
                  value={payload.hostEmail ?? ""}
                  onChange={(e) => set("hostEmail", e.target.value)}
                />
              </FieldWrapper>
            </div>
          </Section>

          {/* ── Sección: Fecha y motivo ──────────────────────────── */}
          <Section title="Programación">
            <div className="grid grid-cols-2 gap-3">
              <FieldWrapper
                label="Fecha de visita"
                required
                {...(errors.visitDate && { error: errors.visitDate })}
              >
                <Input
                  icon={<Calendar size={13} />}
                  type="date"
                  value={payload.visitDate}
                  onChange={(e) => set("visitDate", e.target.value)}
                  error={!!errors.visitDate}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Hora estimada"
                required
                {...(errors.visitTime && { error: errors.visitTime })}
              >
                <Input
                  icon={<Clock size={13} />}
                  type="time"
                  value={payload.visitTime}
                  onChange={(e) => set("visitTime", e.target.value)}
                  error={!!errors.visitTime}
                />
              </FieldWrapper>

              <FieldWrapper label="Placa vehículo" hint="Si ingresa al parqueadero">
                <Input
                  icon={<Car size={13} />}
                  placeholder="Ej. ABC-123"
                  value={payload.vehiclePlate ?? ""}
                  onChange={(e) => set("vehiclePlate", e.target.value)}
                />
              </FieldWrapper>

              <FieldWrapper
                label="Motivo de la visita"
                required
                className="col-span-2"
                {...(errors.purpose && { error: errors.purpose })}
              >
                <Input
                  icon={<FileText size={13} />}
                  placeholder="Ej. Reunión comercial · Entrega de materiales"
                  value={payload.purpose}
                  onChange={(e) => set("purpose", e.target.value)}
                  error={!!errors.purpose}
                />
              </FieldWrapper>

              <FieldWrapper label="Observaciones adicionales" className="col-span-2">
                <Textarea
                  placeholder="Información extra para recepción…"
                  rows={2}
                  value={payload.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </FieldWrapper>
            </div>
          </Section>

        </div>
      )}
    </Modal>
  );
}

// ── Section helper ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title:    string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-rose-700">
          {title}
        </p>
        <div className="h-px flex-1 bg-rose-100" />
      </div>
      {children}
    </div>
  );
}