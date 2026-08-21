/**
 * @module getDepartmentIcon
 *
 * Resuelve el ícono representativo de un área documental a partir del
 * nombre de ícono configurado en {@link DocumentDepartment.icon}.
 */

import {
  Building2,
  Folder,
  Handshake,
  Landmark,
  Laptop,
  Package,
  Scale,
  ShieldCheck,
  ShoppingCart,
  Tag,
  TrendingUp,
  Truck,
  Users,
  BookText,
  Headset,
  type LucideIcon,
} from "lucide-react";

const DEPARTMENT_ICON_MAP: Record<string, LucideIcon> = {
  Scale,
  ShoppingCart,
  Package,
  Laptop,
  Landmark,
  Truck,
  Users,
  ShieldCheck,
  Tag,
  TrendingUp,
  Building2,
  Handshake,
  BookText,
  Headset,
};

/**
 * Resuelve el componente de ícono Lucide correspondiente al nombre
 * configurado en el catálogo. Si el nombre no está mapeado, retorna un
 * ícono de carpeta genérico.
 */
export function getDepartmentIcon(iconName?: string): LucideIcon {
  if (!iconName) return Folder;
  return DEPARTMENT_ICON_MAP[iconName] ?? Folder;
}