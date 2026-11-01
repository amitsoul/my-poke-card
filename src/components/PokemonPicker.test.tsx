// The Pokémon search (WAI-ARIA combobox) with a fake list of species: typing, the keyboard, the mouse,
// leaving the field, loading and errors.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { stubPokemonList } from '../test/fakeApi.ts'
import type { PokemonSummary } from '../types/pokemon.ts'
import PokemonPicker from './PokemonPicker.tsx'

const NAMES: [number, string][] = [
  [10, 'caterpie'],
  [25, 'pikachu'],
  [26, 'raichu'],
  [172, 'pichu'],
  [731, 'pikipek'],
]

// The picker with its own "picked" state, like the form will keep it; onSelect and onBlur are spies
function renderPicker(options: { selected?: PokemonSummary; error?: string } = {}) {
  const onSelect = vi.fn<(pokemon: PokemonSummary | null) => void>()
  const onBlur = vi.fn<() => void>()
  function Harness() {
    const [selected, setSelected] = useState<PokemonSummary | null>(options.selected ?? null)
    return (
      <>
        <PokemonPicker
          label="Your favorite Pokémon"
          selected={selected}
          onSelect={(pokemon) => {
            setSelected(pokemon)
            onSelect(pokemon)
          }}
          error={options.error}
          onBlur={onBlur}
        />
        <button type="button">Next field</button>
      </>
    )
  }
  render(<Harness />)
  return { onSelect, onBlur, user: userEvent.setup(), input: screen.getByRole('combobox', { name: 'Your favorite Pokémon' }) }
}

// The names in the open list, in order
function shownMatches(): string[] {
  return within(screen.getByRole('listbox')).getAllByRole('option').map((option) => option.textContent ?? '')
}

describe('PokemonPicker', () => {
  it('is a combobox labeled "Your favorite Pokémon"; says "Loading Pokémon names..." until the names arrive', async () => {
    stubPokemonList(NAMES)
    renderPicker()

    expect(screen.getByRole('status')).toHaveTextContent('Loading Pokémon names...')
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(''))
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-expanded', 'false')
  })

  it('typing shows the matches (starting with the text first), says how many, and the sprites are decoration', async () => {
    stubPokemonList(NAMES)
    const { user, input } = renderPicker()

    await user.type(input, 'pi')

    expect(input).toHaveAttribute('aria-expanded', 'true')
    expect(shownMatches()).toEqual(['Pikachu', 'Pichu', 'Pikipek', 'Caterpie'])
    expect(screen.getByRole('status')).toHaveTextContent('4 Pokémon found')
    // alt="" on the sprites: the name is already in the text
    expect(within(screen.getByRole('listbox')).queryAllByRole('img')).toEqual([])
  })

  it('↓/↑ move through the matches (aria-activedescendant), wrapping at the ends; Enter picks', async () => {
    stubPokemonList(NAMES)
    const { user, input, onSelect } = renderPicker()
    await user.type(input, 'chu') // Pikachu, Raichu, Pichu

    await user.keyboard('{ArrowDown}')
    const first = screen.getByRole('option', { name: 'Pikachu' })
    expect(input).toHaveAttribute('aria-activedescendant', first.id)
    expect(first).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowUp}') // from the first back to the last
    expect(input).toHaveAttribute('aria-activedescendant', screen.getByRole('option', { name: 'Pichu' }).id)

    await user.keyboard('{Enter}')
    expect(onSelect).toHaveBeenLastCalledWith({ id: 172, name: 'pichu', image: expect.any(String) })
    expect(input).toHaveValue('Pichu')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveFocus()
  })

  it('a click (or a tap) on a match picks it and keeps the focus in the field', async () => {
    stubPokemonList(NAMES)
    const { user, input, onSelect } = renderPicker()
    await user.type(input, 'rai')

    await user.click(screen.getByRole('option', { name: 'Raichu' }))

    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 26 }))
    expect(input).toHaveValue('Raichu')
    expect(input).toHaveFocus()
  })

  it('Escape closes the list and keeps the text', async () => {
    stubPokemonList(NAMES)
    const { user, input } = renderPicker()
    await user.type(input, 'pi')

    await user.keyboard('{Escape}')

    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveValue('pi')
  })

  it('says "No Pokémon found" when nothing matches', async () => {
    stubPokemonList(NAMES)
    const { user, input } = renderPicker()

    await user.type(input, 'zzz')

    expect(screen.getByRole('status')).toHaveTextContent('No Pokémon found')
    expect(input).toHaveAttribute('aria-expanded', 'false')
  })

  it('shows the picked Pokémon given by the page; typing over it un-picks it (onSelect null)', async () => {
    stubPokemonList(NAMES)
    const { user, input, onSelect } = renderPicker({ selected: { id: 25, name: 'pikachu', image: '' } })
    expect(input).toHaveValue('Pikachu')

    await user.type(input, 'x')

    expect(onSelect).toHaveBeenLastCalledWith(null)
    expect(input).toHaveValue('Pikachux')
  })

  it('leaving the field with an exact name picks it; with part of a name it picks nothing; onBlur is called', async () => {
    stubPokemonList(NAMES)
    const { user, input, onSelect, onBlur } = renderPicker()
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(''))

    await user.type(input, 'PIKACHU')
    await user.tab()
    expect(onSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 25 }))
    expect(input).toHaveValue('Pikachu')
    expect(onBlur).toHaveBeenCalled()

    await user.clear(input)
    await user.type(input, 'pika')
    await user.tab()
    expect(onSelect).toHaveBeenLastCalledWith(null)
    expect(input).toHaveValue('pika')
  })

  it("shows the form's error, connected to the field", () => {
    stubPokemonList(NAMES)
    const { input } = renderPicker({ error: 'Please choose your favorite Pokémon' })

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(expect.stringContaining('Please choose your favorite Pokémon'))
  })

  it('when the names cannot be loaded: says so; "Try again" loads them', async () => {
    stubPokemonList(NAMES, { failures: 1 })
    const { user, input } = renderPicker()

    expect(await screen.findByText("Sorry, the Pokémon names couldn't be loaded.")).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Try again' }))
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Try again' })).toBeNull())

    await user.type(input, 'pika')
    expect(shownMatches()).toEqual(['Pikachu'])
  })
})
