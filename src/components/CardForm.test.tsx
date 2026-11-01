// The Create card form on its own: errors, focus, counter and photo.
// The page around it (the URL, Edit, changing the Pokémon) is tested in CreateCardPage.test.tsx.
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { stubPokemonList } from '../test/fakeApi.ts'
import type { PokemonSummary } from '../types/pokemon.ts'
import { resizePhoto } from '../utils/photo.ts'
import CardForm from './CardForm.tsx'

// FAKE #1 — resizePhoto. jsdom (the fake browser in tests) can't draw images, so the real resize can't run.
// We keep everything in photo.ts real (including "check the file first") and replace ONLY resizePhoto
// with a fake function; each test decides what it answers.
vi.mock('../utils/photo.ts', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/photo.ts')>()
  return { ...real, resizePhoto: vi.fn() }
})

const SMALL_JPEG = 'data:image/jpeg;base64,AAAA' // a made-up "resized photo" (3 bytes)
const pngFile = () => new File(['png'], 'me.png', { type: 'image/png' })

// A promise the test finishes by itself — to test "while the photo is still preparing"
function promiseWeFinishLater() {
  let finish: (dataUrl: string) => void = () => {}
  const promise = new Promise<string>((resolve) => {
    finish = resolve
  })
  return { promise, finish }
}

// FAKE #2 — the list of Pokémon names for the "Your favorite Pokémon" search
beforeEach(() => {
  stubPokemonList([
    [25, 'pikachu'],
    [26, 'raichu'],
  ])
})

const PIKACHU: PokemonSummary = { id: 25, name: 'pikachu', image: '' }

// The form with the page's part played by a tiny stand-in: it keeps the chosen Pokémon
function renderForm(options: { pokemon?: PokemonSummary } = {}) {
  const onSubmit = vi.fn()
  const onPokemonSelect = vi.fn<(pokemon: PokemonSummary | null) => void>()
  function Page() {
    const [pokemon, setPokemon] = useState<PokemonSummary | null>(options.pokemon ?? null)
    return (
      <CardForm
        pokemon={pokemon}
        onPokemonSelect={(picked) => {
          setPokemon(picked)
          onPokemonSelect(picked)
        }}
        onSubmit={onSubmit}
      />
    )
  }
  render(<Page />)
  return {
    onSubmit,
    onPokemonSelect,
    user: userEvent.setup(),
    pokemonField: screen.getByRole('combobox', { name: 'Your favorite Pokémon' }),
  }
}

// The Pokémon names load in the background; some tests need them first
async function waitForNames() {
  await waitFor(() => expect(screen.queryByText('Loading Pokémon names...')).toBeNull())
}

