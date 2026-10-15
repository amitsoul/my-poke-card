// The personal card in the "Classic" design (CARD_SPEC.md "Card design"), every field in the "Layout" order.
// All sizes are design pixels × --u (CSS), so the card shrinks as one piece on narrow screens.
// The photo fills the window, with the Pokémon as a sticker on top (moving it: step 10d).
// The card number (MPC 001) comes in task 11.
import { useEffect, useRef, type CSSProperties } from 'react'
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'
import { formatDexNumber, formatHeight, formatWeight, getCardRules } from '../utils/cardRules.ts'
import { getNameFontSize, TYPE_THEME } from '../utils/cardTheme.ts'
import { formatPokemonName, getDetailsImage, getGameTypes } from '../utils/pokemonDetails.ts'
import { toTitleCase } from '../utils/text.ts'
import AttacksBlock from './AttacksBlock.tsx'
import TypeSymbol from './TypeSymbol.tsx'
import WeaknessRow from './WeaknessRow.tsx'

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
  // The user's name in Title Case, like the Ability ("amit" → "Amit's Ivysaur"); the stored value stays as typed
  const cardName = `${toTitleCase(card.name)}'s ${pokemonName}`
  const rules = getCardRules(getGameTypes(details), details.weight)
  const theme = TYPE_THEME[rules.cardType]
  const genus = cardInfo.status === 'ready' ? cardInfo.info.genus : null
  // "NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs" — the genus is left out while loading or when there is none
  const dexStrip = [formatDexNumber(details.id), genus, `HT ${formatHeight(details.height)}`, `WT ${formatWeight(details.weight)}`]
    .filter((part) => part !== null)
    .join(' · ')
  // The Type's colors, as CSS variables for the panel and the strip
  const typeColors = { '--type-tint': theme.tint, '--type-strip': theme.stripTint } as CSSProperties

  return (
    <article className="poke-card" aria-labelledby="poke-card-heading">
      <h2 id="poke-card-heading" tabIndex={-1} ref={headingRef}>
        Your card
      </h2>

      {/* The container: its width decides --u (1 design pixel) for everything inside */}
      <div className="poke-card-container">
        <div className="poke-card-frame" style={typeColors}>
          <div className="poke-card-panel">
            <div className="poke-card-header">
              <span className="poke-card-stage">BASIC</span>
              {/* Long names get smaller (and may wrap to 2 lines), so HP and the symbol always fit */}
              <p className="poke-card-name" style={{ fontSize: `calc(${getNameFontSize(cardName)} * var(--u))` }}>
                {cardName}
              </p>
              <p className="poke-card-hp">
                <span className="poke-card-hp-label">HP</span> <span className="poke-card-hp-value">{card.age}</span>
              </p>
              <span className="poke-card-type">
                <TypeSymbol type={rules.cardType} />
              </span>
            </div>

            {/* The photo fills the window (cropped to fit); the sticker sits on top, at its position in % */}
            <div className="poke-card-window">
              <img className="poke-card-photo" src={card.photo.dataUrl} alt="Your photo" />
              {/* crossOrigin: lets the PNG export (task 11) read this image from GitHub's image server */}
              <img
                className="poke-card-sticker"
                src={getDetailsImage(details)}
                alt={pokemonName}
                crossOrigin="anonymous"
                draggable={false}
                style={{ left: `${card.stickerPosition.x}%`, top: `${card.stickerPosition.y}%` }}
              />
            </div>

            <p className="poke-card-dex">{dexStrip}</p>

            <p className="poke-card-ability">
              <span className="poke-card-ability-label">Ability</span>{' '}
              {/* Shown in Title Case like the attack names; the stored value stays as typed */}
              <span className="poke-card-ability-text">{toTitleCase(card.superpower)}</span>
            </p>

            <div className="poke-card-attacks">
              <AttacksBlock cardInfo={cardInfo} onRetry={onRetryCardInfo} />
            </div>

            <WeaknessRow weakness={rules.weakness} resistance={rules.resistance} retreat={rules.retreat} />

            <p className="poke-card-flavor">"{card.aboutYou}"</p>

            <p className="poke-card-bottom">
              <span>Card design: {CARD_DESIGNER} · Fan-made · Not an official Pokémon card</span>
              {/* Room for the card number "MPC 001" (task 11) */}
              <span className="poke-card-number" />
            </p>
          </div>
        </div>
      </div>

      <button type="button" className="button" onClick={onEdit}>
        Edit
      </button>
    </article>
  )
}
