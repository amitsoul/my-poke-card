// The details page with a fake PokéAPI (src/test/fakeApi.ts): attacks, the Weakness line, and the attacks' own
// loading/error states — while the rest of the page (name, Type, Create button) stays visible.
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { getAttackRows, getWeaknessValue } from '../test/cardQueries.ts'
import { moveResponse, speciesResponse, stubPokeApi } from '../test/fakeApi.ts'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import PokemonDetailsPage from './PokemonDetailsPage.tsx'

const PIKACHU_MOVES = [
  moveResponse('tail-whip', null, 'Tail Whip'),
  moveResponse('growl', null, 'Growl'),
  moveResponse('thunder-shock', 40, 'Thunder Shock'),
  moveResponse('quick-attack', 40, 'Quick Attack'),
]

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/pokemon/25']}>
      <Routes>
        <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('PokemonDetailsPage — attacks and Weakness', () => {
  it('shows the attacks and the Weakness / Resistance / Retreat line', async () => {
    stubPokeApi({ pokemon: [pikachuDetails], moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') })
    renderPage()

    await waitFor(() =>
      expect(getAttackRows(document.body)).toEqual([
        'Cost: Lightning, Colorless | Thunder Shock | 40',
        'Cost: Lightning, Colorless | Quick Attack | 40',
      ]),
    )
    expect(screen.getByRole('heading', { name: 'Attacks' })).toBeInTheDocument()
    expect(getWeaknessValue(document.body, 'Weakness')).toBe('Fighting ×2')
    expect(getWeaknessValue(document.body, 'Resistance')).toBe('none')
    expect(getWeaknessValue(document.body, 'Retreat')).toBe('Colorless')
  })

  it('while the attacks load, the rest of the page is already there', async () => {
    // The Pokémon loads, but the move and species requests never answer
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) =>
        String(input).endsWith('/pokemon/25')
          ? Promise.resolve(new Response(JSON.stringify(pikachuDetails), { status: 200 }))
          : new Promise<Response>(() => {}),
      ),
    )
    renderPage()

    expect(await screen.findByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('crossorigin', 'anonymous')
    expect(screen.getByRole('status')).toHaveTextContent('Loading attacks...')
    expect(screen.getByText('Type: Lightning')).toBeInTheDocument()
    expect(getWeaknessValue(document.body, 'Weakness')).toBe('Fighting ×2')
    expect(screen.getByRole('link', { name: 'Create my card with Pikachu' })).toBeInTheDocument()
  })

  it('the tab title: "Pokémon details" while loading, then the Pokémon name', async () => {
    stubPokeApi({ pokemon: [pikachuDetails], moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') })
    renderPage()
    expect(document.title).toBe('Pokémon details · My Poké Card')

    await screen.findByRole('heading', { name: 'Pikachu' })
    expect(document.title).toBe('Pikachu · My Poké Card')
  })

  it('"Back to list" goes to the list at /pokemon, with the search the list was opened with', async () => {
    stubPokeApi({ pokemon: [pikachuDetails], moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') })
    render(
      <MemoryRouter initialEntries={[{ pathname: '/pokemon/25', state: { listSearch: '?q=pika' } }]}>
        <Routes>
          <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('link', { name: '← Back to list' })).toHaveAttribute('href', '/pokemon?q=pika')
    await screen.findByText('Thunder Shock') // let the attacks finish loading before the test ends
  })

  it('the tab title after a failed load stays general', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))))
    renderPage()

    await screen.findByRole('button', { name: 'Try again' })
    expect(document.title).toBe('Pokémon details · My Poké Card')
  })

  it('a failed attack request shows the error (the page stays); "Try again" then shows the attacks', async () => {
    stubPokeApi({
      pokemon: [pikachuDetails],
      moves: PIKACHU_MOVES,
      species: speciesResponse('Mouse Pokémon'),
      failingMoves: ['thunder-shock'],
    })
    const user = renderPage()

    expect(
      await screen.findByText("Oops! We couldn't load the attacks. Please check your internet connection."),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Create my card with Pikachu' })).toBeInTheDocument()

    stubPokeApi({ pokemon: [pikachuDetails], moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') })
    await user.click(screen.getByRole('button', { name: 'Try again' }))

    expect(await screen.findByText('Thunder Shock')).toBeInTheDocument()
    expect(screen.queryByText(/couldn't load the attacks/)).toBeNull()
  })
})
