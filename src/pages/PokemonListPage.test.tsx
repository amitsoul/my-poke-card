// The list page with a fake PokéAPI: loading, the list, the error with "Try again", and the search.
// (The list now comes from the shared, cached loader in src/utils/pokemonListApi.ts.)
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import { stubPokemonList } from '../test/fakeApi.ts'
import PokemonListPage from './PokemonListPage.tsx'

const NAMES: [number, string][] = [
  [1, 'bulbasaur'],
  [4, 'charmander'],
  [25, 'pikachu'],
]

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/pokemon']}>
      <Routes>
        <Route path="/pokemon" element={<PokemonListPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('PokemonListPage', () => {
  it('shows "Loading Pokémon..." first, then the Pokémon, with special forms left out', async () => {
    stubPokemonList(NAMES, { forms: [[10034, 'charizard-mega-x']] })
    renderPage()

    expect(screen.getByText('Loading Pokémon...')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /Pikachu/ })).toHaveAttribute('href', '/pokemon/25')
    expect(screen.getByRole('link', { name: /Bulbasaur/ })).toBeInTheDocument()
    expect(screen.queryByText(/Charizard Mega X/i)).toBeNull()
    expect(screen.queryByText('Loading Pokémon...')).toBeNull()
  })

  it('shows the error; "Try again" loads the list', async () => {
    stubPokemonList(NAMES, { failures: 1 })
    const user = renderPage()

    await user.click(await screen.findByRole('button', { name: 'Try again' }))

    expect(await screen.findByRole('link', { name: /Pikachu/ })).toBeInTheDocument()
  })

  it('searching "pika" shows only Pikachu', async () => {
    stubPokemonList(NAMES)
    const user = renderPage()
    await screen.findByRole('link', { name: /Pikachu/ })

    await user.type(screen.getByRole('searchbox'), 'pika')

    expect(screen.getByRole('link', { name: /Pikachu/ })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Bulbasaur/ })).toBeNull()
    expect(screen.queryByRole('link', { name: /Charmander/ })).toBeNull()
  })
})
