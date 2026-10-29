// The landing page: headings, the two ways in, the two example cards and the steps — with no PokéAPI calls
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import HomePage from './HomePage.tsx'

function renderPage() {
  // Any fetch would be a PokéAPI call: the example cards must not need one
  const fetchSpy = vi.fn(() => Promise.reject(new Error('no fetch on the landing page')))
  vi.stubGlobal('fetch', fetchSpy)
  render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  )
  return fetchSpy
}

describe('HomePage', () => {
  it('has the page title and the section headings', () => {
    renderPage()
    expect(screen.getByRole('heading', { level: 1, name: 'Turn yourself into a Pokémon card' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'How it works' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'About me' })).toBeInTheDocument()
  })

  it('has the two ways in: "Create your card" and "Find a Pokémon"', () => {
    renderPage()
    expect(screen.getByRole('link', { name: 'Create your card' })).toHaveAttribute('href', '/create')
    expect(screen.getByRole('link', { name: 'Find a Pokémon' })).toHaveAttribute('href', '/pokemon')
  })

  it('shows the two example cards with their names, numbers and illustrations, without any PokéAPI call', () => {
    const fetchSpy = renderPage()
    const examples = within(screen.getByRole('list', { name: 'Example cards' }))

    const couple = examples.getByRole('article', { name: "Example: Amit & Amit's Squirtle" })
    expect(within(couple).getByText("Amit & Amit's Squirtle")).toBeInTheDocument()
    expect(within(couple).getByText('MPC 001')).toBeInTheDocument()
    expect(
      within(couple).getByRole('img', { name: 'Illustration of Amit and Amit sitting side by side in front of a green hedge' }),
    ).toBeInTheDocument()

    const cats = examples.getByRole('article', { name: "Example: Philip & Charlie's Pikachu" })
    expect(within(cats).getByText("Philip & Charlie's Pikachu")).toBeInTheDocument()
    expect(within(cats).getByText('MPC 002')).toBeInTheDocument()
    expect(within(cats).getByRole('img', { name: /^Illustration of Philip and Charlie on a wooden table/ })).toBeInTheDocument()

    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('the example cards are fixed: nothing to drag, nothing grabs the focus', () => {
    renderPage()
    expect(screen.queryByRole('button', { name: /sticker/ })).toBeNull()
    expect(document.body).toHaveFocus()
  })

  it('"How it works" has 3 steps in order, each a link to its page', () => {
    renderPage()
    // The section is labelled by its heading, so it is a region named "How it works"
    const section = within(screen.getByRole('region', { name: 'How it works' }))
    expect(section.getAllByRole('listitem')).toHaveLength(3)
    const links = section.getAllByRole('link').map((link) => [link.textContent, link.getAttribute('href')])
    expect(links).toEqual([
      ['Pick a Pokémon', '/pokemon'],
      ['Add your photo and details', '/create'],
      ['Save and download', '/my-cards'],
    ])
  })
})
