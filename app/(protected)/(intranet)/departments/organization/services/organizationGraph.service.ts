import { getAccessToken } from "@/app/api/auth/msal";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const CACHE_TTL_MS = 1000 * 60 * 30;

const GRAPH_ORGANIZATION_SCOPES = [
  "User.Read.All",
  "Directory.Read.All",
] as const;

const USER_SELECT_FIELDS =
  "id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation";

export interface GraphOrganizationUser {
  id: string;
  displayName?: string;
  jobTitle?: string;
  mail?: string;
  userPrincipalName?: string;
  department?: string;
  officeLocation?: string;
  photoUrl?: string;
}

interface GraphCollectionResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

interface CacheRecord<T> {
  data: T;
  expiresAt: number;
}

function getCacheKey(
  type: "user" | "photo" | "manager" | "directReports" | "department",
  key: string
) {
  return `organization:graph:${type}:${key.toLowerCase()}`;
}

function readCache<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(key);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as CacheRecord<T>;

    if (Date.now() > parsed.expiresAt) {
      window.sessionStorage.removeItem(key);
      return null;
    }

    return parsed.data;
  } catch {
    window.sessionStorage.removeItem(key);
    return null;
  }
}

function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.sessionStorage.setItem(
      key,
      JSON.stringify({
        data,
        expiresAt: Date.now() + CACHE_TTL_MS,
      } satisfies CacheRecord<T>)
    );
  } catch {
    /**
     * Session storage puede fallar por límite de cuota, modo privado
     * o restricciones del navegador. Si falla, simplemente se omite cache.
     */
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);

    reader.readAsDataURL(blob);
  });
}

function normalizeGraphText(value: string) {
  return value.trim().toLowerCase();
}

function escapeODataString(value: string) {
  return value.replace(/'/g, "''");
}

function isReadableUser(user: GraphOrganizationUser) {
  return Boolean(
    user.id &&
      user.displayName &&
      (user.mail || user.userPrincipalName)
  );
}

async function getGraphToken() {
  return getAccessToken({
    silentExtraScopesToConsent: [...GRAPH_ORGANIZATION_SCOPES],
  });
}

async function graphFetch<T>(pathOrUrl: string): Promise<T> {
  const token = await getGraphToken();

  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      ConsistencyLevel: "eventual",
    },
  });

  if (!response.ok) {
    throw new Error(`[Graph] ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

async function graphPhotoFetch(path: string): Promise<Response> {
  const token = await getGraphToken();

  return fetch(`${GRAPH_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

async function graphFetchCollection<T>(
  path: string,
  maxPages = 3
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | undefined = path;
  let currentPage = 0;

  while (nextUrl && currentPage < maxPages) {
    const collectionResponse: GraphCollectionResponse<T> =
      await graphFetch<GraphCollectionResponse<T>>(nextUrl);

    results.push(...collectionResponse.value);
    nextUrl = collectionResponse["@odata.nextLink"];
    currentPage += 1;
  }

  return results;
}

export async function getGraphUserByEmail(
  email: string
): Promise<GraphOrganizationUser | null> {
  const cacheKey = getCacheKey("user", email);
  const cachedUser = readCache<GraphOrganizationUser>(cacheKey);

  if (cachedUser) {
    return cachedUser;
  }

  try {
    const user = await graphFetch<GraphOrganizationUser>(
      `/users/${encodeURIComponent(email)}?$select=${USER_SELECT_FIELDS}`
    );

    writeCache(cacheKey, user);

    return user;
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudo obtener usuario:",
      email,
      error
    );

    return null;
  }
}

export async function getGraphUserPhotoUrl(
  email: string
): Promise<string | null> {
  const cacheKey = getCacheKey("photo", email);
  const cachedPhoto = readCache<string>(cacheKey);

  if (cachedPhoto) {
    return cachedPhoto;
  }

  try {
    const response = await graphPhotoFetch(
      `/users/${encodeURIComponent(email)}/photo/$value`
    );

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();
    const photoBase64 = await blobToBase64(blob);

    writeCache(cacheKey, photoBase64);

    return photoBase64;
  } catch (error) {
    console.warn("[Organization Graph] No se pudo obtener foto:", email, error);

    return null;
  }
}

export async function getGraphUserManager(
  email: string
): Promise<GraphOrganizationUser | null> {
  const cacheKey = getCacheKey("manager", email);
  const cachedManager = readCache<GraphOrganizationUser>(cacheKey);

  if (cachedManager) {
    return cachedManager;
  }

  try {
    const manager = await graphFetch<GraphOrganizationUser>(
      `/users/${encodeURIComponent(email)}/manager?$select=${USER_SELECT_FIELDS}`
    );

    writeCache(cacheKey, manager);

    return manager;
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudo obtener manager:",
      email,
      error
    );

    return null;
  }
}

export async function getGraphUserDirectReports(
  email: string
): Promise<GraphOrganizationUser[]> {
  const cacheKey = getCacheKey("directReports", email);
  const cachedReports = readCache<GraphOrganizationUser[]>(cacheKey);

  if (cachedReports) {
    return cachedReports;
  }

  try {
    const response = await graphFetch<
      GraphCollectionResponse<GraphOrganizationUser>
    >(
      `/users/${encodeURIComponent(
        email
      )}/directReports?$select=${USER_SELECT_FIELDS}`
    );

    const reports = response.value.filter(isReadableUser);

    writeCache(cacheKey, reports);

    return reports;
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudieron obtener personas a cargo:",
      email,
      error
    );

    return [];
  }
}

export async function getGraphUsersByDepartment(
  department: string
): Promise<GraphOrganizationUser[]> {
  const normalizedDepartment = normalizeGraphText(department);
  const cacheKey = getCacheKey("department", normalizedDepartment);
  const cachedUsers = readCache<GraphOrganizationUser[]>(cacheKey);

  if (cachedUsers) {
    return cachedUsers;
  }

  try {
    const escapedDepartment = escapeODataString(department.trim());

    const users = await graphFetchCollection<GraphOrganizationUser>(
      `/users?$select=${USER_SELECT_FIELDS}&$filter=department eq '${escapedDepartment}'&$top=999`,
      20
    );

    const filteredUsers = users
      .filter(isReadableUser)
      .filter(
        (user) =>
          user.department &&
          normalizeGraphText(user.department) === normalizedDepartment
      );

    writeCache(cacheKey, filteredUsers);

    return filteredUsers;
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudieron obtener usuarios por departamento:",
      department,
      error
    );

    return [];
  }
}

/**
 * Función temporal para revisar qué valores reales existen en el campo
 * department dentro de Microsoft Entra ID.
 */
export async function getGraphUsersSample(): Promise<GraphOrganizationUser[]> {
  try {
    const users = await graphFetchCollection<GraphOrganizationUser>(
      `/users?$select=${USER_SELECT_FIELDS}&$top=999`,
      20
    );

    return users.filter(isReadableUser);
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudo obtener muestra de usuarios:",
      error
    );

    return [];
  }
}