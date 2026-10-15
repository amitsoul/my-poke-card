import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import FavoritePokemonField from './FavoritePokemonField.tsx'

// The "Change" button is a <Link>, which only works inside a router — MemoryRouter is a router for tests
function renderField() {
  render(
    <MemoryRouter>
      <FavoritePokemonField details={pikachuDetails} />
    </MemoryRouter>,
  )
}

describe('FavoritePokemonField', () => {
  it('is a group labeled "Your favorite Pokémon"', () => {
    renderField()
    expect(screen.getByRole('group', { name: 'Your favorite Pokémon' })).toBeInTheDocument()
  })

  it('shows the Pokémon name, image and card type', () => {
    renderField()
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByText('Type: Lightning')).toBeInTheDocument()
  })

  it('has a "Change" link back to the list', () => {
    renderField()
    expect(screen.getByRole('link', { name: 'Change' })).toHaveAttribute('href', '/')
  })
})
