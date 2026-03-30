// components/EmployeeAvatar.tsx

import Image from "next/image";
import type { Employee } from "@/types/employee";

type Size = "sm" | "md" | "lg";

type Props = {
  employee: Pick<Employee, "displayName" | "photo">;
  size?: Size;
  className?: string;
};

const SIZES: Record<Size, { px: number; font: string }> = {
  sm: { px: 32, font: "text-xs"  },
  md: { px: 40, font: "text-sm"  },
  lg: { px: 64, font: "text-lg"  },
};

/** Genera las iniciales a partir del nombre completo */
function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Asigna un color de fondo determinista según el nombre */
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

function colorClass(name: string): string {
  const sum = [...name].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PALETTES[sum % PALETTES.length] ?? PALETTES[0] ?? "";
}

export function EmployeeAvatar({ employee, size = "md", className = "" }: Props) {
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
