// The heart on a saved card: a toggle button. Red = favorite, gray = not.
// Screen readers hear its name ("Favorite MPC 001") and whether it is pressed.
import { formatCardNumber } from '../utils/savedCards.ts'

interface FavoriteButtonProps {
  cardNumber: number
  favorite: boolean
  onToggle: () => void
}

export default function FavoriteButton({ cardNumber, favorite, onToggle }: FavoriteButtonProps) {
  return (
    <button
      type="button"
      className={favorite ? 'favorite-button is-favorite' : 'favorite-button'}
      aria-pressed={favorite}
      aria-label={`Favorite ${formatCardNumber(cardNumber)}`}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
        <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.2 3 4.5 6.6 4.5c2.1 0 3.6 1.2 4.4 2.6.8-1.4 2.3-2.6 4.4-2.6 3.6 0 5.7 3.7 4.2 7.2C19.5 16.4 12 21 12 21z" />
      </svg>
    </button>
  )
}
