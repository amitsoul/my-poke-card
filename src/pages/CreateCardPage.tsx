// Page "/create" and "/create/:id": create your card.
// Without an id the user first has to choose a Pokémon (list → details → "Create my card with …").
// The form fields come in steps 8c–8e.
import { Link, useParams } from 'react-router'
import FavoritePokemonField from '../components/FavoritePokemonField.tsx'
import { usePokemonDetails } from '../hooks/usePokemonDetails.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import NotFoundPage from './NotFoundPage.tsx'

export default function CreateCardPage() {
  const { id } = useParams()
  const pokemonId = parsePokemonId(id)
  const { state, retry } = usePokemonDetails(pokemonId)

  // "/create": no Pokémon chosen yet
  if (id === undefined) {
    return (
      <section className="status">
        <h1>Choose your favorite Pokémon</h1>
        <p>Pick a Pokémon from the list, then tap "Create my card" on its page.</p>
        <Link to="/" className="button">
          Go to the Pokémon list
        </Link>
      </section>
    )
  }

  // "/create/abc", "/create/0", … → the 404 page (after the hooks, like the details page)
  if (pokemonId === null) return <NotFoundPage />

  return (
    <div className="create-page">
      <h1>Create your card</h1>

      {state.status === 'loading' && <p className="status">Loading your Pokémon...</p>}

      {/* A valid number, but the API has no such Pokémon (e.g. /create/99999) */}
      {state.status === 'not-found' && (
        <div className="status">
          <p>Pokémon not found</p>
          <Link to="/" className="button">
            Back to the list
          </Link>
        </div>
      )}

      {state.status === 'error' && (
        <div className="status">
          <p>Oops! We couldn't load this Pokémon. Please check your internet connection.</p>
          <button type="button" className="button" onClick={retry}>
            Try again
          </button>
        </div>
      )}

      {state.status === 'ready' && <FavoritePokemonField details={state.details} />}
    </div>
  )
}
