import { getAccessToken } from "@/app/api/auth/msal";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";
const CACHE_TTL_MS = 1000 * 60 * 30;

const GRAPH_ORGANIZATION_SCOPES = [
  "User.Read.All",
  "Directory.Read.All",
] as const;

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
}

interface CacheRecord<T> {
  data: T;
  expiresAt: number;
}

function getCacheKey(
  type: "user" | "photo" | "manager" | "directReports",
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
    const record: CacheRecord<T> = {
      data,
      expiresAt: Date.now() + CACHE_TTL_MS,
    };

    window.sessionStorage.setItem(key, JSON.stringify(record));
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

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(reader.error);
    };

    reader.readAsDataURL(blob);
  });
}

async function getGraphToken() {
  return getAccessToken({
    silentExtraScopesToConsent: [...GRAPH_ORGANIZATION_SCOPES],
  });
}

async function graphFetch<T>(path: string): Promise<T> {
  const token = await getGraphToken();

  const response = await fetch(`${GRAPH_BASE_URL}${path}`, {
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
      `/users/${encodeURIComponent(
        email
      )}?$select=id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation`
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
      `/users/${encodeURIComponent(
        email
      )}/manager?$select=id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation`
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
      )}/directReports?$select=id,displayName,jobTitle,mail,userPrincipalName,department,officeLocation`
    );

    writeCache(cacheKey, response.value);

    return response.value;
  } catch (error) {
    console.warn(
      "[Organization Graph] No se pudieron obtener personas a cargo:",
      email,
      error
    );

    return [];
  }
}