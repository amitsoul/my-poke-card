// The My Cards page, with cards saved in the test browser's real localStorage
// (src/test/setup.ts empties it after every test).
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { newPikachuCard } from '../test/cardFixtures.ts'
import { CARDS_KEY, loadSavedCards, saveCard, setFavorite } from '../utils/savedCards.ts'
import MyCardsPage from './MyCardsPage.tsx'

// Save `count` Pikachu cards (MPC 001, 002, …); the numbers in `favorites` become favorites
function seedCards(count: number, favorites: number[] = []) {
  for (let index = 0; index < count; index += 1) saveCard(newPikachuCard)
  for (const number of favorites) setFavorite(number, true)
}

// Shows the current URL's "?…" part, so a test can check what the page put in the URL
function UrlSearch() {
  return <p data-testid="url-search">{useLocation().search}</p>
}

function renderPage(path = '/my-cards') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="/my-cards"
          element={
            <>
              <MyCardsPage />
              <UrlSearch />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

// The card headings in the grid, in order ("MPC 002 · Amit's Pikachu", …)
function cardHeadings(): string[] {
  return screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent ?? '')
}

describe('MyCardsPage', () => {
  it('without saved cards: the empty state with a link to create one', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'My Cards' })).toBeInTheDocument()
    expect(screen.getByText("You haven't saved any cards yet.")).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create your first card' })).toHaveAttribute('href', '/create')
  })

  it('the tab title is "My Cards · My Poke Card"', () => {
    renderPage()
    expect(document.title).toBe('My Cards · My Poke Card')
  })

  it('shows the saved cards, newest first, each with its number; the sticker is fixed and there is no tip', () => {
    seedCards(2)
    renderPage()

    expect(cardHeadings()).toEqual(["MPC 002 · Amit's Pikachu", "MPC 001 · Amit's Pikachu"])
    const newest = screen.getByRole('article', { name: "MPC 002 · Amit's Pikachu" })
    expect(within(newest).getByText('MPC 002')).toBeInTheDocument() // the number on the card itself
    expect(within(newest).getByRole('img', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /sticker/ })).toBeNull()
    expect(screen.queryByText(/Tip: drag/)).toBeNull()
    // Every card has its own Download PNG button
    expect(within(newest).getByRole('button', { name: 'Download PNG' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Download PNG' })).toHaveLength(2)
  })

  it('no card grabs the focus when the page opens', () => {
    seedCards(2)
    renderPage()
    expect(document.body).toHaveFocus()
  })

  it('the heart marks a favorite (pressed, saved) and updates the count', async () => {
    seedCards(1)
    const user = renderPage()
    const heart = screen.getByRole('button', { name: 'Favorite MPC 001' })
    expect(heart).toHaveAttribute('aria-pressed', 'false')

    await user.click(heart)

    expect(screen.getByRole('button', { name: 'Favorite MPC 001' })).toHaveAttribute('aria-pressed', 'true')
    expect(loadSavedCards().cards[0].favorite).toBe(true)
    expect(screen.getByRole('button', { name: 'Favorites (1)' })).toBeInTheDocument()
  })

  it('"Favorites" shows only favorites and puts ?show=favorites in the URL; "All" removes it', async () => {
    seedCards(3, [2])
    const user = renderPage()
    expect(screen.getByRole('button', { name: 'All (3)' })).toHaveAttribute('aria-pressed', 'true')

    await user.click(screen.getByRole('button', { name: 'Favorites (1)' }))

    expect(screen.getByTestId('url-search')).toHaveTextContent('?show=favorites')
    expect(screen.getByRole('button', { name: 'Favorites (1)' })).toHaveAttribute('aria-pressed', 'true')
    expect(cardHeadings()).toEqual(["MPC 002 · Amit's Pikachu"])

    await user.click(screen.getByRole('button', { name: 'All (3)' }))
    expect(screen.getByTestId('url-search')).toBeEmptyDOMElement()
    expect(cardHeadings()).toHaveLength(3)
  })

  it('opening /my-cards?show=favorites directly shows only favorites', () => {
    seedCards(2, [1])
    renderPage('/my-cards?show=favorites')
    expect(cardHeadings()).toEqual(["MPC 001 · Amit's Pikachu"])
  })

  it('an unknown ?show= value shows all cards', () => {
    seedCards(2, [1])
    renderPage('/my-cards?show=banana')
    expect(screen.getByRole('button', { name: 'All (2)' })).toHaveAttribute('aria-pressed', 'true')
    expect(cardHeadings()).toHaveLength(2)
  })

  it('no favorites yet: the friendly empty text', () => {
    seedCards(1)
    renderPage('/my-cards?show=favorites')
    expect(screen.getByText('No favorites yet. Tap ❤️ on a card to add it.')).toBeInTheDocument()
  })

  it('Delete asks first; "Keep it" keeps the card and returns focus to Delete', async () => {
    seedCards(2)
    const user = renderPage()
    const card = screen.getByRole('article', { name: "MPC 002 · Amit's Pikachu" })

    await user.click(within(card).getByRole('button', { name: 'Delete' }))
    expect(within(card).getByRole('alert')).toHaveTextContent("Delete MPC 002? This can't be undone.")
    expect(within(card).getByRole('button', { name: 'Keep it' })).toHaveFocus()

    await user.click(within(card).getByRole('button', { name: 'Keep it' }))
    expect(within(card).queryByRole('alert')).toBeNull()
    expect(within(card).getByRole('button', { name: 'Delete' })).toHaveFocus()
    expect(cardHeadings()).toHaveLength(2)
  })

  it('"Yes, delete" removes the card, moves focus to the heading, and the number is never reused', async () => {
    seedCards(3)
    const user = renderPage()
    const card = screen.getByRole('article', { name: "MPC 002 · Amit's Pikachu" })

    await user.click(within(card).getByRole('button', { name: 'Delete' }))
    await user.click(within(card).getByRole('button', { name: 'Yes, delete' }))

    expect(cardHeadings()).toEqual(["MPC 003 · Amit's Pikachu", "MPC 001 · Amit's Pikachu"])
    expect(screen.getByRole('heading', { level: 1, name: 'My Cards' })).toHaveFocus()
    expect(loadSavedCards().cards.map((saved) => saved.number)).toEqual([3, 1])
    const next = saveCard(newPikachuCard)
    expect(next.ok && next.saved.number).toBe(4)
  })

  it('shows a note for a saved card that could not be read', () => {
    seedCards(2)
    const stored = JSON.parse(window.localStorage.getItem(CARDS_KEY) ?? '') as { version: number; cards: unknown[] }
    stored.cards.push({ number: 9, broken: true })
    window.localStorage.setItem(CARDS_KEY, JSON.stringify(stored))

    renderPage()

    expect(screen.getByText("1 saved card couldn't be read and is hidden.")).toBeInTheDocument()
    expect(cardHeadings()).toHaveLength(2)
  })

  it('shows a note when the saved cards cannot be read at all', () => {
    window.localStorage.setItem(CARDS_KEY, '{ broken')
    renderPage()
    expect(screen.getByText("Your saved cards couldn't be read.")).toBeInTheDocument()
    expect(screen.queryByText("You haven't saved any cards yet.")).toBeNull()
  })

  it('a heart click that cannot be saved changes nothing and says so', async () => {
    seedCards(1)
    const user = renderPage()
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    try {
      await user.click(screen.getByRole('button', { name: 'Favorite MPC 001' }))
    } finally {
      setItem.mockRestore()
    }

    expect(screen.getByRole('alert')).toHaveTextContent("That change couldn't be saved.")
    expect(screen.getByRole('button', { name: 'Favorite MPC 001' })).toHaveAttribute('aria-pressed', 'false')
    expect(loadSavedCards().cards[0].favorite).toBe(false)
  })
})
