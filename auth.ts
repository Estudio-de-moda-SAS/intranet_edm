// auth.ts
// ─────────────────────────────────────────────────────────────────────────────
// Cambios respecto al original:
//   1. jwt callback consulta grupos de Azure AD con getMicrosoftGraphGroups()
//   2. resolveAccessLevelFromGroups() determina el AccessLevel
//   3. accessLevel se cachea en el token — no se recalcula en cada request
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth                        from "next-auth";
import MicrosoftEntraID                from "next-auth/providers/microsoft-entra-id";
import {
  getMicrosoftGraphProfile,
  getMicrosoftGraphGroups,
  resolveAccessLevelFromGroups,
  formatHireDate,
}                                      from "@/lib/microsoft-graph";
import type { AccessLevel }            from "@/lib/roles";

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    MicrosoftEntraID({
      clientId:     process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
      issuer: `https://login.microsoftonline.com/${process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID}/v2.0`,
      authorization: {
        params: {
          // GroupMember.Read.All es necesario para /memberOf
          // Si no tienes este permiso en Azure aún, el fallback por
          // department/role seguirá funcionando automáticamente.
          scope: "openid profile email User.Read GroupMember.Read.All",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Solo consulta Graph en el login inicial (cuando llega account)
      if (account?.access_token) {
        token.accessToken = account.access_token;

        // ── Consultas paralelas a Graph ─────────────────────────
        const [graphProfile, graphGroups] = await Promise.all([
          getMicrosoftGraphProfile(account.access_token),
          getMicrosoftGraphGroups(account.access_token),
        ]);

        if (graphProfile) {
          token.role       = graphProfile.jobTitle       ?? null;
          token.department = graphProfile.department     ?? null;
          token.employeeId = graphProfile.employeeId     ?? null;
          token.joined     = formatHireDate(graphProfile.hireDate);
          token.phone      = graphProfile.mobilePhone
                             ?? graphProfile.businessPhones?.[0]
                             ?? null;
          token.location   = graphProfile.officeLocation ?? null;
        }

        // ── Resolver AccessLevel desde grupos ───────────────────
        // Si hay grupos → usa grupos (más preciso)
        // Si no hay grupos → fallback por department/role del perfil
        token.accessLevel = resolveAccessLevelFromGroups(
          graphGroups,
          token.department as string | null,
          token.role       as string | null,
        ) satisfies AccessLevel;

        // Guardar los IDs de grupo en el token por si se necesitan
        // para auditoría o features futuras
        token.groupIds = graphGroups.map(g => g.id);
      }
      return token;
    },

async session({ session, token }) {
  if (token.accessToken)          session.accessToken      = token.accessToken
  session.user.role        = token.role        ?? null
  session.user.department  = token.department  ?? null
  session.user.employeeId  = token.employeeId  ?? null
  session.user.joined      = token.joined      ?? null
  session.user.phone       = token.phone       ?? null
  session.user.location    = token.location    ?? null
  if (token.accessLevel) session.user.accessLevel = token.accessLevel
  return session
},
  },
});