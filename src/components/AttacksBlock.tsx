// The attacks with their own loading and error states — shared by the details page and the card.
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import AttackList from './AttackList.tsx'

interface AttacksBlockProps {
  cardInfo: PokemonCardInfoState
  onRetry: () => void
}

export default function AttacksBlock({ cardInfo, onRetry }: AttacksBlockProps) {
  return (
    <>
      {/* Always on the page, so screen readers announce "Loading attacks..." reliably */}
      <p role="status" className="attacks-status">
        {cardInfo.status === 'loading' ? 'Loading attacks...' : ''}
      </p>
      {cardInfo.status === 'error' && (
        <div className="attacks-error">
          <p>Oops! We couldn't load the attacks. Please check your internet connection.</p>
          <button type="button" className="button" onClick={onRetry}>
            Try again
          </button>
        </div>
      )}
      {cardInfo.status === 'ready' && <AttackList attacks={cardInfo.info.attacks} />}
    </>
  )
}
