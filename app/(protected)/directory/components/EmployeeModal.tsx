/**
 * @module EmployeeModal
 * Modal de detalle para visualización de información de un empleado.
 *
 * @remarks
 * Este componente presenta una vista ampliada del perfil del colaborador
 * dentro del directorio corporativo.
 *
 * Su diseño se organiza en dos columnas principales:
 *
 * - columna izquierda: identidad, estado y acciones rápidas
 * - columna derecha: información de contacto, ubicación y organización
 *
 * Funciona como componente de detalle contextual y se abre a partir
 * de la selección de un empleado en el directorio.
 */

"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  PhoneCall,
  Hash,
  MapPin,
  Building2,
  User,
  Calendar,
  Copy,
  Check,
} from "lucide-react";
import { Modal } from "@/app/components/ui/Modal";
import { Employee } from "../types";
import { DEPARTMENT_COLORS } from "../mockEmployees";

/* -------------------------------------------------------------------------- */
/* Tipos                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Props del componente {@link EmployeeModal}.
 *
 * @property employee Empleado actualmente seleccionado.
 * @property onClose Función ejecutada al cerrar el modal.
 */
interface EmployeeModalProps {
  employee: Employee | null;
  onClose: () => void;
}

/**
 * Configuración visual del estado del empleado.
 *
 * @property label Texto visible del estado.
 * @property color Clase de color principal del texto.
 * @property bg Clase de color de fondo.
 * @property dot Clase de color del punto indicador.
 */
type EmployeeStatusConfig = {
  label: string;
  color: string;
  bg: string;
  dot: string;
};

/**
 * Props del subcomponente {@link Section}.
 *
 * @property title Título de la sección.
 * @property children Contenido interno de la sección.
 */
interface SectionProps {
  title: string;
  children: React.ReactNode;
}

/**
 * Props del subcomponente {@link Row}.
 *
 * @property icon Ícono visual asociado al dato.
 * @property label Nombre del campo.
 * @property value Valor mostrado.
 * @property copyKey Clave usada para identificar el elemento copiado.
 * @property copied Clave actualmente marcada como copiada.
 * @property onCopy Acción opcional para copiar el valor.
 */
