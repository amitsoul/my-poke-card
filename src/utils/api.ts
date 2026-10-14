// A typed fetch: fetchJson<PokemonListResponse>(url) returns that type instead of `any`.

export const API_URL = 'https://pokeapi.co/api/v2'

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Request failed (${response.status}): ${url}`)
  // response.json() returns `any`; we say what we expect here, in ONE place.
  // This is a promise to TypeScript, not a runtime check: the types must match the real API.
  return (await response.json()) as T
}
