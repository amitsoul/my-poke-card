// Page "/create" and "/create/:id": create your card.
// Without an id the user first has to choose a Pokémon (list → details → "Create my card with …").
import { useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import CardForm from '../components/CardForm.tsx'
import FavoritePokemonField from '../components/FavoritePokemonField.tsx'
import InlineConfirm from '../components/InlineConfirm.tsx'
import PokeCard from '../components/PokeCard.tsx'
import SavedNotice from '../components/SavedNotice.tsx'
import { usePokemonCardInfo } from '../hooks/usePokemonCardInfo.ts'
import { usePokemonDetails } from '../hooks/usePokemonDetails.ts'
import type { CardPokemon } from '../types/pokemon.ts'
import type { CardData, CardFormData, CardFormDraft } from '../utils/cardForm.ts'
import { toCardPokemon } from '../utils/pokemonDetails.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import { saveCard } from '../utils/savedCards.ts'
import { DEFAULT_STICKER_POSITION, type StickerPosition } from '../utils/sticker.ts'
import NotFoundPage from './NotFoundPage.tsx'

// What the page remembers about the form — together with the Pokémon it belongs to.
// For another Pokémon (e.g. Back from /create/4 to /create/25) it simply counts as a fresh start.
interface CreateSession {
  pokemonId: number
  hasValues: boolean // an answer exists (typed, or kept after "Edit") → "Change" warns first
  card: CardData | null // the answers after a valid "Create my card" → the card is shown
  editValues: CardFormDraft | undefined // the answers and photo to put back into the form after "Edit"
  isWarningOpen: boolean
  // Where the sticker sits. Kept through "Edit" → "Create my card", so the card keeps its look.
  stickerPosition: StickerPosition
  savedNumber: number | null // set once this card is saved (then: no second Save, the sticker is fixed)
  saveProblem: 'wait' | 'full' | 'blocked' | null // why the last Save didn't work
}

function freshSession(pokemonId: number): CreateSession {
  return {
    pokemonId,
    hasValues: false,
    card: null,
    editValues: undefined,
    isWarningOpen: false,
    stickerPosition: DEFAULT_STICKER_POSITION,
    savedNumber: null,
    saveProblem: null,
  }
}

// The cleaned answers back into the form, for "Edit" (age 30 → "30"; the photo is kept as it is)
function toFormValues(card: CardData): CardFormDraft {
  return {
    name: card.name,
    age: String(card.age),
    photo: card.photo,
    superpower: card.superpower,
    aboutYou: card.aboutYou,
  }
}

export default function CreateCardPage() {
  const { id } = useParams()
  const pokemonId = parsePokemonId(id)
  const { state, retry } = usePokemonDetails(pokemonId)
  // Genus + attacks start loading as soon as the Pokémon is loaded — while the user fills the form —
  // so the card is usually complete the moment it's shown
  const cardInfo = usePokemonCardInfo(state.status === 'ready' ? state.details : null)
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

  // The form's answers + the sticker position (the default for a new card, the kept one after "Edit")
  function handleSubmit(formData: CardFormData) {
    const card: CardData = { ...formData, stickerPosition: session.stickerPosition }
    // A new card is never saved yet (even after Edit of a saved one: saving it again gives a new number)
    updateSession({ card, hasValues: true, isWarningOpen: false, savedNumber: null, saveProblem: null })
  }

  // Back to the form with the answers kept. The form is filled but nobody typed yet,
  // so the page sets hasValues here — "Change" must still warn.
  function handleEdit(card: CardData) {
    updateSession({ card: null, editValues: toFormValues(card), hasValues: true, savedNumber: null, saveProblem: null })
  }

  // Save the card with its genus and attacks. Without them (still loading or failed) we don't save.
  function handleSave(card: CardData, pokemon: CardPokemon) {
    if (cardInfo.state.status !== 'ready') {
      updateSession({ saveProblem: 'wait' })
      return
    }
    const result = saveCard({ card, pokemon, info: cardInfo.state.info })
    if (result.ok) {
      // Saved: nothing can be lost any more, so "Change" no longer warns
      updateSession({ savedNumber: result.saved.number, saveProblem: null, hasValues: false, isWarningOpen: false })
    } else {
      updateSession({ saveProblem: result.error })
    }
  }

  // The message under the buttons after a Save that didn't work
  function renderSaveProblem() {
    if (session.saveProblem === 'wait' && cardInfo.state.status !== 'ready') {
      return <p role="alert" className="save-message">Please wait until the attacks are loaded.</p>
    }
    if (session.saveProblem === 'full') {
      return (
        <p role="alert" className="save-message">
          Your browser's storage is full. Delete some cards in <Link to="/my-cards">My Cards</Link>, then try again.
        </p>
      )
    }
    if (session.saveProblem === 'blocked') {
      return (
        <p role="alert" className="save-message">
          Cards can't be saved in this browser (storage is blocked or full).
        </p>
      )
    }
    return null
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

          {session.isWarningOpen && (
            <InlineConfirm
              message="Change Pokémon? Your answers will be cleared."
              confirmLabel="Yes, change"
              cancelLabel="Keep editing"
              onConfirm={() => navigate('/')}
              onCancel={handleKeepEditing}
            />
          )}

          {session.card === null ? (
            // key: a different Pokémon gets a brand-new, empty form
            <CardForm
              key={pokemonId}
              initialValues={session.editValues}
              onDirtyChange={(hasValues) => updateSession({ hasValues })}
              onSubmit={handleSubmit}
            />
          ) : (
            <PokeCard
              card={session.card}
              pokemon={toCardPokemon(state.details)}
              cardInfo={cardInfo.state}
              onRetryCardInfo={cardInfo.retry}
              // The sticker can move until the card is saved. A moved sticker is kept in the card AND the session,
              // so Edit → Create keeps it.
              onStickerMove={
                session.savedNumber !== null
                  ? undefined
                  : (stickerPosition) => {
                      if (session.card !== null) updateSession({ stickerPosition, card: { ...session.card, stickerPosition } })
                    }
              }
              cardNumber={session.savedNumber ?? undefined}
            >
              {session.savedNumber === null ? (
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    if (session.card !== null) handleSave(session.card, toCardPokemon(state.details))
                  }}
                >
                  Save to My Cards
                </button>
              ) : (
                <SavedNotice cardNumber={session.savedNumber} />
              )}
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  if (session.card !== null) handleEdit(session.card)
                }}
              >
                Edit
              </button>
              {renderSaveProblem()}
            </PokeCard>
          )}
        </>
      )}
    </div>
  )
}
