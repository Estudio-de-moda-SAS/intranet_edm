// lib/config.ts

export type Department = {
  id: string;
  label: string;
  href: string;
  show: boolean;
};

export const DEPARTMENTS: Department[] = [
  {
    id: "finanzas",
    label: "Finanzas",
    href: "/departments/finance",
    show: true,
  },
  {
    id: "juridica",
    label: "Juridica",
    href: "/departments/legal",
    show: true,
  },
  {
    id: "producto",
    label: "Producto",
    href: "/departments/product",
    show: true,
  },
  {
    id: "retail",
    label: "Retail",
    href: "/departments/retail",
    show: true,
  },
  {
    id: "rrhh",
    label: "RRHH",
    href: "/departments/human-resources",
    show: true,
  },
  {
    id: "administrative-services",
    label: "Servicios Administrativos",
    href: "/departments/administrative-services",
    show: true,
  },
  {
    id: "ti",
    label: "TI",
    href: "/departments/it",
    show: true,
  },
  {
    id: "documentos",
    label: "Documentos",
    href: "/departments/documents",
    show: false,
  },
];

export const BRAND = {
  logoUrl: "/brand/edmIcon.png",
} as const;