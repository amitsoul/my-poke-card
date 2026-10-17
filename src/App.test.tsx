// The whole app layout: nav, page and footer together. Only pages that need no API are opened here.
import { cleanup, render, screen } from '@testing-library/react'
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

  it('the tab title on the list page and on the 404 page', () => {
    // The list never answers here: the title is there from the first render, before any data
    vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(() => {})))
    renderApp('/')
    expect(document.title).toBe('Pokémon · My Poke Card')

    cleanup()
    renderApp('/abc')
    expect(document.title).toBe('Page not found · My Poke Card')
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
