import { cookies } from "next/headers";
import { DEV_SESSION } from "@/lib/devSession";
import { DEV_DISABLE_ROLES } from "@/config/config";
import type { AccessLevel } from "@/lib/roles";

const isBypass = process.env.NEXT_PUBLIC_AUTH_BYPASS === "true";

export async function getServerAccessLevel(): Promise<AccessLevel> {
  if (isBypass)          return DEV_SESSION.user.accessLevel;
  if (DEV_DISABLE_ROLES) return "admin";
  
  const cookieStore = await cookies();
  return (cookieStore.get("edm_access_level")?.value as AccessLevel) ?? "employee";
}