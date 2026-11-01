// Page "/create" and "/create/:id" (one route, "/create/:id?"): create your card.
// The form is there right away; its first field is the Pokémon search. Picking a Pokémon puts it in the URL
// ("/create/25", replacing the old URL), and everything already typed stays.
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useParams } from 'react-router'
import CardForm from '../components/CardForm.tsx'
import DownloadPngButton from '../components/DownloadPngButton.tsx'
import PokeCard from '../components/PokeCard.tsx'
import PokemonPicker from '../components/PokemonPicker.tsx'
import PokemonPreview from '../components/PokemonPreview.tsx'
import SavedNotice from '../components/SavedNotice.tsx'
import { usePokemonCardInfo } from '../hooks/usePokemonCardInfo.ts'
import { usePokemonDetails } from '../hooks/usePokemonDetails.ts'
import type { CardPokemon, PokemonSummary } from '../types/pokemon.ts'
import type { CardData, CardFormData, CardFormDraft } from '../utils/cardForm.ts'
import { formatPokemonName, toCardPokemon } from '../utils/pokemonDetails.ts'
import { parsePokemonId } from '../utils/pokemonId.ts'
import { getPngFileName, saveCard } from '../utils/savedCards.ts'
import { DEFAULT_STICKER_POSITION, type StickerPosition } from '../utils/sticker.ts'
import { getPageTitle } from '../utils/text.ts'
import NotFoundPage from './NotFoundPage.tsx'

// What the page remembers while you make your card
interface CreateSession {
  urlId: number | null // the Pokémon in the URL the last time the page looked (to notice a link or Back)
  pokemonId: number | null // the chosen Pokémon; the URL follows it
  pokemonName: string // its name once known ('' when the page opened with /create/25: it comes with the details)
  isRetyping: boolean // typing in the Pokémon field above a shown card (the card stays until a new pick)
  formKey: number // a new number → a brand-new, empty form
  card: CardData | null // the answers after a valid "Create my card" → the card is shown
  editValues: CardFormDraft | undefined // the answers and photo to put back into the form after "Edit"
  // Where the sticker sits. Kept through "Edit" → "Create my card", so the card keeps its look.
  // Back to the start for another Pokémon: a different artwork has a different shape.
  stickerPosition: StickerPosition
  savedNumber: number | null // set once this card is saved (then: no second Save, the sticker is fixed)
  saveProblem: 'wait' | 'full' | 'blocked' | null // why the last Save didn't work
}

