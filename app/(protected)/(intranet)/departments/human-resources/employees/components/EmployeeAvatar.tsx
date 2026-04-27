/**
 * @module EmployeeAvatar
 * Componente para renderizar el avatar de un empleado.
 *
 * @remarks
 * Este componente muestra:
 * - Imagen del empleado (si está disponible)
 * - Iniciales como fallback cuando no hay imagen
 *
 * Incluye lógica para:
 * - Generar iniciales automáticamente
 * - Asignar colores consistentes por usuario
 * - Adaptarse a distintos tamaños (`sm`, `md`, `lg`)
 */

// components/EmployeeAvatar.tsx

import Image from "next/image";
import type { Employee } from "@/types/employee";

/**
 * Tamaños disponibles para el avatar.
 */
type Size = "sm" | "md" | "lg";

/**
 * Props del componente {@link EmployeeAvatar}.
 *
 * @property employee Información mínima del empleado (nombre y foto).
 * @property size Tamaño del avatar (`sm`, `md`, `lg`). Por defecto `md`.
 * @property className Clases adicionales para personalización.
 */
type Props = {
  employee: Pick<Employee, "displayName" | "photo">;
  size?: Size;
  className?: string;
};

/**
 * Configuración de tamaños del avatar.
 *
 * @remarks
 * Define:
 * - Tamaño en píxeles (`px`)
 * - Clase de tipografía para iniciales
 */
const SIZES: Record<Size, { px: number; font: string }> = {
  sm: { px: 32, font: "text-xs" },
  md: { px: 40, font: "text-sm" },
  lg: { px: 64, font: "text-lg" },
};

/**
 * Genera las iniciales a partir del nombre completo.
 *
 * @param name Nombre completo del empleado.
 * @returns Iniciales (máximo 2 caracteres).
 *
 * @example
 * ```ts
 * initials("Juan Pérez") // "JP"
 * ```
 */
function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Paleta de colores disponibles para avatares sin imagen.
 */
const PALETTES = [
  "bg-rose-100 text-rose-800",
  "bg-blue-100 text-blue-800",
  "bg-teal-100 text-teal-800",
  "bg-amber-100 text-amber-800",
  "bg-purple-100 text-purple-800",
  "bg-green-100 text-green-800",
  "bg-sky-100 text-sky-800",
  "bg-fuchsia-100 text-fuchsia-800",
] as const;

/**
 * Genera una clase de color determinista basada en el nombre.
 *
 * @param name Nombre del empleado.
 * @returns Clase CSS de fondo y texto.
 *
 * @remarks
 * Se calcula mediante la suma de códigos ASCII de los caracteres,
 * asegurando que el mismo nombre siempre tenga el mismo color.
 */
function colorClass(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length] ?? PALETTES[0] ?? "";
}

/**
 * Componente de avatar de empleado.
 *
 * @param props Propiedades del componente.
 * @returns Avatar con imagen o fallback de iniciales.
 *
 * @remarks
 * Comportamiento:
 * - Si `employee.photo` existe → renderiza imagen con `next/image`
 * - Si no existe → renderiza iniciales con color asignado
 *
 * Características:
 * - Diseño circular (`rounded-full`)
 * - Tamaño configurable
 * - Fallback accesible con `aria-label`
 *
 * @example
 * ```tsx
 * <EmployeeAvatar employee={employee} size="lg" />
 * ```
 */
export function EmployeeAvatar({
  employee,
  size = "md",
  className = "",
}: Props) {
  const { px, font } = SIZES[size];

  if (employee.photo) {
    return (
      <div
        className={`relative overflow-hidden rounded-full flex-shrink-0 ${className}`}
        style={{ width: px, height: px }}
      >
        <Image
          src={employee.photo}
          alt={employee.displayName}
          fill
          className="object-cover"
          sizes={`${px}px`}
        />
      </div>
    );
  }

  return (
    <div
      className={`rounded-full flex-shrink-0 flex items-center justify-center
                  font-semibold select-none ${colorClass(employee.displayName)}
                  ${font} ${className}`}
      style={{ width: px, height: px }}
      aria-label={employee.displayName}
    >
      {initials(employee.displayName)}
    </div>
  );
}