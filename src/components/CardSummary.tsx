// A short summary of the answers after "Create my card". The real card replaces it in tasks 9–10.
import { useEffect, useRef } from 'react'
import type { CardType } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'

interface CardSummaryProps {
  card: CardData
  pokemonName: string // already formatted, e.g. "Pikachu"
  cardType: CardType
  onEdit: () => void
}

export default function CardSummary({ card, pokemonName, cardType, onEdit }: CardSummaryProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Once, when the summary appears: move focus to its heading, so keyboard and screen-reader users know it worked
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section className="card-summary">
      <h2 tabIndex={-1} ref={headingRef}>
        Your card
      </h2>
      <img src={card.photo.dataUrl} alt="Your photo" className="photo-preview" />
      <p className="card-summary-title">
        {card.name}'s {pokemonName} · HP {card.age} · {cardType}
      </p>
      <p>Ability: {card.superpower}</p>
      <p>"{card.aboutYou}"</p>
      <p className="card-summary-note">The full card design comes next.</p>
      <button type="button" className="button" onClick={onEdit}>
        Edit
      </button>
    </section>
  )
}
