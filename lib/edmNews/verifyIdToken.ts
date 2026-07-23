// lib/edmNews/verifyIdToken.ts
/**
 * @module verifyIdToken
 * Verificación de ID Tokens de MSAL/Azure AD en el servidor.
 *
 * @remarks
 * Valida la firma del JWT contra las claves públicas del tenant (JWKS),
 * el emisor (`iss`) y la audiencia (`aud`), y extrae la identidad del
 * usuario. Usado por todos los endpoints protegidos de EDM News.
 */

import { jwtVerify, createRemoteJWKSet } from "jose";

const TENANT_ID = process.env.NEXT_PUBLIC_MSAL_TENANT_ID!;
const CLIENT_ID = process.env.NEXT_PUBLIC_MSAL_CLIENT_ID!;

const JWKS = createRemoteJWKSet(
  new URL(`https://login.microsoftonline.com/${TENANT_ID}/discovery/v2.0/keys`)
);

export interface VerifiedUser {
  email: string;
  name: string | null;
  oid: string | null;
}

/**
 * Verifica un ID Token y extrae la identidad del usuario.
 *
 * @param token - El ID Token (JWT) recibido en el header `Authorization`.
 * @returns El email, nombre y Object ID del usuario autenticado.
 * @throws Si el token es inválido, expiró, o no corresponde a esta app.
 */
export async function verifyIdToken(token: string): Promise<VerifiedUser> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: [
      `https://login.microsoftonline.com/${TENANT_ID}/v2.0`,
      `https://sts.windows.net/${TENANT_ID}/`, // algunos tenants emiten v1 con este issuer
    ],
    audience: CLIENT_ID,
  });

  const email =
    (payload.email as string | undefined) ??
    (payload.preferred_username as string | undefined) ??
    (payload.upn as string | undefined);

  if (!email) {
    throw new Error("[verifyIdToken] El token no contiene un email válido");
  }

  return {
    email: email.toLowerCase(),
    name: (payload.name as string | undefined) ?? null,
    oid: (payload.oid as string | undefined) ?? null,
  };
}