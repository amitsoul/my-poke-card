import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import NavBar from './NavBar.tsx'

function renderAt(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <NavBar />
    </MemoryRouter>,
  )
}

// The names of the highlighted links (the class NavBar gives the current page's link)
function activeLinks(): string[] {
  return screen
    .getAllByRole('link')
    .filter((link) => link.classList.contains('active'))
    .map((link) => link.textContent ?? '')
}

describe('NavBar', () => {
  it('is the page header (banner landmark) with the logo as a link to the landing page', () => {
    renderAt('/pokemon')
    const header = screen.getByRole('banner')
    expect(header).toContainElement(screen.getByRole('navigation', { name: 'Main' }))
    // The link's name comes from the logo's aria-label
    expect(screen.getByRole('link', { name: 'My Poké Card' })).toHaveAttribute('href', '/')
  })

  it('has the three links with their pages', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Find a Pokémon' })).toHaveAttribute('href', '/pokemon')
    expect(screen.getByRole('link', { name: 'Create card' })).toHaveAttribute('href', '/create')
    expect(screen.getByRole('link', { name: 'My Cards' })).toHaveAttribute('href', '/my-cards')
  })

  it('highlights nothing on the landing page', () => {
    renderAt('/')
    expect(activeLinks()).toEqual([])
  })

  // Below the list page: a details page counts as "Find a Pokémon"; the 404 pages (…/abc) highlight nothing
  it('"Find a Pokémon" is highlighted on the list page', () => {
    renderAt('/pokemon')
    expect(activeLinks()).toEqual(['Find a Pokémon'])
  })

  it.each([
    ['/pokemon/25', ['Find a Pokémon']],
    ['/pokemon/abc', []],
    ['/create', ['Create card']],
    ['/create/25', ['Create card']],
    ['/create/abc', []],
    ['/my-cards', ['My Cards']],
  ])('on %s the highlighted link is %j', (path, expected) => {
    renderAt(path)
    expect(activeLinks()).toEqual(expected)
  })
})
