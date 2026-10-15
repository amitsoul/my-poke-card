// Weakness · Resistance · Retreat as a description list (term + value), with Type symbols.
// Shared by the card and the details page. Screen readers read e.g. "Weakness, Fighting ×2".
import type { CardType } from '../types/pokemon.ts'
import { RESISTANCE_AMOUNT, WEAKNESS_MULTIPLIER } from '../utils/cardRules.ts'
import TypeSymbol from './TypeSymbol.tsx'

interface WeaknessRowProps {
  weakness: CardType | null
  resistance: CardType | null
  retreat: number // how many Colorless symbols
}

export default function WeaknessRow({ weakness, resistance, retreat }: WeaknessRowProps) {
  const retreatSymbols = Array<CardType>(retreat).fill('Colorless')

  return (
    <dl className="weakness-row">
      <div>
        <dt>Weakness</dt>
        <dd>
          {weakness === null ? (
            'none'
          ) : (
            <>
              <TypeSymbol type={weakness} /> ×{WEAKNESS_MULTIPLIER}
            </>
          )}
        </dd>
      </div>
      <div>
        <dt>Resistance</dt>
        <dd>
          {resistance === null ? (
            'none'
          ) : (
            <>
              <TypeSymbol type={resistance} /> −{RESISTANCE_AMOUNT}
            </>
          )}
        </dd>
      </div>
      <div>
        <dt>Retreat</dt>
        <dd>
          {/* The symbols together are ONE image for screen readers: "Colorless, Colorless" */}
          <span className="retreat-cost" role="img" aria-label={retreatSymbols.join(', ')}>
            {retreatSymbols.map((type, index) => (
              <TypeSymbol key={`${index}-${type}`} type={type} decorative />
            ))}
          </span>
        </dd>
      </div>
    </dl>
  )
}
