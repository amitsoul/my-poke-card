// Loads one Pokémon from /pokemon/{id}. Shared by the details page and the Create card page.
// Each page decides what to SHOW for each state; this hook only fetches, guards against races and retries.
import { useEffect, useState } from 'react'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { API_URL, ApiError, fetchJson } from '../utils/api.ts'

export type PokemonDetailsState =
  | { status: 'loading' }
  | { status: 'ready'; details: PokemonDetailsResponse }
  | { status: 'not-found' } // the API answered 404 (e.g. /pokemon/99999)
  | { status: 'error' } // every other problem (e.g. offline)

// The answer for one id — remembered together with the id it belongs to
type DetailsResult =
  | { id: number; status: 'ready'; details: PokemonDetailsResponse }
  | { id: number; status: 'not-found' }
  | { id: number; status: 'error' }

// pokemonId = null means "not a valid id": nothing is fetched (the page shows its 404 page instead).
// Hooks can't be skipped with an early return, so the page always calls this and checks null itself.
export function usePokemonDetails(pokemonId: number | null): {
  state: PokemonDetailsState
  retry: () => void
} {
  const [result, setResult] = useState<DetailsResult | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  // "Try again": forget the error (→ loading) and bump the counter so the effect re-runs
  function retry() {
    setResult(null)
    setRetryCount(retryCount + 1)
  }

  // Runs when the id changes (or retry is called). Only fetches and saves the answer.
  useEffect(() => {
    if (pokemonId === null) return

    // Becomes false if the id changes before this answer arrives
    let isCurrent = true

    async function loadDetails(idToLoad: number) {
      try {
        const details = await fetchJson<PokemonDetailsResponse>(`${API_URL}/pokemon/${idToLoad}`)
        if (isCurrent) setResult({ id: idToLoad, status: 'ready', details })
      } catch (error) {
        const isNotFound = error instanceof ApiError && error.status === 404
        if (isCurrent) setResult({ id: idToLoad, status: isNotFound ? 'not-found' : 'error' })
      }
    }

    loadDetails(pokemonId)

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [pokemonId, retryCount])

  // Loading = no answer yet for THIS id (also right after the id changes)
  let state: PokemonDetailsState
  if (pokemonId === null || result === null || result.id !== pokemonId) {
    state = { status: 'loading' }
  } else if (result.status === 'ready') {
    state = { status: 'ready', details: result.details }
  } else {
    state = { status: result.status }
  }

  return { state, retry }
}
