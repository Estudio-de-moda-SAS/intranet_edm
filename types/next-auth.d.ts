import "next-auth"
import "next-auth/jwt"
import type { AccessLevel } from "@/lib/roles"

declare module "next-auth" {
  interface Session {
    // Opcional en Session porque antes del login no existe.
    // shared.service.ts verifica su existencia antes de usarlo.
    accessToken?: string

    user: {
      id:           string
      name?:        string | null
      email?:       string | null
      image?:       string | null
      // Campos de Microsoft Graph
      role?:        string | null
      department?:  string | null
      employeeId?:  string | null
      joined?:      string | null
      phone?:       string | null
      location?:    string | null
      // Nivel de acceso resuelto desde grupos de Azure AD
      accessLevel?: AccessLevel
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?:  string
    refreshToken?: string  // útil cuando implementes renovación de token
    expiresAt?:    number  // timestamp Unix para saber cuándo vence
    // Cache de Graph en el token — no se reconsulta en cada request
    role?:         string | null
    department?:   string | null
    employeeId?:   string | null
    joined?:       string | null
    phone?:        string | null
    location?:     string | null
    // Nivel de acceso resuelto desde grupos de Azure AD
    accessLevel?:  AccessLevel
    // IDs de los grupos de Azure AD — para auditoría y features futuras
    groupIds?:     string[]
  }
}