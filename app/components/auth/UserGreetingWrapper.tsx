/**
 * @module UserGreetingWrapper
 * Wrapper que resuelve el usuario a mostrar en el saludo de la interfaz.
 *
 * @remarks
 * Usa {@link useAppSession} en lugar de {@link useDevSession} para funcionar
 * correctamente tanto en modo bypass como en produccion con MSAL.
 */

"use client";

import { useAppSession } from "@/lib/useAppSession";
import { GreetingCard }  from "../home/GreetingCard";

interface Props {
  /**
   * Usuario de respaldo que se usa mientras la sesion carga o
   * si no hay datos disponibles aun.
   */
  fallbackUser: any;
}

/**
 * Componente cliente que provee el usuario correcto a {@link GreetingCard}.
 *
 * @remarks
 * En modo bypass retorna el usuario de {@link DEV_SESSION} inmediatamente.
 * En produccion espera a que {@link useGraphProfile} resuelva el perfil
 * desde Microsoft Graph. Mientras carga, usa `fallbackUser` para evitar
 * un flash de contenido vacio.
 */
export default function UserGreetingWrapper({ fallbackUser }: Props) {
  const { user, isLoading } = useAppSession();

  // Mientras Graph resuelve el perfil, usar fallbackUser para evitar flash
  const resolvedUser = (!isLoading && user) ? user : fallbackUser;

  return <GreetingCard user={resolvedUser} />;
}