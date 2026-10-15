import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { PokemonCardInfoState } from '../hooks/usePokemonCardInfo.ts'
import { getAttackRows, getWeaknessValue } from '../test/cardQueries.ts'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'
import { TYPE_THEME } from '../utils/cardTheme.ts'
import { DEFAULT_STICKER_POSITION } from '../utils/sticker.ts'
import PokeCard from './PokeCard.tsx'

const card: CardData = {
  name: 'Amit',
  age: 30,
  superpower: 'Super speed',
  aboutYou: 'I love Pokémon cards!',
  photo: { dataUrl: 'data:image/jpeg;base64,AAAA', type: 'image/jpeg', size: 3 },
  stickerPosition: DEFAULT_STICKER_POSITION,
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

function renderCard(
  cardInfo: PokemonCardInfoState,
  options: { details?: PokemonDetailsResponse; cardData?: CardData } = {},
) {
  const handlers = { onRetryCardInfo: vi.fn(), onEdit: vi.fn() }
  const { container } = render(
    <PokeCard card={options.cardData ?? card} details={options.details ?? pikachuDetails} cardInfo={cardInfo} {...handlers} />,
  )
  return { ...handlers, container, cardElement: screen.getByRole('article', { name: 'Your card' }) }
}

// One element per part of the card, by its class (only to check their order)
function part(container: HTMLElement, className: string): Element {
  const element = container.querySelector(`.${className}`)
  if (element === null) throw new Error(`No .${className}`)
  return element
}

describe('PokeCard', () => {
  it('has every part in the CARD_SPEC "Layout" order', () => {
    const { container } = renderCard(readyInfo)
    const partsInOrder = [
      'poke-card-header',
      'poke-card-window',
      'poke-card-dex',
      'poke-card-ability',
      'attack-list',
      'weakness-row',
      'poke-card-flavor',
      'poke-card-bottom',
    ].map((className) => part(container, className))

    for (let index = 1; index < partsInOrder.length; index += 1) {
      const followsPrevious = partsInOrder[index - 1].compareDocumentPosition(partsInOrder[index]) & Node.DOCUMENT_POSITION_FOLLOWING
      expect(followsPrevious, `part ${index} should come after part ${index - 1}`).toBeTruthy()
    }
  })

  it('header: BASIC, the name, HP and the Type symbol', () => {
    const { container } = renderCard(readyInfo)
    const header = part(container, 'poke-card-header') as HTMLElement

    expect(within(header).getByText('BASIC')).toBeInTheDocument()
    expect(within(header).getByText("Amit's Pikachu")).toBeInTheDocument()
    expect(header).toHaveTextContent('HP 30')
    expect(within(header).getByRole('img', { name: 'Lightning' })).toBeInTheDocument()
  })

  it('the Pokédex strip, Ability, flavor text and bottom line', () => {
    const { cardElement } = renderCard(readyInfo)

    expect(within(cardElement).getByText(`NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs`)).toBeInTheDocument()
    expect(within(cardElement).getByText('Ability')).toBeInTheDocument()
    expect(within(cardElement).getByText('Super Speed')).toBeInTheDocument() // typed "Super speed", shown in Title Case
    expect(within(cardElement).getByText('"I love Pokémon cards!"')).toBeInTheDocument() // About you: exactly as typed
    expect(
      within(cardElement).getByText('Card design: Amit Soul · Fan-made · Not an official Pokémon card'),
    ).toBeInTheDocument()
  })

  it('attacks as rows with cost symbols, and Weakness / Resistance / Retreat', () => {
    const { cardElement } = renderCard(readyInfo)

    expect(getAttackRows(cardElement)).toEqual([
      'Cost: Lightning, Colorless | Thunder Shock | 40',
      'Cost: Lightning, Colorless | Quick Attack | 40',
    ])
    expect(getWeaknessValue(cardElement, 'Weakness')).toBe('Fighting ×2')
    expect(getWeaknessValue(cardElement, 'Resistance')).toBe('none')
    expect(getWeaknessValue(cardElement, 'Retreat')).toBe('Colorless')
  })

  it("uses the Type's tints for the panel and the strip", () => {
    const { container } = renderCard(readyInfo)
    const frame = part(container, 'poke-card-frame') as HTMLElement

    expect(frame.style.getPropertyValue('--type-tint')).toBe(TYPE_THEME.Lightning.tint)
    expect(frame.style.getPropertyValue('--type-strip')).toBe(TYPE_THEME.Lightning.stripTint)
  })

  it('the photo fills the window, and the artwork sits on top as a sticker (readable by the PNG export)', () => {
    const { container, cardElement } = renderCard(readyInfo)
    const window = part(container, 'poke-card-window') as HTMLElement
    const photo = within(cardElement).getByRole('img', { name: 'Your photo' })
    const sticker = within(cardElement).getByRole('img', { name: 'Pikachu' })

    expect(photo).toHaveAttribute('src', card.photo.dataUrl)
    expect(photo).toHaveClass('poke-card-photo')
    // Both in the window; the sticker comes after the photo, so it is drawn on top
    expect(window).toContainElement(photo)
    expect(window).toContainElement(sticker)
    expect(photo.compareDocumentPosition(sticker) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(sticker).toHaveClass('poke-card-sticker')
    expect(sticker).toHaveAttribute('crossorigin', 'anonymous')
    expect(sticker).toHaveAttribute('draggable', 'false') // the browser's own "drag this image" is off
  })

  it('places the sticker at the stored position (in % of the window)', () => {
    renderCard(readyInfo, { cardData: { ...card, stickerPosition: { x: 12.5, y: 40 } } })
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveStyle({ left: '12.5%', top: '40%' })
  })

  it('starts the sticker at the bottom right by default', () => {
    renderCard(readyInfo)
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveStyle({
      left: `${DEFAULT_STICKER_POSITION.x}%`,
      top: `${DEFAULT_STICKER_POSITION.y}%`,
    })
  })

  it("shows the user's name in Title Case (\"amit\" → \"Amit's Pikachu\"), like the Ability", () => {
    renderCard(readyInfo, { cardData: { ...card, name: 'amit' } })
    expect(screen.getByText("Amit's Pikachu")).toBeInTheDocument()
  })

  it('a normal name keeps 23 design px', () => {
    renderCard(readyInfo)
    expect(screen.getByText("Amit's Pikachu")).toHaveStyle({ fontSize: 'calc(23 * var(--u))' })
  })

  it('a very long name (41 characters) gets 14 design px, and HP and the Type symbol are still in the header', () => {
    const squawkabilly: PokemonDetailsResponse = { ...pikachuDetails, id: 931, name: 'squawkabilly-green-plumage' }
    const { container } = renderCard(readyInfo, { details: squawkabilly, cardData: { ...card, name: 'Bartholomewz' } })
    const header = part(container, 'poke-card-header') as HTMLElement

    expect(within(header).getByText("Bartholomewz's Squawkabilly-Green-Plumage")).toHaveStyle({
      fontSize: 'calc(14 * var(--u))',
    })
    expect(header).toHaveTextContent('HP 30')
    expect(within(header).getByRole('img', { name: 'Lightning' })).toBeInTheDocument()
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
