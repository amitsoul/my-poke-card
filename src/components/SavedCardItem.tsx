// One saved card in My Cards: the card (drawn from the saved snapshot, sticker fixed) + heart and Delete.
import { useRef, useState } from 'react'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import { formatCardNumber, type SavedCard } from '../utils/savedCards.ts'
import { toTitleCase } from '../utils/text.ts'
import FavoriteButton from './FavoriteButton.tsx'
import InlineConfirm from './InlineConfirm.tsx'
import PokeCard from './PokeCard.tsx'

interface SavedCardItemProps {
  saved: SavedCard
  onToggleFavorite: (number: number) => void
  onDelete: (number: number) => void // called after the user confirmed
}

// A saved card never needs the API: its genus and attacks were saved with it, so there is nothing to retry
function noRetry() {}

export default function SavedCardItem({ saved, onToggleFavorite, onDelete }: SavedCardItemProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const number = formatCardNumber(saved.number)
  const title = `${number} · ${toTitleCase(saved.card.name)}'s ${formatPokemonName(saved.pokemon.name)}`

  function handleKeepIt() {
    setIsConfirmingDelete(false)
    deleteButtonRef.current?.focus()
  }

  return (
    <PokeCard
      card={saved.card}
      pokemon={saved.pokemon}
      cardInfo={{ status: 'ready', info: saved.info }}
      onRetryCardInfo={noRetry}
      cardNumber={saved.number}
      heading={title}
      focusOnMount={false}
    >
      <FavoriteButton
        cardNumber={saved.number}
        favorite={saved.favorite}
        onToggle={() => onToggleFavorite(saved.number)}
      />
      <button
        type="button"
        className="button button-secondary"
        ref={deleteButtonRef}
        onClick={() => setIsConfirmingDelete(true)}
      >
        Delete
      </button>
      {isConfirmingDelete && (
        <InlineConfirm
          message={`Delete ${number}? This can't be undone.`}
          confirmLabel="Yes, delete"
          cancelLabel="Keep it"
          onConfirm={() => onDelete(saved.number)}
          onCancel={handleKeepIt}
        />
      )}
    </PokeCard>
  )
}
