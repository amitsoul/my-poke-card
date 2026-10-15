// Page "/create" and "/create/:id": create your card.
// Without an id the user first has to choose a Pokémon (list → details → "Create my card with …").
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CardForm from '../components/CardForm.tsx'
import CardSummary from '../components/CardSummary.tsx'
import ChangeWarning from '../components/ChangeWarning.tsx'
import FavoritePokemonField from '../components/FavoritePokemonField.tsx'
import { usePokemonDetails } from '../hooks/usePokemonDetails.ts'
import type { CardTextData, CardTextValues } from '../utils/cardForm.ts'
import { getCardType } from '../utils/cardType.ts'
import { formatPokemonName, getGameTypes } from '../utils/pokemonDetails.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import NotFoundPage from './NotFoundPage.tsx'

// What the page remembers about the form — together with the Pokémon it belongs to.
// For another Pokémon (e.g. Back from /create/4 to /create/25) it simply counts as a fresh start.
interface CreateSession {
  pokemonId: number
  hasValues: boolean // an answer exists (typed, or kept after "Edit") → "Change" warns first
  card: CardTextData | null // the answers after a valid "Create my card" → the summary is shown
  editValues: CardTextValues | undefined // the answers to put back into the form after "Edit"
  isWarningOpen: boolean
}

function freshSession(pokemonId: number): CreateSession {
  return { pokemonId, hasValues: false, card: null, editValues: undefined, isWarningOpen: false }
}

// The cleaned answers back into form text, for "Edit" (age 30 → "30")
function toFormValues(card: CardTextData): CardTextValues {
  return { name: card.name, age: String(card.age), superpower: card.superpower, aboutYou: card.aboutYou }
}

export default function CreateCardPage() {
  const { id } = useParams()
  const pokemonId = parsePokemonId(id)
  const { state, retry } = usePokemonDetails(pokemonId)
  const navigate = useNavigate()
  const [savedSession, setSavedSession] = useState<CreateSession | null>(null)
  const changeButtonRef = useRef<HTMLButtonElement>(null)

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

  const session =
    savedSession !== null && savedSession.pokemonId === pokemonId ? savedSession : freshSession(pokemonId)

  function updateSession(changes: Partial<Omit<CreateSession, 'pokemonId'>>) {
    setSavedSession({ ...session, ...changes })
  }

  function handleChangePokemon() {
    if (session.hasValues) updateSession({ isWarningOpen: true })
    else navigate('/')
  }

  function handleKeepEditing() {
    updateSession({ isWarningOpen: false })
    changeButtonRef.current?.focus()
  }

  function handleSubmit(card: CardTextData) {
    updateSession({ card, hasValues: true, isWarningOpen: false })
  }

  // Back to the form with the answers kept. The form is filled but nobody typed yet,
  // so the page sets hasValues here — "Change" must still warn.
  function handleEdit(card: CardTextData) {
    updateSession({ card: null, editValues: toFormValues(card), hasValues: true })
  }

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

      {state.status === 'ready' && (
        <>
          <FavoritePokemonField
            details={state.details}
            onChangePokemon={handleChangePokemon}
            changeButtonRef={changeButtonRef}
          />

          {session.isWarningOpen && <ChangeWarning onConfirm={() => navigate('/')} onCancel={handleKeepEditing} />}

          {session.card === null ? (
            // key: a different Pokémon gets a brand-new, empty form
            <CardForm
              key={pokemonId}
              initialValues={session.editValues}
              onDirtyChange={(hasValues) => updateSession({ hasValues })}
              onSubmit={handleSubmit}
            />
          ) : (
            <CardSummary
              card={session.card}
              pokemonName={formatPokemonName(state.details.name)}
              cardType={getCardType(getGameTypes(state.details))}
              onEdit={() => {
                if (session.card !== null) handleEdit(session.card)
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