function freshSession(urlId: number | null, formKey: number): CreateSession {
  return {
    urlId,
    pokemonId: urlId,
    pokemonName: '',
    isRetyping: false,
    formKey,
    card: null,
    editValues: undefined,
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
  const urlId = parsePokemonId(id)
  const [session, setSession] = useState<CreateSession>(() => freshSession(urlId, 0))

  // The URL changed. When it's the Pokémon we just picked (the page writes the URL itself), just note it.
  // Otherwise a link or Back/Forward changed it (e.g. "Create card" in the menu): start fresh for that URL.
  // (The router changes the URL a moment AFTER our own state, so the page's state — not the URL — says
  // which Pokémon is chosen.)
  if (urlId !== session.urlId) {
    setSession(urlId === session.pokemonId ? { ...session, urlId } : freshSession(urlId, session.formKey + 1))
  }

  const pokemonId = session.pokemonId
  const { state, retry } = usePokemonDetails(pokemonId)
  // Genus + attacks start loading as soon as the Pokémon is loaded — while the user fills the form —
  // so the card is usually complete the moment it's shown
  const cardInfo = usePokemonCardInfo(state.status === 'ready' ? state.details : null)
  const navigate = useNavigate()
  const pokemonInputRef = useRef<HTMLInputElement>(null)

  // "/create/abc", "/create/0", … → the 404 page (after the hooks, like the details page)
  if (id !== undefined && urlId === null) return <NotFoundPage />

  // The chosen Pokémon for the search field (its name from the pick, or from the details once loaded)
  const chosenPokemon: PokemonSummary | null =
    pokemonId === null
      ? null
      : { id: pokemonId, name: state.status === 'ready' ? state.details.name : session.pokemonName, image: '' }

  function updateSession(changes: Partial<Omit<CreateSession, 'urlId' | 'formKey'>>) {
    setSession({ ...session, ...changes })
  }

  // The changes for another Pokémon (or none): the sticker starts at its usual place again
  function pokemonChanges(pokemon: PokemonSummary | null): Partial<CreateSession> {
    return {
      pokemonId: pokemon === null ? null : pokemon.id,
      pokemonName: pokemon === null ? '' : pokemon.name,
      stickerPosition: DEFAULT_STICKER_POSITION,
      isRetyping: false,
    }
  }

  // The URL follows the chosen Pokémon. "replace": Back still goes to the page before Create, not through every pick.
  function updateUrl(pokemon: PokemonSummary | null) {
    navigate(pokemon === null ? '/create' : `/create/${pokemon.id}`, { replace: true })
  }

  // The form's Pokémon field: picked (or un-picked by typing) — the rest of the form stays as it is
  function handlePokemonSelect(pokemon: PokemonSummary | null) {
    const newId = pokemon === null ? null : pokemon.id
    if (newId === pokemonId) return
    updateSession(pokemonChanges(pokemon))
    updateUrl(pokemon)
  }

  // The Pokémon field above a shown card. Typing doesn't remove the card; a NEW pick goes back to the form
  // with every answer kept (like Edit), and the focus goes to the Pokémon field there.
  function handleCardPokemonSelect(pokemon: PokemonSummary | null) {
    if (pokemon === null) {
      updateSession({ isRetyping: true })
      return
    }
    const card = session.card
    if (pokemon.id === pokemonId || card === null) {
      updateSession({ isRetyping: false })
      return
    }
    // flushSync: the form must be on the screen before the focus can move to it
    flushSync(() => {
      updateSession({
        ...pokemonChanges(pokemon),
        card: null,
        editValues: toFormValues(card),
        savedNumber: null,
        saveProblem: null,
      })
    })
    updateUrl(pokemon)
    pokemonInputRef.current?.focus()
  }

  // The form's answers + the sticker position (the default for a new card, the kept one after "Edit")
  function handleSubmit(formData: CardFormData) {
    const card: CardData = { ...formData, stickerPosition: session.stickerPosition }
    // A new card is never saved yet (even after Edit of a saved one: saving it again gives a new number)
    updateSession({ card, savedNumber: null, saveProblem: null })
  }

  // Back to the form with the answers kept
  function handleEdit(card: CardData) {
    updateSession({ card: null, editValues: toFormValues(card), savedNumber: null, saveProblem: null })
  }

  // Save the card with its genus and attacks. Without them (still loading or failed) we don't save.
  function handleSave(card: CardData, pokemon: CardPokemon) {
    if (cardInfo.state.status !== 'ready') {
      updateSession({ saveProblem: 'wait' })
      return
    }
    const result = saveCard({ card, pokemon, info: cardInfo.state.info })
    if (result.ok) {
      updateSession({ savedNumber: result.saved.number, saveProblem: null })
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

  // The chosen Pokémon's image, name and Type, under the search field (nothing while none is chosen)
  const preview = pokemonId === null ? undefined : <PokemonPreview state={state} onRetry={retry} />

  return (
    <div className="create-page">
      {/* With the Pokémon's name once it's loaded: "Create card with Pikachu" */}
      <title>
        {getPageTitle(
          state.status === 'ready' ? `Create card with ${formatPokemonName(state.details.name)}` : 'Create card',
        )}
      </title>
      <h1 className="page-title">Create your card</h1>

      {/* A valid number, but the API has no such Pokémon (e.g. /create/99999) */}
      {state.status === 'not-found' ? (
        <div className="status">
          <p>Pokémon not found</p>
          <Link to="/pokemon" className="button">
            Back to the list
          </Link>
        </div>
      ) : session.card === null ? (
        // key: a new formKey (a link or Back changed the URL) gives a brand-new, empty form
        <CardForm
          key={session.formKey}
          initialValues={session.editValues}
          pokemon={chosenPokemon}
          onPokemonSelect={handlePokemonSelect}
          pokemonPreview={preview}
          pokemonInputRef={pokemonInputRef}
          onSubmit={handleSubmit}
        />
      ) : state.status !== 'ready' ? (
        // The card waits for its Pokémon (rare: "Create my card" right after picking, before it loaded)
        preview
      ) : (
        <>
          <div className="favorite-field">
            <PokemonPicker
              label="Your favorite Pokémon"
              selected={session.isRetyping ? null : chosenPokemon}
              onSelect={handleCardPokemonSelect}
              error={undefined}
              // Left without a new pick → the field shows the card's Pokémon again
              onBlur={() => setSession((current) => ({ ...current, isRetyping: false }))}
            />
            {preview}
          </div>

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
              <>
                <SavedNotice cardNumber={session.savedNumber} />
                {/* Only after saving, so the PNG always has its card number */}
                <DownloadPngButton
                  fileName={getPngFileName(session.card.name, state.details.name, session.savedNumber)}
                />
              </>
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
        </>
      )}
    </div>
  )
}