interface RowProps {
  icon: React.ElementType;
  label: string;
  value: string;
  copyKey?: string;
  copied?: string | null;
  onCopy?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Configuración                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Configuración visual por estado del empleado.
 *
 * @remarks
 * Define la representación de color y etiqueta del estado laboral
 * mostrado dentro del modal.
 */
const STATUS_CONFIG: Record<Employee["status"], EmployeeStatusConfig> = {
  active: {
    label: "Activo",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    dot: "bg-emerald-400",
  },
  remote: {
    label: "Remoto",
    color: "text-blue-600",
    bg: "bg-blue-50",
    dot: "bg-blue-400",
  },
  vacation: {
    label: "Vacaciones",
    color: "text-amber-600",
    bg: "bg-amber-50",
    dot: "bg-amber-400",
  },
  away: {
    label: "Ausente",
    color: "text-slate-500",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
  },
};

/* -------------------------------------------------------------------------- */
/* Utilidades                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Genera las iniciales a partir del nombre completo de un empleado.
 *
 * @param name Nombre completo del empleado.
 * @returns Iniciales en mayúscula.
 *
 * @remarks
 * Se toman máximo las dos primeras palabras del nombre para construir
 * el avatar textual del empleado.
 */
function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/* -------------------------------------------------------------------------- */
/* Componente principal                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Modal de detalle de empleado.
 *
 * @param props Propiedades del componente.
 * @returns Modal con información ampliada del empleado seleccionado.
 *
 * @remarks
 * Este componente:
 *
 * - se abre cuando existe un `employee` seleccionado
 * - presenta información estructurada del colaborador
 * - permite copiar datos de contacto al portapapeles
 * - muestra acciones rápidas como enviar correo o llamar
 *
 * En términos de arquitectura, actúa como la capa de detalle contextual
 * del directorio de empleados.
 *
 * @example
 * ```tsx
 * <EmployeeModal employee={selectedEmployee} onClose={handleClose} />
 * ```
 */
export function EmployeeModal({
  employee,
  onClose,
}: EmployeeModalProps) {
  /**
   * Clave del campo copiado recientemente.
   *
   * @remarks
   * Se utiliza para mostrar feedback visual temporal al usuario
   * al copiar datos como correo, celular o extensión.
   */
  const [copied, setCopied] = useState<string | null>(null);

  /**
   * Copia un texto al portapapeles y activa feedback visual temporal.
   *
   * @param text Texto a copiar.
   * @param key Clave del campo asociado.
   */
  function copy(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  /**
   * Color principal asociado al departamento del empleado.
   */
  const departmentColor = employee
    ? DEPARTMENT_COLORS[employee.department] ?? "#1e3a5f"
    : "#1e3a5f";

  /**
   * Configuración visual del estado actual del empleado.
   */
  const status = employee ? STATUS_CONFIG[employee.status] : null;

  /**
   * Iniciales del empleado para el avatar textual.
   */
  const initials = employee ? getInitials(employee.displayName) : "";

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
          <div className="h-1 w-full" style={{ background: departmentColor }} />

          {/* ======================================================== */}
          {/* Layout principal                                         */}
          {/* ======================================================== */}
          <div className="flex">
            {/* ------------------------------------------------------ */}
            {/* Columna izquierda: identidad                          */}
            {/* ------------------------------------------------------ */}
            <div
              className="w-64 shrink-0 flex flex-col items-center px-6 py-7 gap-4"
              style={{
                background: `linear-gradient(175deg, ${departmentColor}18 0%, ${departmentColor}06 100%)`,
              }}
            >
              {/* Avatar */}
              <div
                className="flex items-center justify-center rounded-full text-white font-bold text-3xl"
                style={{
                  width: 84,
                  height: 84,
                  background: `linear-gradient(135deg, ${departmentColor}ee, ${departmentColor}88)`,
                  boxShadow: `0 6px 24px ${departmentColor}44`,
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: "0.05em",
                }}
              >
                {initials}
              </div>

              {/* Nombre y cargo */}
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

              {/* Departamento */}
              <span
                className="text-[11px] font-bold px-3 py-1 rounded-full"
                style={{
                  color: departmentColor,
                  background: `${departmentColor}18`,
                }}
              >
                {employee.department}
              </span>

              {/* Estado */}
              <span
                className={`text-[11px] font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 ${status!.bg} ${status!.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${status!.dot}`} />
                {status!.label}
              </span>

              <div className="flex-1" />

              {/* Acciones */}
              <div className="w-full flex flex-col gap-2">
                <a
                  href={`mailto:${employee.mail}`}
                  className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 transition-opacity"
                  style={{
                    background: departmentColor,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
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

            {/* Separador */}
            <div className="w-px bg-slate-100 self-stretch" />

            {/* ------------------------------------------------------ */}
            {/* Columna derecha: datos                                */}
            {/* ------------------------------------------------------ */}
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

              {/* Ubicación + Organización */}
              <div className="grid grid-cols-2 gap-4">
                {(employee.officeLocation || employee.city) && (
                  <Section title="Ubicación">
                    {employee.officeLocation && (
                      <Row
                        icon={MapPin}
                        label="Oficina"
                        value={employee.officeLocation}
                      />
                    )}
                    {employee.city && (
                      <Row
                        icon={Building2}
                        label="Ciudad"
                        value={employee.city}
                      />
                    )}
                  </Section>
                )}

                {(employee.managerName || employee.hireDate) && (
                  <Section title="Organización">
                    {employee.managerName && (
                      <Row
                        icon={User}
                        label="Reporta a"
                        value={employee.managerName}
                      />
                    )}

                    {employee.hireDate && (
                      <Row
                        icon={Calendar}
                        label="Ingreso"
                        value={new Date(employee.hireDate).toLocaleDateString(
                          "es-CO",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      />
                    )}
                  </Section>
                )}
              </div>

              {/* Hint técnico */}
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

/* -------------------------------------------------------------------------- */
/* Subcomponentes                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Sección visual de agrupación de datos dentro del modal.
 *
 * @param props Propiedades de la sección.
 * @returns Bloque con título y contenido agrupado.
 *
 * @remarks
 * Se utiliza para organizar información en grupos como:
 *
 * - contacto
 * - ubicación
 * - organización
 */
function Section({ title, children }: SectionProps) {
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

/**
 * Fila individual de información dentro del modal.
 *
 * @param props Propiedades de la fila.
 * @returns Fila con icono, etiqueta, valor y acción opcional de copiado.
 *
 * @remarks
 * Puede funcionar tanto como fila informativa simple
 * como fila interactiva cuando dispone de `onCopy`.
 */
function Row({
  icon: Icon,
  label,
  value,
  copyKey,
  copied,
  onCopy,
}: RowProps) {
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
        <p className="text-[13px] font-medium text-slate-700 truncate">
          {value}
        </p>
      </div>

      {onCopy &&
        (isCopied ? (
          <Check className="w-3 h-3 text-emerald-500 shrink-0" />
        ) : (
          <Copy className="w-3 h-3 text-slate-300 shrink-0" />
        ))}
    </div>
  );
}