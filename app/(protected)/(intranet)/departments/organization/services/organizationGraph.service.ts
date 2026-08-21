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

// -- Cache en sessionStorage (datos JSON pequeños) --------------------------
//
// Se usa para todo excepto fotos: perfiles, managers, direct reports,
// departamentos. Son objetos livianos (unos pocos KB), muy por debajo de
// cualquier límite razonable de sessionStorage.

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
  } catch (e) {
    /**
     * Session storage puede fallar por límite de cuota, modo privado
     * o restricciones del navegador. Se loguea (antes se omitía en
     * silencio) porque una escritura JSON de pocos KB fallando por
     * cuota es una señal de que algo más está llenando el storage —
     * ya no debería pasar con las fotos movidas a IndexedDB, pero si
     * vuelve a aparecer, queremos verlo en vez de que se pierda.
     */
    console.warn("[Organization Graph] No se pudo escribir en sessionStorage:", key, e);
  }
}

// -- Cache en IndexedDB (fotos en Base64) ------------------------------------
//
// Las fotos de perfil pueden pesar varios MB cada una en Base64. Guardarlas
// en sessionStorage agotaba su cuota (~10 MB por origen en Chrome) con
// apenas un puñado de fotos, y eso rompía CUALQUIER otra escritura a
// sessionStorage en la página — incluida la de MSAL, que parecía el
// problema pero en realidad solo era la víctima. IndexedDB no tiene ese
// techo tan bajo (cientos de GB típicamente) y es exactamente para esto:
// blobs grandes de cliente.
//
// Aun con una cuota mucho mayor, esto sigue siendo técnicamente
// acumulable — por eso además de guardar acá, se purga proactivamente lo
// vencido (ver purgeExpiredPhotoCache más abajo) en vez de depender solo
// de que alguien vuelva a pedir esa foto puntual para notar que expiró.

const PHOTO_DB_NAME = "edm-graph-photo-cache";
const PHOTO_DB_VERSION = 1;
const PHOTO_STORE_NAME = "photos";

let photoDbPromise: Promise<IDBDatabase> | null = null;

function openPhotoDb(): Promise<IDBDatabase> {
  if (photoDbPromise) return photoDbPromise;

  photoDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(PHOTO_DB_NAME, PHOTO_DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(PHOTO_STORE_NAME)) {
        db.createObjectStore(PHOTO_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return photoDbPromise;
}

async function readPhotoCache(key: string): Promise<string | null> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return null;
  }

  try {
    const db = await openPhotoDb();
    const record = await new Promise<CacheRecord<string> | undefined>(
      (resolve, reject) => {
        const tx = db.transaction(PHOTO_STORE_NAME, "readonly");
        const req = tx.objectStore(PHOTO_STORE_NAME).get(key);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }
    );

    if (!record) {
      return null;
    }

    if (Date.now() > record.expiresAt) {
      // Vencida: la purgamos de una vez en lugar de dejarla ocupando
      // espacio hasta que alguien más la pida.
      void deletePhotoCache(key);
      return null;
    }

    return record.data;
  } catch (e) {
    console.warn("[Organization Graph] No se pudo leer foto de IndexedDB:", key, e);
    return null;
  }
}

async function writePhotoCache(key: string, photoBase64: string): Promise<void> {
  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return;
  }

  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE_NAME, "readwrite");
      tx.objectStore(PHOTO_STORE_NAME).put(
        { data: photoBase64, expiresAt: Date.now() + CACHE_TTL_MS } satisfies CacheRecord<string>,
        key
      );
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("[Organization Graph] No se pudo escribir foto en IndexedDB:", key, e);
  }
}

async function deletePhotoCache(key: string): Promise<void> {
  try {
    const db = await openPhotoDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE_NAME, "readwrite");
      tx.objectStore(PHOTO_STORE_NAME).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // No crítico: si falla la limpieza, la entrada vencida se sobrescribe
    // en el próximo writePhotoCache con la misma key de todas formas.
  }
}

/**
 * Purga proactiva de entradas vencidas en la base de fotos.
 *
 * @remarks
 * `readPhotoCache` solo detecta que una entrada venció cuando alguien
 * vuelve a pedir esa foto puntual — si nadie la vuelve a consultar, se
 * queda ocupando espacio indefinidamente aunque ya expiró hace rato. Esta
 * función recorre TODA la base con un cursor y borra lo vencido, sin
 * depender de que se relea cada clave.
 *
 * Se dispara una única vez por sesión de pestaña (gateada por
 * {@link photoCachePurged}, en memoria — no en storage — porque el
 * objetivo es una purga por carga de página, no una migración
 * permanente) para no generar overhead innecesario recorriendo la base
 * en cada llamada a {@link getGraphUserPhotoUrl}.
 */
let photoCachePurged = false;

async function purgeExpiredPhotoCache(): Promise<void> {
  if (photoCachePurged) return;
  photoCachePurged = true;

  if (typeof window === "undefined" || !("indexedDB" in window)) {
    return;
  }

  try {
    const db = await openPhotoDb();
    const now = Date.now();

    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(PHOTO_STORE_NAME, "readwrite");
      const store = tx.objectStore(PHOTO_STORE_NAME);
      const cursorRequest = store.openCursor();

      let purgedCount = 0;

      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (!cursor) return;

        const record = cursor.value as CacheRecord<string>;
        if (record.expiresAt < now) {
          cursor.delete();
          purgedCount += 1;
        }
        cursor.continue();
      };

      tx.oncomplete = () => {
        if (purgedCount > 0) {
          console.debug(
            `[Organization Graph] Purgadas ${purgedCount} fotos vencidas de IndexedDB`
          );
        }
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.warn("[Organization Graph] No se pudo purgar cache de fotos:", e);
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
  // Dispara en paralelo, no bloquea la respuesta de esta llamada — se
  // auto-limita a una vez por sesión de pestaña (ver purgeExpiredPhotoCache).
  void purgeExpiredPhotoCache();

  const cacheKey = getCacheKey("photo", email);
  const cachedPhoto = await readPhotoCache(cacheKey);

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

    await writePhotoCache(cacheKey, photoBase64);

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