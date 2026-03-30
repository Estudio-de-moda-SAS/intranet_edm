"use client";

// components/EmployeeDrawer.tsx

import { useEffect, useState } from "react";
import { createPortal }        from "react-dom";
import { X, Mail, Phone, MapPin, Building2, User, ExternalLink } from "lucide-react";
import type { Employee }        from "@/types/employee";
import { EmployeeAvatar }       from "./EmployeeAvatar";
import { EmployeeStatusBadge }  from "./EmployeeStatusBadge";

type Props = { employee: Employee | null; onClose: () => void };

export function EmployeeDrawer({ employee, onClose }: Props) {
  const open = !!employee;

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 bg-black/25 backdrop-blur-[2px] z-40 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={employee ? `Perfil de ${employee.displayName}` : "Perfil de empleado"}
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl shadow-slate-900/10 z-50 flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {employee && <DrawerContent employee={employee} onClose={onClose} />}
      </aside>
    </>,
    document.body
  );
}

function DrawerContent({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400 font-mono">
          Perfil del empleado
        </p>
        <button
          onClick={onClose}
          aria-label="Cerrar panel"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-violet-700 hover:bg-violet-50 transition"
        >
          <X size={15} />
        </button>
      </div>

      {/* Hero */}
      <div className="px-8 py-8 flex flex-col items-center text-center border-b border-slate-100 bg-gradient-to-b from-violet-50/60 to-white">
        <EmployeeAvatar employee={employee} size="lg" className="mb-4 ring-4 ring-white shadow-md" />
        <h2 className="text-lg font-semibold text-slate-900 leading-tight">{employee.displayName}</h2>
        <p className="text-sm text-slate-500 mt-1">{employee.jobTitle}</p>
        <div className="mt-3">
          <EmployeeStatusBadge status={employee.status} />
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6 flex flex-col gap-6">

          <Section title="Contacto">
            <Field icon={<Mail size={14} />}  label="Email corporativo" value={employee.mail} />
            <Field icon={<Phone size={14} />} label="Teléfono móvil"    value={employee.mobilePhone ?? "—"} />
          </Section>

          <Section title="Organización">
            <Field icon={<Building2 size={14} />} label="Departamento" value={employee.department || "—"} />
            <Field icon={<MapPin size={14} />}    label="Ubicación"    value={employee.officeLocation ?? "—"} />
            <Field icon={<User size={14} />}      label="Usuario (UPN)" value={employee.userPrincipalName} mono />
          </Section>

        </div>
      </div>

      {/* Footer */}
      <div className="px-8 py-5 border-t border-slate-100 flex flex-col gap-2.5">
        <a
          href={`https://teams.microsoft.com/l/chat/0/0?users=${employee.mail}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full h-10 text-sm font-medium text-white bg-violet-700 rounded-xl hover:bg-violet-800 transition"
        >
          Abrir en Microsoft Teams
          <ExternalLink size={13} />
        </a>
        <a
          href={`mailto:${employee.mail}`}
          className="flex items-center justify-center gap-2 w-full h-10 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition"
        >
          Enviar correo
          <Mail size={13} />
        </a>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-widest text-violet-600/70 font-mono mb-3">
        {title}
      </p>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Field({ icon, label, value, mono = false }: {
  icon: React.ReactNode; label: string; value: string; mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50/70 border border-slate-100">
      <span className="mt-0.5 text-violet-500 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] text-slate-400 mb-0.5">{label}</p>
        <p className={`text-sm text-slate-800 break-all ${mono ? "font-mono text-xs" : "font-medium"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}