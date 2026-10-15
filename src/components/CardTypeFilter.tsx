// Row of card type buttons: "All" + the 10 card types. The selected card type lives in the URL (?type=),
// read by PokemonListPage and passed in via props.
import type { CardType } from '../types/pokemon.ts'
import { CARD_TYPES } from '../utils/cardType.ts'

interface CardTypeFilterProps {
  selectedCardType: CardType | null // null = All
  onChange: (cardType: CardType | null) => void
}

export default function CardTypeFilter({ selectedCardType, onChange }: CardTypeFilterProps) {
  return (
    <div className="card-type-filter" role="group" aria-label="Filter by type">
      <button
        type="button"
        className={selectedCardType === null ? 'card-type-button selected' : 'card-type-button'}
        aria-pressed={selectedCardType === null}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {CARD_TYPES.map((cardType) => (
        <button
          key={cardType.name}
          type="button"
          className={selectedCardType === cardType.name ? 'card-type-button selected' : 'card-type-button'}
          aria-pressed={selectedCardType === cardType.name}
          onClick={() => onChange(cardType.name)}
        >
          {cardType.name}
        </button>
      ))}
    </div>
  )
}
