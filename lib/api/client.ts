const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiGet<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      // Authorization: `Bearer ${token}` ← cuando tengas auth
    },
    next: { revalidate: 60 }, // cache 60s para Server Components
  });

  if (!res.ok) throw new Error(`API error ${res.status}: ${endpoint}`);
  return res.json();
}