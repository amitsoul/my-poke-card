// The whole app layout: nav, page and footer together. Only pages that need no API are opened here.
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
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
