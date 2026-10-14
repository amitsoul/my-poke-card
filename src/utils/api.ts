// A typed fetch: fetchJson<PokemonListResponse>(url) returns that type instead of `any`.

export const API_URL = 'https://pokeapi.co/api/v2'

const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

// 25 → the official artwork URL for Pikachu (no request needed)
export function getArtworkUrl(id: number): string {
  return `${ARTWORK_URL}/${id}.png`
}

// Thrown when the server answers with an error status, so callers can tell 404 from other errors
export class ApiError extends Error {
  status: number

  constructor(status: number, url: string) {
    super(`Request failed (${status}): ${url}`)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) throw new ApiError(response.status, url)
  // response.json() returns `any`; we say what we expect here, in ONE place.
  // This is a promise to TypeScript, not a runtime check: the types must match the real API.
  return (await response.json()) as T
}
