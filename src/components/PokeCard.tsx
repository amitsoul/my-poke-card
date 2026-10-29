// The personal card in the "Classic" design (CARD_SPEC.md "Card design"), every field in the "Layout" order.
// All sizes are design pixels × --u (CSS), so the card shrinks as one piece on narrow screens.
// The photo fills the window, with the Pokémon as a sticker on top.
// It draws from plain data (CardPokemon + CardData + the card info), so the same component works on the
// Create page (data from the API) and in My Cards (data from a saved card).
import { useEffect, useId, useRef, type CSSProperties, type ReactNode } from 'react'
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import type { CardPokemon } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'
import { formatCardNumber } from '../utils/savedCards.ts'
import type { StickerPosition } from '../utils/sticker.ts'
import { formatDexNumber, formatHeight, formatWeight, getCardRules } from '../utils/cardRules.ts'
import { getNameFontSize, TYPE_THEME } from '../utils/cardTheme.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import { toTitleCase } from '../utils/text.ts'
import AttacksBlock from './AttacksBlock.tsx'
import CardSticker from './CardSticker.tsx'
import TypeSymbol from './TypeSymbol.tsx'
import WeaknessRow from './WeaknessRow.tsx'

interface PokeCardProps {
  card: CardData // the user's answers, photo and sticker position
  pokemon: CardPokemon // the chosen Pokémon
  cardInfo: PokemonCardInfoState // genus + attacks (may still be loading, or have failed)
  onRetryCardInfo: () => void
  onStickerMove?: (position: StickerPosition) => void // only on a created, not yet saved card: then the sticker can move
  cardNumber?: number // once saved: shown as "MPC 003" at the bottom right
  children?: ReactNode // the buttons under the card (Save / Edit on the Create page)
  heading?: string // default "Your card"; My Cards uses e.g. "MPC 001 · Amit's Pikachu"
  focusOnMount?: boolean // default true; false in My Cards, where many cards appear at once
  photoAlt?: string // default "Your photo"; the landing page's example cards describe their illustration
}

export const CARD_DESIGNER = 'Amit Soul'

export default function PokeCard({
  card,
  pokemon,
  cardInfo,
  onRetryCardInfo,
  onStickerMove,
  cardNumber,
  children,
  heading = 'Your card',
  focusOnMount = true,
  photoAlt = 'Your photo',
}: PokeCardProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const headingId = useId() // unique, because My Cards shows many cards on one page

  // When the card appears (Create page): move focus to its heading, so keyboard and screen-reader users know it worked
  useEffect(() => {
    if (focusOnMount) headingRef.current?.focus()
  }, [focusOnMount])

  const pokemonName = formatPokemonName(pokemon.name)
  // The user's name in Title Case, like the Ability ("amit" → "Amit's Ivysaur"); the stored value stays as typed
  const cardName = `${toTitleCase(card.name)}'s ${pokemonName}`
  const rules = getCardRules(pokemon.gameTypes, pokemon.weight)
  const theme = TYPE_THEME[rules.cardType]
  const genus = cardInfo.status === 'ready' ? cardInfo.info.genus : null
  // "NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs" — the genus is left out while loading or when there is none
  const dexStrip = [formatDexNumber(pokemon.id), genus, `HT ${formatHeight(pokemon.height)}`, `WT ${formatWeight(pokemon.weight)}`]
    .filter((part) => part !== null)
    .join(' · ')
  // The Type's colors, as CSS variables for the panel and the strip
  const typeColors = { '--type-tint': theme.tint, '--type-strip': theme.stripTint } as CSSProperties

  return (
    <article className="poke-card" aria-labelledby={headingId}>
      <h2 id={headingId} tabIndex={-1} ref={headingRef}>
        {heading}
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
              <img className="poke-card-photo" src={card.photo.dataUrl} alt={photoAlt} />
              <CardSticker
                src={pokemon.artworkUrl}
                pokemonName={pokemonName}
                position={card.stickerPosition}
                onMove={onStickerMove}
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
              {/* The card number once the card is saved ("MPC 003"); empty before */}
              <span className="poke-card-number">{cardNumber === undefined ? '' : formatCardNumber(cardNumber)}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Only where the sticker can move. Outside the card frame, so it's not part of the card (or the PNG). */}
      {onStickerMove !== undefined && (
        <p className="sticker-tip">Tip: drag the Pokémon sticker to place it on your photo.</p>
      )}

      {children !== undefined && <div className="card-actions">{children}</div>}
    </article>
  )
}
