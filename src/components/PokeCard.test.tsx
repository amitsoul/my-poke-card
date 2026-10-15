import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import type { CardData } from '../utils/cardForm.ts'
import PokeCard from './PokeCard.tsx'

const card: CardData = {
  name: 'Amit',
  age: 30,
  superpower: 'Super speed',
  aboutYou: 'I love Pokémon cards!',
  photo: { dataUrl: 'data:image/jpeg;base64,AAAA', type: 'image/jpeg', size: 3 },
}

const readyInfo: PokemonCardInfoState = {
  status: 'ready',
  info: {
    genus: 'Mouse Pokémon',
    attacks: [
      { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
      { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
    ],
  },
}

function renderCard(cardInfo: PokemonCardInfoState, handlers = { onRetryCardInfo: vi.fn(), onEdit: vi.fn() }) {
  render(<PokeCard card={card} details={pikachuDetails} cardInfo={cardInfo} {...handlers} />)
  return handlers
}

// The CARD_SPEC "Layout" order, top to bottom
const LINES_IN_ORDER = [
  'Your card',
  "BASIC · Amit's Pikachu · HP 30 · Lightning",
  `NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs`,
  'Ability: Super speed',
  'Thunder Shock — 40 · Cost: Lightning, Colorless',
  'Quick Attack — 40 · Cost: Lightning, Colorless',
  'Weakness: Fighting ×2 · Resistance: none · Retreat: 1',
  '"I love Pokémon cards!"',
  'Card design: Amit Soul · Fan-made · Not an official Pokémon card',
]

describe('PokeCard', () => {
  it('shows every field, in the CARD_SPEC order', () => {
    renderCard(readyInfo)
    const text = screen.getByRole('article', { name: 'Your card' }).textContent ?? ''

    let lastIndex = -1
    for (const line of LINES_IN_ORDER) {
      const index = text.indexOf(line)
      expect(index, `"${line}" should come after the line before it`).toBeGreaterThan(lastIndex)
      lastIndex = index
    }
  })

  it('shows the user photo and the Pokémon artwork', () => {
    renderCard(readyInfo)
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', card.photo.dataUrl)
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute(
      'src',
      pikachuDetails.sprites.other['official-artwork'].front_default,
    )
  })

  it('moves focus to the "Your card" heading when it appears', () => {
    renderCard(readyInfo)
    expect(screen.getByRole('heading', { name: 'Your card' })).toHaveFocus()
  })

  it('while the attacks load: "Loading attacks..." and the strip without the genus', () => {
    renderCard({ status: 'loading' })
    expect(screen.getByRole('status')).toHaveTextContent('Loading attacks...')
    expect(screen.getByText(`NO. 0025 · HT 1'04" · WT 13.2 lbs`)).toBeInTheDocument()
  })

  it('leaves out the genus when there is no English genus', () => {
    renderCard({ status: 'ready', info: { genus: null, attacks: [] } })
    expect(screen.getByText(`NO. 0025 · HT 1'04" · WT 13.2 lbs`)).toBeInTheDocument()
  })

  it('if the attacks failed: the error and "Try again" inside the card', async () => {
    const user = userEvent.setup()
    const { onRetryCardInfo } = renderCard({ status: 'error' })

    expect(screen.getByText("Oops! We couldn't load the attacks. Please check your internet connection.")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    expect(onRetryCardInfo).toHaveBeenCalledTimes(1)
  })

  it('"Edit" calls onEdit', async () => {
    const user = userEvent.setup()
    const { onEdit } = renderCard(readyInfo)
    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})
