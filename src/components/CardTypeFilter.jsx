// Row of card type buttons: "All" + the 10 card types. The selected card type lives in App.
import { CARD_TYPES } from '../utils/cardType.js'

export default function CardTypeFilter({ selectedCardType, onChange }) {
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
