// Page "/pokemon/:id": reads the id from the URL, fetches that Pokémon and shows its details.
import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import PokemonDetails from '../components/PokemonDetails.tsx'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { API_URL, ApiError, fetchJson } from '../utils/api.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import { getBackToListUrl } from '../utils/navigation.ts'
import NotFoundPage from './NotFoundPage.tsx'

// The answer for one id: the details, "no such Pokémon" (404), or any other error
type DetailsResult =
  | { id: number; status: 'ready'; details: PokemonDetailsResponse }
  | { id: number; status: 'not-found' }
  | { id: number; status: 'error' }

export default function PokemonDetailsPage() {
  const { id } = useParams()
  const pokemonId = parsePokemonId(id)
  const backToListUrl = getBackToListUrl(useLocation().state)

  const [result, setResult] = useState<DetailsResult | null>(null)
  const [retryCount, setRetryCount] = useState<number>(0)

  // Loading = no answer yet for THIS id (also true right after the URL changes to another id)
  const isLoading = pokemonId !== null && (result === null || result.id !== pokemonId)

  // "Try again": forget the error (→ loading) and bump the counter so the effect re-runs
  function handleRetry() {
    setResult(null)
    setRetryCount(retryCount + 1)
  }

  // Runs when the id in the URL changes (or "Try again" is clicked). Only fetches and saves the answer.
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

  // Not a valid id (/pokemon/abc, /pokemon/0, /pokemon/1.5) → the 404 page.
  // This comes after all the hooks above: React needs the same hooks, in the same order, on every render.
  if (pokemonId === null) return <NotFoundPage />

  // A valid number, but the API has no such Pokémon (e.g. /pokemon/99999)
  const isNotFound = !isLoading && result !== null && result.status === 'not-found'

  return (
    <div className="details-page">
      {/* In the not-found state the red button below is the only way back, so this link is hidden */}
      {!isNotFound && (
        <Link to={backToListUrl} className="back-link">
          ← Back to list
        </Link>
      )}

      {isLoading && <p className="status">Loading details...</p>}

      {isNotFound && (
        <div className="status">
          <p>Pokémon not found</p>
          <Link to={backToListUrl} className="button">
            Back to the list
          </Link>
        </div>
      )}

      {!isLoading && result !== null && result.status === 'error' && (
        <div className="status">
          <p>Oops! We couldn't load the details. Please check your internet connection.</p>
          <button type="button" className="button" onClick={handleRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && result !== null && result.status === 'ready' && <PokemonDetails details={result.details} />}
    </div>
  )
}
