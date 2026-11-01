import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import PokemonPreview from './PokemonPreview.tsx'

describe('PokemonPreview', () => {
  it('shows the Pokémon name, image and card type', () => {
    render(<PokemonPreview state={{ status: 'ready', details: pikachuDetails }} onRetry={vi.fn()} />)
    expect(screen.getByText('Pikachu')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('crossorigin', 'anonymous')
    expect(screen.getByText('Type: Lightning')).toBeInTheDocument()
  })

  it('says "Loading your Pokémon..." while it loads', () => {
    render(<PokemonPreview state={{ status: 'loading' }} onRetry={vi.fn()} />)
    expect(screen.getByText('Loading your Pokémon...')).toBeInTheDocument()
  })

  it('on an error: says so, and "Try again" calls onRetry', async () => {
    const user = userEvent.setup()
    const handleRetry = vi.fn()
    render(<PokemonPreview state={{ status: 'error' }} onRetry={handleRetry} />)

    expect(screen.getByText(/We couldn't load this Pokémon/)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(handleRetry).toHaveBeenCalledTimes(1)
  })
})
