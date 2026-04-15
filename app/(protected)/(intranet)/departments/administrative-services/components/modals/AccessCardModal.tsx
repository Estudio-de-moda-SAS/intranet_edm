/**
 * @module AccessCardModal
 * Modal de gestión de tarjetas de acceso del módulo de Servicios Administrativos.
 *
 * Permite ejecutar distintos flujos relacionados con credenciales de acceso:
 * - solicitar una tarjeta nueva,
 * - reportar pérdida,
 * - reportar daño,
 * - desactivar una tarjeta existente.
 *
 * @remarks
 * Este componente centraliza la captura y validación de información asociada
 * a solicitudes de tarjetas de acceso, y delega el envío del trámite a
 * {@link submitAccessCardRequest}.
 *
 * El flujo general del componente es:
 * 1. Seleccionar la acción a realizar.
 * 2. Completar la información del colaborador.
 * 3. Capturar datos adicionales según el tipo de solicitud.
 * 4. Validar el formulario mediante {@link validate}.
 * 5. Enviar la solicitud al servicio.
 * 6. Mostrar confirmación con {@link SuccessBanner}.
 *
 * Este modal está preparado para integrarse con Microsoft Graph o una API
 * propia a través de la capa de servicios del módulo administrativo.
 */

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

/**
 * Propiedades de {@link AccessCardModal}.
 *
 * @property open Indica si el modal se encuentra visible.
 * @property onClose Función ejecutada al cerrar el modal.
 * @property defaultAction Acción inicial preseleccionada, útil cuando el flujo
 * se invoca desde un acceso rápido con contexto.
 */
interface Props {
  open:          boolean;
  onClose:       () => void;
  /** Si viene desde un quick link con acción pre-seleccionada */
  defaultAction?: AccessCardAction;
}

// ── Action catalog ────────────────────────────────────────────────────────────

/**
 * Catálogo de acciones disponibles para la gestión de tarjetas de acceso.
 *
 * @remarks
 * Define metadatos de presentación y comportamiento para cada
 * {@link AccessCardAction}, incluyendo:
 * - etiqueta visible,
 * - descripción funcional,
 * - ícono asociado,
 * - estilos de color,
 * - y si la acción requiere una tarjeta existente.
 *
 * Esta configuración es usada para renderizar el selector visual de acciones
 * y para determinar reglas condicionales del formulario.
 */
