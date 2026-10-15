import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import FavoritePokemonField from './FavoritePokemonField.tsx'

describe('FavoritePokemonField', () => {
  it('is a group labeled "Your favorite Pokémon"', () => {
    render(<FavoritePokemonField details={pikachuDetails} onChangePokemon={vi.fn()} />)
    expect(screen.getByRole('group', { name: 'Your favorite Pokémon' })).toBeInTheDocument()
  })

  it('shows the Pokémon name, image and card type', () => {
    render(<FavoritePokemonField details={pikachuDetails} onChangePokemon={vi.fn()} />)
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('crossorigin', 'anonymous')
    expect(screen.getByText('Type: Lightning')).toBeInTheDocument()
  })

  it('calls onChangePokemon when "Change" is clicked (the page decides whether to warn)', async () => {
    const user = userEvent.setup()
    const handleChangePokemon = vi.fn()
    render(<FavoritePokemonField details={pikachuDetails} onChangePokemon={handleChangePokemon} />)

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(handleChangePokemon).toHaveBeenCalledTimes(1)
  })
})
