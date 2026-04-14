/**
 * @module UserGreetingWrapper
 * Componente cliente encargado de resolver el usuario a mostrar en el saludo
 * de la interfaz, considerando entorno de desarrollo y fallback.
 *
 * @remarks
 * Este archivo implementa un wrapper que abstrae la lógica de selección del
 * usuario que será utilizado por el componente {@link GreetingCard}.
 *
 * Su responsabilidad incluye:
 *
 * - Consultar una sesión de desarrollo mediante {@link useDevSession}.
 * - Priorizar el usuario de desarrollo cuando está disponible.
 * - Utilizar un usuario de respaldo (`fallbackUser`) cuando no hay sesión.
 *
 * Este enfoque permite simular autenticación en entornos de desarrollo sin
 * depender de un proveedor real de identidad.
 */

"use client"

import { useDevSession } from "@/lib/useDevSession"
import { GreetingCard } from "../home/GreetingCard"

/**
 * Props del componente {@link UserGreetingWrapper}.
 */
interface Props {
  /**
   * Usuario de respaldo que se utilizará cuando no exista una sesión activa
   * en el entorno de desarrollo.
   */
  fallbackUser: any
}

/**
 * Componente cliente que encapsula la lógica de selección del usuario
 * para el saludo principal.
 *
 * @param props Propiedades del componente.
 * @param props.fallbackUser Usuario alternativo en ausencia de sesión.
 * @returns Componente {@link GreetingCard} con el usuario correspondiente.
 *
 * @remarks
 * Flujo de ejecución:
 *
 * 1. Obtiene la sesión de desarrollo mediante {@link useDevSession}.
 * 2. Si existe sesión:
 *    - Usa `devSession.user` como fuente principal.
 *    - Si no existe, utiliza `fallbackUser` como respaldo.
 * 3. Si no existe sesión:
 *    - Utiliza directamente `fallbackUser`.
 *
 * Este componente permite desacoplar la lógica de sesión del componente
 * visual {@link GreetingCard}, manteniendo una separación clara de responsabilidades.
 */
export default function UserGreetingWrapper({ fallbackUser }: Props) {

  /**
   * Sesión simulada de desarrollo.
   *
   * @remarks
   * Este hook permite trabajar con datos de usuario en entornos donde
   * no existe autenticación real activa.
   */
  const devSession = useDevSession()

  /**
   * Renderizado condicional según disponibilidad de sesión.
   *
   * @remarks
   * - Si hay sesión, se prioriza el usuario de desarrollo.
   * - Si no hay sesión, se usa el usuario de respaldo.
   */
  if (devSession) {
    return <GreetingCard user={devSession.user ?? fallbackUser} />
  }

  return <GreetingCard user={fallbackUser} />
}