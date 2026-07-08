import { getAccessToken } from "@/app/api/auth/msal";

const GRAPH_BASE_URL = "https://graph.microsoft.com/v1.0";

const SHAREPOINT_DISCOVERY_SCOPES = ["Sites.Read.All"] as const;

const DEFAULT_SITE_SEARCH_TERMS = [
  "documentos",
  "recursos",
  "humanos",
  "talento",
  "capital",
  "juridico",
  "legal",
  "tecnologia",
  "sistemas",
  "ti",
  "comercial",
  "ventas",
  "finanzas",
  "contabilidad",
  "logistica",
  "compras",
  "operaciones",
  "administrativo",
  "administracion",
  "marketing",
  "mercadeo",
];

export interface SharePointSiteDiscoveryResult {
  id: string;
  name?: string;
  displayName?: string;
  description?: string;
  webUrl?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

export interface SharePointDriveDiscoveryResult {
  id: string;
  name?: string;
  description?: string;
  webUrl?: string;
  driveType?: string;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
}

export interface SharePointDriveItemDiscoveryResult {
  id: string;
  name?: string;
  webUrl?: string;
  size?: number;
  createdDateTime?: string;
  lastModifiedDateTime?: string;
  folder?: {
    childCount?: number;
  };
  file?: {
    mimeType?: string;
  };
}

interface GraphCollectionResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

async function getSharePointToken() {
  return getAccessToken({
    silentExtraScopesToConsent: Array.from(SHAREPOINT_DISCOVERY_SCOPES),
  });
}

async function graphFetch<T>(pathOrUrl: string): Promise<T> {
  const token = await getSharePointToken();

  const url = pathOrUrl.startsWith("https://")
    ? pathOrUrl
    : `${GRAPH_BASE_URL}${pathOrUrl}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `[SharePoint Graph] ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<T>;
}

async function graphFetchCollection<T>(
  path: string,
  maxPages = 3
): Promise<T[]> {
  const results: T[] = [];
  let nextUrl: string | undefined = path;
  let currentPage = 0;

  while (nextUrl && currentPage < maxPages) {
    const response: GraphCollectionResponse<T> =
      await graphFetch<GraphCollectionResponse<T>>(nextUrl);

    results.push(...response.value);
    nextUrl = response["@odata.nextLink"];
    currentPage += 1;
  }

  return results;
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const map = new Map<string, T>();

  items.forEach((item) => {
    map.set(item.id, item);
  });

  return Array.from(map.values());
}

function sortByName<T extends { name?: string; displayName?: string }>(
  items: T[]
) {
  return [...items].sort((a, b) =>
    (a.displayName ?? a.name ?? "").localeCompare(
      b.displayName ?? b.name ?? "",
      "es"
    )
  );
}

function sortDriveItems(items: SharePointDriveItemDiscoveryResult[]) {
  return [...items].sort((a, b) => {
    const aIsFolder = Boolean(a.folder);
    const bIsFolder = Boolean(b.folder);

    if (aIsFolder !== bIsFolder) {
      return aIsFolder ? -1 : 1;
    }

    return (a.name ?? "").localeCompare(b.name ?? "", "es");
  });
}

export async function searchSharePointSites(
  query: string
): Promise<SharePointSiteDiscoveryResult[]> {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    return [];
  }

  const sites = await graphFetchCollection<SharePointSiteDiscoveryResult>(
    `/sites?search=${encodeURIComponent(normalizedQuery)}`,
    2
  );

  return sortByName(sites);
}

export async function discoverSharePointSites(
  searchTerms = DEFAULT_SITE_SEARCH_TERMS
): Promise<SharePointSiteDiscoveryResult[]> {
  const results = await Promise.allSettled(
    searchTerms.map((term) => searchSharePointSites(term))
  );

  const sites = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value : []
  );

  return sortByName(uniqueById(sites));
}

export async function getSharePointSiteDrives(
  siteId: string
): Promise<SharePointDriveDiscoveryResult[]> {
  const drives = await graphFetchCollection<SharePointDriveDiscoveryResult>(
    `/sites/${encodeURIComponent(siteId)}/drives`,
    2
  );

  return sortByName(drives);
}

export async function getSharePointDriveRootChildren(
  driveId: string
): Promise<SharePointDriveItemDiscoveryResult[]> {
  const items = await graphFetchCollection<SharePointDriveItemDiscoveryResult>(
    `/drives/${encodeURIComponent(driveId)}/root/children`,
    2
  );

  return sortDriveItems(items);
}

export async function getSharePointFolderChildren(
  driveId: string,
  itemId: string
): Promise<SharePointDriveItemDiscoveryResult[]> {
  const items = await graphFetchCollection<SharePointDriveItemDiscoveryResult>(
    `/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(
      itemId
    )}/children`,
    2
  );

  return sortDriveItems(items);
}