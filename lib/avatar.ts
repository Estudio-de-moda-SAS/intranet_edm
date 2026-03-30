// lib/avatar.ts
// Utilidades de avatar reutilizadas en UserMenu, PerfilPage y donde haga falta

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function nameToHue(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 60 + 240;
}

export function avatarGradient(name: string): string {
  const hue = nameToHue(name);
  return `linear-gradient(135deg, hsl(${hue},70%,55%), hsl(${hue + 20},65%,45%))`;
}