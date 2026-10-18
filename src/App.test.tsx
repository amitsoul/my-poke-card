// The whole app layout: nav, page and footer together. Only pages that need no API are opened here.
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import App from './App.tsx'
import { newPikachuCard } from './test/cardFixtures.ts'
import { saveCard } from './utils/savedCards.ts'

function renderApp(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App layout', () => {
  it('shows the site footer on the 404 page, after the page content', () => {
    renderApp('/abc')

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Fan-made · Not an official Pokémon card')
    // The footer comes after <main> in the page
    const main = screen.getByRole('main')
    expect(main.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('"/" is the landing page: its headline, the app name as the tab title, and the two ways in', () => {
    renderApp('/')

    expect(screen.getByRole('heading', { level: 1, name: 'Turn yourself into a Pokémon card' })).toBeInTheDocument()
    expect(document.title).toBe('My Poké Card')
    expect(screen.getByRole('link', { name: 'Create your card' })).toHaveAttribute('href', '/create')
    // The nav has "Find a Pokémon" too, so the one inside <main> is checked
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: 'Find a Pokémon' })).toHaveAttribute('href', '/pokemon')
  })

  it('"/create" without a Pokémon links to the list at "/pokemon"', () => {
    renderApp('/create')
    expect(screen.getByRole('link', { name: 'Go to the Pokémon list' })).toHaveAttribute('href', '/pokemon')
  })

  it('the tab title on the list page ("/pokemon") and on the 404 page', () => {
    // The list never answers here: the title and heading are there from the first render, before any data
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    renderApp('/pokemon')
    expect(document.title).toBe('Find a Pokémon · My Poké Card')
    expect(screen.getByRole('heading', { level: 1, name: 'Find a Pokémon' })).toBeInTheDocument()

    cleanup()
    renderApp('/abc')
    expect(document.title).toBe('Page not found · My Poké Card')
    expect(screen.getByRole('link', { name: 'Back to the Pokémon list' })).toHaveAttribute('href', '/pokemon')
  })

  it('keeps the footer outside the card frame, so it never ends up in a downloaded PNG', () => {
    saveCard(newPikachuCard)
    renderApp('/my-cards')

    const footer = screen.getByRole('contentinfo')
    const frame = document.querySelector('.poke-card-frame')
    expect(frame).not.toBeNull()
    expect(frame?.contains(footer)).toBe(false)
    expect(footer.closest('.poke-card-frame')).toBeNull()
  })
})
