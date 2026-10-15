// The personal card, every field in the CARD_SPEC.md "Layout" order, as plain text for now.
// The design (frame, colors, Type symbols) comes in task 10; the card number (MPC 001) in task 11.
import { useEffect, useRef } from 'react'
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'
import { formatDexNumber, formatHeight, formatWeaknessLine, formatWeight, getCardRules } from '../utils/cardRules.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'
import AttacksBlock from './AttacksBlock.tsx'

interface PokeCardProps {
  card: CardData // the user's answers and photo
  details: PokemonDetailsResponse // the chosen Pokémon
  cardInfo: PokemonCardInfoState // genus + attacks (may still be loading, or have failed)
  onRetryCardInfo: () => void
  onEdit: () => void
}

export const CARD_DESIGNER = 'Amit Soul'

export default function PokeCard({ card, details, cardInfo, onRetryCardInfo, onEdit }: PokeCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Once, when the card appears: move focus to its heading, so keyboard and screen-reader users know it worked
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const pokemonName = formatPokemonName(details.name)
  const rules = getCardRules(getGameTypes(details), details.weight)
  const genus = cardInfo.status === 'ready' ? cardInfo.info.genus : null
  // "NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs" — the genus is left out while loading or when there is none
  const dexStrip = [formatDexNumber(details.id), genus, `HT ${formatHeight(details.height)}`, `WT ${formatWeight(details.weight)}`]
    .filter((part) => part !== null)
    .join(' · ')

  return (
    <article className="poke-card" aria-labelledby="poke-card-heading">
      <h2 id="poke-card-heading" tabIndex={-1} ref={headingRef}>
        Your card
      </h2>

      <p className="poke-card-top">
        BASIC · {card.name}'s {pokemonName} · HP {card.age} · {rules.cardType}
      </p>

      <div className="poke-card-illustration">
        <img src={card.photo.dataUrl} alt="Your photo" />
        <img src={getDetailsImage(details)} alt={pokemonName} />
      </div>

      <p className="poke-card-dex">{dexStrip}</p>
      <p>Ability: {card.superpower}</p>

      <AttacksBlock cardInfo={cardInfo} onRetry={onRetryCardInfo} />

      <p className="weakness-line">{formatWeaknessLine(rules.weakness, rules.resistance, rules.retreat)}</p>
      <p className="poke-card-flavor">"{card.aboutYou}"</p>
      <p className="poke-card-bottom">Card design: {CARD_DESIGNER} · Fan-made · Not an official Pokémon card</p>

      <button type="button" className="button" onClick={onEdit}>
        Edit
      </button>
    </article>
  )
}