describe('CardForm', () => {
  it('shows no error while typing, and the error when leaving the field', async () => {
    const { user } = renderForm()
    const age = screen.getByLabelText('Age (HP)')

    await user.type(age, '150')
    expect(screen.queryByText('Age must be 1–120')).toBeNull()

    await user.tab() // leave the field (blur)
    expect(screen.getByText('Age must be 1–120')).toBeInTheDocument()
    expect(age).toHaveAttribute('aria-invalid', 'true')
  })

  it('hides a shown error as soon as the value is fixed, but never shows a new one while typing', async () => {
    const { user } = renderForm()
    const age = screen.getByLabelText('Age (HP)')
    await user.type(age, '150')
    await user.tab()

    await user.clear(age)
    await user.type(age, '30') // now valid → the error disappears while typing
    expect(screen.queryByText('Age must be 1–120')).toBeNull()

    await user.type(age, 'x') // "30x" is wrong again, but we're still typing → no error yet
    expect(screen.queryByText('Age must be 1–120')).toBeNull()
    await user.tab()
    expect(screen.getByText('Age must be 1–120')).toBeInTheDocument()
  })

  it('on submit with an empty form: shows all 6 errors and focuses the Pokémon field (the 1st), connected to its error', async () => {
    const { user, onSubmit, pokemonField } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    for (const error of [
      'Please choose your favorite Pokémon',
      'Please enter your name',
      'Please enter your age',
      'Please upload an image',
      'Please enter your superpower',
      'Please write something about you',
    ]) {
      expect(screen.getByText(error)).toBeInTheDocument()
    }
    expect(pokemonField).toHaveFocus()
    expect(pokemonField).toHaveAttribute('aria-invalid', 'true')
    // aria-describedby points to the error, so a screen reader reads it with the field
    expect(pokemonField).toHaveAccessibleDescription(expect.stringContaining('Please choose your favorite Pokémon'))
    expect(screen.getByLabelText('Your name')).toHaveAccessibleDescription('Please enter your name')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows the error BEFORE moving focus, so a screen reader reads the field together with its error', async () => {
    const { user, pokemonField } = renderForm()
    // Record what the field's description is at the exact moment it receives focus
    let descriptionWhenFocused = ''
    pokemonField.addEventListener('focus', () => {
      const ids = (pokemonField.getAttribute('aria-describedby') ?? '').split(' ')
      descriptionWhenFocused = ids.map((id) => document.getElementById(id)?.textContent ?? '').join(' ')
    })

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(descriptionWhenFocused).toContain('Please choose your favorite Pokémon')
  })

  it('with a Pokémon chosen, the focus goes to the first other wrong field: Your name', async () => {
    const { user } = renderForm({ pokemon: PIKACHU })

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(screen.queryByText('Please choose your favorite Pokémon')).toBeNull()
    expect(screen.getByLabelText('Your name')).toHaveFocus()
  })

  it('the Pokémon field: typed but not picked → "Choose a Pokémon from the list"; picking hides the error', async () => {
    const { user, pokemonField, onPokemonSelect } = renderForm()
    await waitForNames()
    await user.type(pokemonField, 'pika')

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(screen.getByText('Choose a Pokémon from the list')).toBeInTheDocument()
    expect(pokemonField).toHaveFocus()

    await user.type(pokemonField, 'c') // "pikac": the list opens again
    await user.click(screen.getByRole('option', { name: 'Pikachu' }))
    expect(onPokemonSelect).toHaveBeenLastCalledWith(expect.objectContaining({ id: 25 }))
    expect(screen.queryByText('Choose a Pokémon from the list')).toBeNull()
  })

  it('the Pokémon field: leaving it empty shows "Please choose…"; an exact name typed is picked, with no error', async () => {
    const { user, pokemonField } = renderForm()
    await waitForNames()
    pokemonField.focus()
    await user.tab()
    expect(screen.getByText('Please choose your favorite Pokémon')).toBeInTheDocument()

    await user.type(pokemonField, 'raichu')
    await user.tab()
    expect(pokemonField).toHaveValue('Raichu')
    expect(screen.queryByText('Please choose your favorite Pokémon')).toBeNull()
    expect(screen.queryByText('Choose a Pokémon from the list')).toBeNull()
  })

  it('on submit with the Pokémon, name and age filled: focuses Photo (the 4th field), connected to its error', async () => {
    const { user } = renderForm({ pokemon: PIKACHU })
    await user.type(screen.getByLabelText('Your name'), 'Amit')
    await user.type(screen.getByLabelText('Age (HP)'), '30')

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    const photo = screen.getByLabelText('Photo')
    expect(photo).toHaveFocus()
    expect(photo).toHaveAccessibleDescription(expect.stringContaining('Please upload an image'))
  })

  it('counts the About you characters, up to 80', async () => {
    const { user } = renderForm()
    const aboutYou = screen.getByLabelText('About you')
    expect(screen.getByText('0 / 80')).toBeInTheDocument()

    await user.type(aboutYou, 'Hi!')

    expect(screen.getByText('3 / 80')).toBeInTheDocument()
    expect(aboutYou).toHaveAttribute('maxLength', '80')
  })

  it('on submit while the photo is preparing: asks to wait', async () => {
    const resize = promiseWeFinishLater()
    vi.mocked(resizePhoto).mockReturnValue(resize.promise) // the fake resize doesn't answer yet
    const { user } = renderForm()

    await user.upload(screen.getByLabelText('Photo'), pngFile())
    expect(screen.getByText('Preparing your photo...')).toHaveAttribute('role', 'status')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(screen.getByText('Please wait until your photo is ready')).toBeInTheDocument()
    resize.finish(SMALL_JPEG) // let it finish, so nothing is left running after the test
  })

  it("shows the \"couldn't read\" error when the photo is broken", async () => {
    vi.mocked(resizePhoto).mockRejectedValue(new Error('The image could not be decoded'))
    const { user } = renderForm()

    await user.upload(screen.getByLabelText('Photo'), pngFile())

    expect(await screen.findByText("We couldn't read this image. Please try another one.")).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Your photo' })).toBeNull()
  })

  it('on a valid submit: calls onSubmit once, with the cleaned answers and the photo', async () => {
    vi.mocked(resizePhoto).mockResolvedValue(SMALL_JPEG)
    const { user, onSubmit } = renderForm({ pokemon: PIKACHU })

    await user.type(screen.getByLabelText('Your name'), '  Amit ')
    await user.type(screen.getByLabelText('Age (HP)'), '030')
    await user.upload(screen.getByLabelText('Photo'), pngFile())
    await screen.findByRole('img', { name: 'Your photo' })
    await user.type(screen.getByLabelText('Superpower'), 'Super speed')
    await user.type(screen.getByLabelText('About you'), 'Hi!')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Amit',
      age: 30,
      superpower: 'Super speed',
      aboutYou: 'Hi!',
      photo: { dataUrl: SMALL_JPEG, type: 'image/jpeg', size: 3 },
    })
  })
})
