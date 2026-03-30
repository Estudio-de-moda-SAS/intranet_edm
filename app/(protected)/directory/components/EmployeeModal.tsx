"use client";

// ─────────────────────────────────────────────────────────────────────────────
// EmployeeModal.tsx — Layout 2 columnas: compacto en altura, más ancho
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import {
  Mail, Phone, PhoneCall, Hash, MapPin, Building2,
  User, Calendar, Copy, Check,
} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { Employee } from "../types";
import { DEPARTMENT_COLORS } from "../mockEmployees";

interface Props {
  employee: Employee | null;
  onClose:  () => void;
}

const STATUS_CONFIG = {
  active:   { label: "Activo",     color: "text-emerald-600", bg: "bg-emerald-50",  dot: "bg-emerald-400" },
  remote:   { label: "Remoto",     color: "text-blue-600",    bg: "bg-blue-50",     dot: "bg-blue-400"    },
  vacation: { label: "Vacaciones", color: "text-amber-600",   bg: "bg-amber-50",    dot: "bg-amber-400"   },
  away:     { label: "Ausente",    color: "text-slate-500",   bg: "bg-slate-100",   dot: "bg-slate-400"   },
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

export function EmployeeModal({ employee, onClose }: Props) {
  const [copied, setCopied] = useState<string | null>(null);

  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  const deptColor = employee ? (DEPARTMENT_COLORS[employee.department] ?? "#1e3a5f") : "#1e3a5f";
  const status    = employee ? STATUS_CONFIG[employee.status] : null;
  const initials  = employee ? getInitials(employee.displayName) : "";

  return (
    <Modal
      open={!!employee}
      onClose={onClose}
      size="xl"
      accentColor="bg-transparent"
      disableBackdropClose={false}
      className="!rounded-2xl overflow-hidden !max-w-3xl"
    >
      {employee && (
        <div className="-mx-6 -mt-5">

          {/* Accent bar */}
          <div className="h-1 w-full" style={{ background: deptColor }} />

          {/* ── LAYOUT PRINCIPAL: 2 columnas ── */}
          <div className="flex">

            {/* ── Columna izquierda: identidad ── */}
            <div
              className="w-64 shrink-0 flex flex-col items-center px-6 py-7 gap-4"
              style={{ background: `linear-gradient(175deg, ${deptColor}18 0%, ${deptColor}06 100%)` }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full text-white font-bold text-3xl"
                style={{
                  width: 84,
                  height: 84,
                  background: `linear-gradient(135deg, ${deptColor}ee, ${deptColor}88)`,
                  boxShadow: `0 6px 24px ${deptColor}44`,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                {initials}
              </div>

              {/* Nombre + cargo */}
              <div className="text-center">
                <h3
                  className="text-[15px] font-bold text-slate-800 leading-tight"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {employee.displayName}
                </h3>
                <p className="text-[12px] text-slate-500 mt-1 leading-snug">
                  {employee.jobTitle}
                </p>
              </div>

              {/* Badge departamento */}
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{ color: deptColor, background: `${deptColor}18` }}
              >
                {employee.department}
              </span>

              {/* Status */}
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${status!.bg} ${status!.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status!.dot}`} />
                {status!.label}
              </span>

              {/* Spacer empuja botones al fondo */}
              <div className="flex-1" />

              {/* Acciones */}
              <div className="w-full flex flex-col gap-2">
                <a
                  href={`mailto:${employee.mail}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{ background: deptColor, fontFamily: "'DM Sans', sans-serif" }}
                >
                  <Mail className="w-4 h-4" />
                  Enviar correo
                </a>
                {employee.mobilePhone && (
                  <a
                    href={`tel:${employee.mobilePhone}`}
                    className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  >
                    <Phone className="w-4 h-4" />
                    Llamar
                  </a>
                )}
              </div>
            </div>

            {/* Separador vertical */}
            <div className="w-px bg-slate-100 self-stretch" />

            {/* ── Columna derecha: datos ── */}
            <div className="flex-1 px-6 py-6 flex flex-col gap-5">

              {/* Contacto */}
              <Section title="Contacto">
                <Row
                  icon={Mail}
                  label="Email"
                  value={employee.mail}
                  copyKey="mail"
                  copied={copied}
                  onCopy={() => copy(employee.mail, "mail")}
                />
                {employee.mobilePhone && (
                  <Row
                    icon={Phone}
                    label="Celular"
                    value={employee.mobilePhone}
                    copyKey="mobile"
                    copied={copied}
                    onCopy={() => copy(employee.mobilePhone!, "mobile")}
                  />
                )}
                {employee.businessPhone && (
                  <Row
                    icon={PhoneCall}
                    label="Tel. oficina"
                    value={employee.businessPhone}
                    copyKey="biz"
                    copied={copied}
                    onCopy={() => copy(employee.businessPhone!, "biz")}
                  />
                )}
                {employee.extension && (
                  <Row
                    icon={Hash}
                    label="Extensión"
                    value={employee.extension}
                    copyKey="ext"
                    copied={copied}
                    onCopy={() => copy(employee.extension!, "ext")}
                  />
                )}
              </Section>

              {/* Ubicación + Organización en grid 2 columnas */}
              <div className="grid grid-cols-2 gap-4">
                {(employee.officeLocation || employee.city) && (
                  <Section title="Ubicación">
                    {employee.officeLocation && (
                      <Row icon={MapPin} label="Oficina" value={employee.officeLocation} />
                    )}
                    {employee.city && (
                      <Row icon={Building2} label="Ciudad" value={employee.city} />
                    )}
                  </Section>
                )}

                {(employee.managerName || employee.hireDate) && (
                  <Section title="Organización">
                    {employee.managerName && (
                      <Row icon={User} label="Reporta a" value={employee.managerName} />
                    )}
                    {employee.hireDate && (
                      <Row
                        icon={Calendar}
                        label="Ingreso"
                        value={new Date(employee.hireDate).toLocaleDateString("es-CO", {
                          year:  "numeric",
                          month: "long",
                          day:   "numeric",
                        })}
                      />
                    )}
                  </Section>
                )}
              </div>

              {/* Graph API hint */}
              <p className="text-[10px] text-slate-300 italic mt-auto pt-2">
                Graph API · /v1.0/users/{employee.id}
              </p>
            </div>
          </div>

        </div>
      )}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
        {title}
      </p>
      <div className="rounded-xl border border-slate-100 bg-slate-50 overflow-hidden divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  value,
  copyKey,
  copied,
  onCopy,
}: {
  icon:     React.ElementType;
  label:    string;
  value:    string;
  copyKey?: string;
  copied?:  string | null;
  onCopy?:  () => void;
}) {
  const isCopied = copied === copyKey;
  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 ${
        onCopy ? "cursor-pointer hover:bg-white transition-colors" : ""
      }`}
      onClick={onCopy}
    >
      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-slate-400">{label}</p>
        <p className="text-[13px] font-medium text-slate-700 truncate">{value}</p>
      </div>
      {onCopy && (
        isCopied
          ? <Check className="w-3 h-3 text-emerald-500 shrink-0" />
          : <Copy  className="w-3 h-3 text-slate-300 shrink-0"  />
      )}
    </div>
  );
}