// A tiny fake PokéAPI for tests: instead of the real fetch, answers from our own small data,
// and remembers every URL that was asked for (so a test can count the move requests).
import { vi } from 'vitest'
import type { MoveResponse, SpeciesResponse } from '../types/pokemon.ts'

// A /move/{name} answer. englishName = null: the move has no English name (tests the slug fallback).
export function moveResponse(name: string, power: number | null, englishName: string | null = null): MoveResponse {
  return {
    name,
    power,
    names: englishName === null ? [] : [{ name: englishName, language: { name: 'en', url: '' } }],
  }
}

// A /pokemon-species/{id} answer with an English genus (or none)
export function speciesResponse(englishGenus: string | null): SpeciesResponse {
  return { genera: englishGenus === null ? [] : [{ genus: englishGenus, language: { name: 'en', url: '' } }] }
}

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

interface FakeApiData {
  moves?: MoveResponse[]
  species?: SpeciesResponse
  failingMoves?: string[] // these moves answer with a server error (500)
}

// Replaces fetch for this test (src/test/setup.ts puts the real one back afterwards)
export function stubPokeApi(data: FakeApiData): { requests: string[]; moveRequests: () => string[] } {
  const requests: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      requests.push(url)
      const moveName = url.match(/\/move\/([^/]+)$/)?.[1]
      if (moveName !== undefined) {
        if (data.failingMoves?.includes(moveName)) return new Response('Server error', { status: 500 })
        const move = data.moves?.find((item) => item.name === moveName)
        if (move !== undefined) return jsonResponse(move)
      }
      if (url.includes('/pokemon-species/') && data.species !== undefined) return jsonResponse(data.species)
      return new Response('Not found', { status: 404 })
    }),
  )
  return { requests, moveRequests: () => requests.filter((url) => url.includes('/move/')) }
}
