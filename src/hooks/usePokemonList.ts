// All Pokémon species, for the list page and the Create page's Pokémon search (src/utils/pokemonListApi.ts:
// 2 requests, then cached for the visit). Each page decides what to SHOW; this hook only loads and retries.
import { useEffect, useState } from 'react'
import type { PokemonSummary } from '../types/pokemon.ts'
import { loadPokemonList } from '../utils/pokemonListApi.ts'

export type PokemonListState =
  | { status: 'loading' }
  | { status: 'ready'; list: PokemonSummary[] }
  | { status: 'error' }

// The answer of one try — remembered together with the try it belongs to (an old answer never counts)
type ListResult = { attempt: number; status: 'ready'; list: PokemonSummary[] } | { attempt: number; status: 'error' }

export function usePokemonList(): { state: PokemonListState; retry: () => void } {
  const [result, setResult] = useState<ListResult | null>(null)
  const [attempt, setAttempt] = useState<number>(0)

  useEffect(() => {
    // Becomes false if this try is replaced (or the page closes) before the answer arrives
    let isCurrent = true
    loadPokemonList().then(
      (list) => {
        if (isCurrent) setResult({ attempt, status: 'ready', list })
      },
      () => {
        if (isCurrent) setResult({ attempt, status: 'error' })
      },
    )
    return () => {
      isCurrent = false
    }
  }, [attempt])

  // Loading is not stored: it's simply "no answer yet for this try"
  let state: PokemonListState = { status: 'loading' }
  if (result !== null && result.attempt === attempt) {
    state = result.status === 'ready' ? { status: 'ready', list: result.list } : { status: 'error' }
  }

  // "Try again": a new try (→ loading), so the effect asks again
  return { state, retry: () => setAttempt((current) => current + 1) }
}
