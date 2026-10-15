// Page "/pokemon/:id": reads the id from the URL, loads that Pokémon and shows its details.
import { Link, useLocation, useParams } from 'react-router'
import PokemonDetails from '../components/PokemonDetails.tsx'
import { usePokemonDetails } from '../hooks/usePokemonDetails.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import { getBackToListUrl } from '../utils/navigation.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import NotFoundPage from './NotFoundPage.tsx'

export default function PokemonDetailsPage() {
  const { id } = useParams()
  const pokemonId = parsePokemonId(id)
  const backToListUrl = getBackToListUrl(useLocation().state)
  const { state, retry } = usePokemonDetails(pokemonId)

  // Not a valid id (/pokemon/abc, /pokemon/0, /pokemon/1.5) → the 404 page.
  // This comes after all the hooks above: React needs the same hooks, in the same order, on every render.
  if (pokemonId === null) return <NotFoundPage />

  return (
    <div className="details-page">
      {/* In the not-found state the red button below is the only way back, so this link is hidden */}
      {state.status !== 'not-found' && (
        <Link to={backToListUrl} className="back-link">
          ← Back to list
        </Link>
      )}

      {state.status === 'loading' && <p className="status">Loading details...</p>}

      {/* A valid number, but the API has no such Pokémon (e.g. /pokemon/99999) */}
      {state.status === 'not-found' && (
        <div className="status">
          <p>Pokémon not found</p>
          <Link to={backToListUrl} className="button">
            Back to the list
          </Link>
        </div>
      )}

      {state.status === 'error' && (
        <div className="status">
          <p>Oops! We couldn't load the details. Please check your internet connection.</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && (
        <>
          <PokemonDetails details={state.details} />
          <div className="details-actions">
            <Link to={`/create/${state.details.id}`} className="button">
              Create my card with {formatPokemonName(state.details.name)}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