const ACTIONS: {
  value:       AccessCardAction;
  label:       string;
  description: string;
  icon:        React.ReactNode;
  color:       string;
  accentBg:    string;
  needsCard:   boolean;
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

/**
 * Opciones disponibles para zonas de acceso.
 *
 * @remarks
 * Se utilizan exclusivamente cuando la acción seleccionada es
 * `"request_new"`, permitiendo definir qué áreas debe habilitar la tarjeta.
 */
const ZONE_OPTIONS = [
  { value: "general",    label: "Accesos generales" },
  { value: "offices",    label: "Oficinas"          },
  { value: "warehouse",  label: "Bodega"            },
  { value: "restricted", label: "Área restringida"  },
];

/**
 * Estado inicial del formulario de solicitud de tarjeta.
 *
 * @remarks
 * Sirve como base para inicializar y reiniciar el payload del modal.
 */
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

/**
 * Estructura de errores parciales asociada a {@link AccessCardPayload}.
 *
 * @remarks
 * Cada clave representa un campo del formulario y su valor corresponde al
 * mensaje de error mostrado al usuario.
 */
type Errors = Partial<Record<keyof AccessCardPayload, string>>;

// ── Validation ────────────────────────────────────────────────────────────────

/**
 * Valida el contenido del formulario de gestión de tarjeta.
 *
 * @param payload Datos actuales del formulario.
 * @returns Objeto de errores por campo.
 *
 * @remarks
 * Reglas aplicadas:
 * - nombre, correo, departamento y motivo son obligatorios,
 * - algunas acciones requieren número de tarjeta actual,
 * - la solicitud de tarjeta nueva requiere al menos una zona de acceso.
 *
 * Esta validación es contextual y depende de la acción seleccionada en
 * {@link AccessCardPayload.action}.
 */
function validate(payload: AccessCardPayload): Errors {
  const e: Errors = {};
  const meta = ACTIONS.find((a) => a.value === payload.action)!;

  if (!payload.employeeName?.trim())  e.employeeName  = "Campo requerido";
  if (!payload.employeeEmail?.trim()) e.employeeEmail = "Campo requerido";
  if (!payload.department?.trim())    e.department    = "Campo requerido";

  if (meta.needsCard && !payload.cardNumber?.trim()) {
    e.cardNumber = "Ingresa el número de tarjeta";
  }

  if (payload.action === "request_new" && !payload.zones?.length) {
    e.zones = "Selecciona al menos una zona" as never;
  }

  if (!payload.reason?.trim()) e.reason = "Campo requerido";

  return e;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Modal principal para la gestión de tarjetas de acceso.
 *
 * @param props Propiedades del componente.
 * @returns Modal interactivo con formulario dinámico o confirmación de éxito.
 *
 * @remarks
 * Este componente administra:
 * - el estado del formulario,
 * - la validación local,
 * - la selección contextual de acciones,
 * - la apertura y cierre del modal,
 * - el envío de la solicitud,
 * - y la transición al estado de éxito.
 *
 * Dependiendo del estado:
 * - renderiza un formulario dinámico,
 * - o muestra una confirmación con {@link SuccessBanner}.
 */
export default function AccessCardModal({ open, onClose, defaultAction }: Props) {
  /**
   * Payload actual del formulario.
   *
   * Se inicializa con {@link INITIAL} y puede recibir una acción por defecto
   * desde {@link Props.defaultAction}.
   */
  const [payload, setPayload] = useState<AccessCardPayload>({
    ...INITIAL,
    action: defaultAction ?? "request_new",
  });

  /**
   * Errores actuales de validación del formulario.
   */
  const [errors,  setErrors]  = useState<Errors>({});

  /**
   * Indica si el formulario está siendo enviado.
   */
  const [loading, setLoading] = useState(false);

  /**
   * Resultado retornado por el servicio al registrar la solicitud.
   */
  const [result,  setResult]  = useState<AccessCardResult | null>(null);

  /**
   * Indica si el flujo fue completado exitosamente.
   */
  const [done,    setDone]    = useState(false);

  /**
   * Actualiza una propiedad específica del payload.
   *
   * @param key Campo a actualizar.
   * @param value Nuevo valor del campo.
   */
  const set = <K extends keyof AccessCardPayload>(
    key: K,
    value: AccessCardPayload[K],
  ) => setPayload((p) => ({ ...p, [key]: value }));

  /**
   * Alterna la selección de una zona de acceso.
   *
   * @param zone Zona a agregar o remover del payload.
   *
   * @remarks
   * Solo se utiliza en el flujo de solicitud de tarjeta nueva.
   */
  const toggleZone = (zone: string) => {
    const cur = payload.zones ?? [];
    set("zones", (cur.includes(zone as never)
      ? cur.filter((z) => z !== zone)
      : [...cur, zone]) as never
    );
  };

  /**
   * Cierra el modal y reinicia su estado interno.
   *
   * @remarks
   * El reinicio se difiere ligeramente para respetar la animación de cierre
   * del modal y evitar parpadeos visuales.
   */
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setPayload({ ...INITIAL, action: defaultAction ?? "request_new" });
      setErrors({});
      setResult(null);
      setDone(false);
    }, 300);
  };

  /**
   * Ejecuta la validación y envío de la solicitud de tarjeta.
   *
   * @returns Promesa que procesa el envío del formulario.
   *
   * @remarks
   * Flujo:
   * 1. Valida el payload con {@link validate}.
   * 2. Si hay errores, actualiza el estado y detiene el envío.
   * 3. Si es válido, llama a {@link submitAccessCardRequest}.
   * 4. Guarda el resultado y cambia al estado de éxito.
   * 5. Si falla, muestra un error general sobre el formulario.
   */
  const handleSubmit = async () => {
    const e = validate(payload);
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

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

  /**
   * Acción actualmente seleccionada dentro del formulario.
   *
   * Contiene los metadatos visuales y funcionales definidos en {@link ACTIONS}.
   */
  const selectedAction = ACTIONS.find((a) => a.value === payload.action)!;

  /**
   * Indica si la acción actual requiere número de tarjeta existente.
   */
  const needsCard      = selectedAction.needsCard;

  /**
   * Mensajes contextuales para acciones críticas o sensibles.
   *
   * @remarks
   * Ayudan a anticipar consecuencias operativas del trámite, como bloqueos
   * inmediatos o desactivaciones.
   */
  const URGENCY_LABELS: Record<string, string> = {
    report_lost: "Esta acción bloqueará la tarjeta inmediatamente.",
    deactivate:  "La tarjeta quedará inactiva al procesar la solicitud.",
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
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