import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SiteFooter from './SiteFooter.tsx'

describe('SiteFooter', () => {
  it('shows the fan-made disclaimer and links to PokéAPI', () => {
    render(<SiteFooter />)

    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Fan-made · Not an official Pokémon card')
    expect(footer).toHaveTextContent('Data from PokéAPI')
    expect(screen.getByRole('link', { name: 'PokéAPI' })).toHaveAttribute('href', 'https://pokeapi.co')
  })
})
