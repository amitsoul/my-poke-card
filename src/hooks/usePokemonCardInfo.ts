// Loads what the card needs beyond /pokemon/{id}: the genus ("Mouse Pokémon") and up to 2 attacks.
// Same pattern as usePokemonDetails: each page decides what to SHOW; this hook fetches, guards against
// races and retries.
import { useEffect, useState } from 'react'
import type { PokemonDetailsResponse, SpeciesResponse } from '../types/pokemon.ts'
import { API_URL, fetchJson } from '../utils/api.ts'
import { getCardType } from '../utils/cardType.ts'
import { chooseAttacks } from '../utils/moveApi.ts'
import { getEnglishGenus, type Attack } from '../utils/moves.ts'
import { getGameTypes } from '../utils/pokemonDetails.ts'

export interface PokemonCardInfo {
  genus: string | null // null: no English genus → the card leaves it out
  attacks: Attack[]
}

export type PokemonCardInfoState =
  | { status: 'loading' }
  | { status: 'ready'; info: PokemonCardInfo }
  | { status: 'error' } // the genus or a move couldn't be loaded

// The answer for one Pokémon — remembered together with the id it belongs to
type CardInfoResult = { id: number; status: 'ready'; info: PokemonCardInfo } | { id: number; status: 'error' }

// details = null: the Pokémon itself isn't loaded yet → nothing is fetched
export function usePokemonCardInfo(details: PokemonDetailsResponse | null): {
  state: PokemonCardInfoState
  retry: () => void
} {
  const [result, setResult] = useState<CardInfoResult | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  // "Try again": forget the error (→ loading) and bump the counter so the effect re-runs
  function retry() {
    setResult(null)
    setRetryCount(retryCount + 1)
  }

  // Runs when the Pokémon changes (or retry is called). Only fetches and saves the answer.
  useEffect(() => {
    if (details === null) return

    // Becomes false if the Pokémon changes before this answer arrives
    let isCurrent = true

    async function loadCardInfo(pokemon: PokemonDetailsResponse) {
      try {
        const cardType = getCardType(getGameTypes(pokemon))
        // The genus and the attacks at the same time
        const [species, attacks] = await Promise.all([
          fetchJson<SpeciesResponse>(`${API_URL}/pokemon-species/${pokemon.id}`),
          chooseAttacks(pokemon, cardType),
        ])
        if (isCurrent) setResult({ id: pokemon.id, status: 'ready', info: { genus: getEnglishGenus(species), attacks } })
      } catch {
        if (isCurrent) setResult({ id: pokemon.id, status: 'error' })
      }
    }

    loadCardInfo(details)

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [details, retryCount])

  // Loading = no answer yet for THIS Pokémon
  let state: PokemonCardInfoState
  if (details === null || result === null || result.id !== details.id) {
    state = { status: 'loading' }
  } else if (result.status === 'ready') {
    state = { status: 'ready', info: result.info }
  } else {
    state = { status: 'error' }
  }

  return { state, retry }
}
