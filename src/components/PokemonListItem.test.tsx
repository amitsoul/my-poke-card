import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import PokemonListItem from './PokemonListItem.tsx'

const pikachu = { id: 25, name: 'pikachu', image: 'https://example.com/25.png' }

describe('PokemonListItem', () => {
  it('links to the details page and shows the formatted name', () => {
    render(
      <MemoryRouter>
        <PokemonListItem pokemon={pikachu} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Pikachu Pikachu' })).toHaveAttribute('href', '/pokemon/25')
  })

  it('loads the artwork with crossOrigin, like every artwork image (one cached version for the PNG export)', () => {
    render(
      <MemoryRouter>
        <PokemonListItem pokemon={pikachu} />
      </MemoryRouter>,
    )
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('crossorigin', 'anonymous')
  })
})
