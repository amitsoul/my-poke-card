// The whole Create card page: the Change warning, Edit, and starting fresh for another Pokémon.
// The form's own rules (errors, focus, counter) are tested in CardForm.test.tsx.
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAttackRows, getWeaknessValue } from '../test/cardQueries.ts'
import { moveResponse, speciesResponse, stubPokeApi } from '../test/fakeApi.ts'
import { charmanderDetails, pikachuDetails } from '../test/pokemonFixtures.ts'
import { resizePhoto } from '../utils/photo.ts'
import { COUNTER_KEY, loadSavedCards } from '../utils/savedCards.ts'
import { DEFAULT_STICKER_POSITION } from '../utils/sticker.ts'
import CreateCardPage from './CreateCardPage.tsx'

// FAKE #2 — resizePhoto (same idea as in CardForm.test.tsx): jsdom can't draw, so only this one
// function is replaced; it answers with a made-up tiny JPEG.
vi.mock('../utils/photo.ts', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/photo.ts')>()
  return { ...real, resizePhoto: vi.fn() }
})

const SMALL_JPEG = 'data:image/jpeg;base64,AAAA'

// FAKE #1 — fetch (src/test/fakeApi.ts). Instead of the real PokéAPI (slow, needs internet, could change),
// fetch is replaced by a tiny fake that answers with our own Pikachu or Charmander, their species and moves,
// or 404 for anything else. The page doesn't know the difference: it just gets an answer.
// (setup.ts puts the real fetch back after each test.)
beforeEach(() => {
  stubPokeApi({
    pokemon: [pikachuDetails, charmanderDetails],
    species: speciesResponse('Mouse Pokémon'),
    moves: [
      moveResponse('tail-whip', null, 'Tail Whip'),
      moveResponse('growl', null, 'Growl'),
      moveResponse('thunder-shock', 40, 'Thunder Shock'),
      moveResponse('quick-attack', 40, 'Quick Attack'),
      moveResponse('scratch', 40, 'Scratch'),
      moveResponse('ember', 40, 'Ember'),
    ],
  })
  vi.mocked(resizePhoto).mockResolvedValue(SMALL_JPEG)
})

// FAKE #3 — the router. MemoryRouter keeps the URL in memory instead of the address bar.
// "/" is a placeholder, so we can see where "Change" leads. The link outside the routes changes
// the Pokémon in the URL while the page stays on screen.
function renderPage(path: string) {
  render(
    <MemoryRouter initialEntries={[path]}>
      <Link to="/create/4">Go to Charmander</Link>
      <Routes>
        <Route path="/" element={<p>LIST PAGE</p>} />
        <Route path="/create/:id" element={<CreateCardPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, name = 'Amit') {
  await user.type(await screen.findByLabelText('Your name'), name)
  await user.type(screen.getByLabelText('Age (HP)'), '30')
  await user.upload(screen.getByLabelText('Photo'), new File(['png'], 'me.png', { type: 'image/png' }))
  await screen.findByRole('img', { name: 'Your photo' })
  await user.type(screen.getByLabelText('Superpower'), 'Super speed')
  await user.type(screen.getByLabelText('About you'), 'I love Pokémon cards!')
}

describe('CreateCardPage', () => {
  it('with an empty form, "Change" goes to the list without a warning', async () => {
    const user = renderPage('/create/25')

    await user.click(await screen.findByRole('button', { name: 'Change' }))

    expect(screen.getByText('LIST PAGE')).toBeInTheDocument()
  })

  it('with an answer, "Change" warns; "Keep editing" closes it; "Yes, change" goes to the list', async () => {
    const user = renderPage('/create/25')
    await user.type(await screen.findByLabelText('Your name'), 'Amit')

    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Change Pokémon? Your answers will be cleared.')
    expect(screen.getByRole('button', { name: 'Keep editing' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Keep editing' }))
    expect(screen.queryByRole('alert')).toBeNull()
    expect(screen.getByRole('button', { name: 'Change' })).toHaveFocus()
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit') // nothing was cleared

    await user.click(screen.getByRole('button', { name: 'Change' }))
    await user.click(screen.getByRole('button', { name: 'Yes, change' }))
    expect(screen.getByText('LIST PAGE')).toBeInTheDocument()
  })

  it('a full submit shows the card with every field, the attacks and the photo; "Edit" keeps everything; "Change" then warns without typing', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    const card = screen.getByRole('article', { name: 'Your card' })
    expect(within(card).getByText("Amit's Pikachu")).toBeInTheDocument()
    expect(card).toHaveTextContent('HP 30')
    expect(within(card).getAllByRole('img', { name: 'Lightning' }).length).toBeGreaterThan(0) // the Type symbol
    expect(card).toHaveTextContent(`NO. 0025 · Mouse Pokémon · HT 1'04" · WT 13.2 lbs`)
    expect(card).toHaveTextContent('Super Speed') // shown in Title Case on the card
    // The attacks were loaded while the form was filled, so they're already on the card
    expect(getAttackRows(card)).toEqual([
      'Cost: Lightning, Colorless | Thunder Shock | 40',
      'Cost: Lightning, Colorless | Quick Attack | 40',
    ])
    expect(getWeaknessValue(card, 'Weakness')).toBe('Fighting ×2')
    expect(getWeaknessValue(card, 'Resistance')).toBe('none')
    expect(getWeaknessValue(card, 'Retreat')).toBe('Colorless')
    expect(card).toHaveTextContent('"I love Pokémon cards!"')
    expect(card).toHaveTextContent('Card design: Amit Soul · Fan-made · Not an official Pokémon card')
    // Look inside the card: the "Your favorite Pokémon" field above it also has a Pikachu image
    expect(within(card).getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', SMALL_JPEG)
    // On the created card the sticker is a movable button; a new card starts it at the bottom right
    const sticker = within(card).getByRole('button', { name: 'Pikachu sticker' })
    const startPosition = { left: `${DEFAULT_STICKER_POSITION.x}%`, top: `${DEFAULT_STICKER_POSITION.y}%` }
    expect(sticker).toHaveStyle(startPosition)
    expect(screen.getByRole('heading', { name: 'Your card' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')
    expect(screen.getByLabelText('Age (HP)')).toHaveValue('30')
    expect(screen.getByLabelText('Superpower')).toHaveValue('Super speed')
    expect(screen.getByLabelText('About you')).toHaveValue('I love Pokémon cards!')
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', SMALL_JPEG)

    // Create again after Edit: the sticker keeps its position (moving it comes in step 10d)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    const cardAgain = screen.getByRole('article', { name: 'Your card' })
    expect(within(cardAgain).getByRole('button', { name: 'Pikachu sticker' })).toHaveStyle(startPosition)
    await user.click(screen.getByRole('button', { name: 'Edit' }))

    // Nobody typed after "Edit", but the form is full — so "Change" must still warn
    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows the name in Title Case on the card, but keeps it as typed: after Edit the field says "amit"', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user, 'amit')

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(within(screen.getByRole('article', { name: 'Your card' })).getByText("Amit's Pikachu")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Your name')).toHaveValue('amit')
  })

  it('a moved sticker stays after Edit → Create; a different Pokémon starts at the default again', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    // Move it with the keyboard: 5 × ← = 10% to the left, 1 × Shift+↑ = 10% up
    const sticker = screen.getByRole('button', { name: 'Pikachu sticker' })
    sticker.focus()
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}{Shift>}{ArrowUp}{/Shift}')
    const moved = { left: `${DEFAULT_STICKER_POSITION.x - 10}%`, top: `${DEFAULT_STICKER_POSITION.y - 10}%` }
    expect(sticker).toHaveStyle(moved)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(screen.getByRole('button', { name: 'Pikachu sticker' })).toHaveStyle(moved)

    // Another Pokémon → a fresh card with the sticker at the default place
    await user.click(screen.getByRole('link', { name: 'Go to Charmander' }))
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(screen.getByRole('button', { name: 'Charmander sticker' })).toHaveStyle({
      left: `${DEFAULT_STICKER_POSITION.x}%`,
      top: `${DEFAULT_STICKER_POSITION.y}%`,
    })
  })

  it('a different Pokémon starts with an empty form', async () => {
    const user = renderPage('/create/25')
    await user.type(await screen.findByLabelText('Your name'), 'Amit')

    await user.click(screen.getByRole('link', { name: 'Go to Charmander' }))

    expect(await screen.findByText('Charmander')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('')
  })

  it('shows the 404 page for /create/abc', () => {
    renderPage('/create/abc')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('shows "Pokémon not found" for /create/99999 (the API answers 404)', async () => {
    renderPage('/create/99999')
    expect(await screen.findByText('Pokémon not found')).toBeInTheDocument()
  })

  // ---------- Saving (task 11) ----------

  it('Save → "Saved as MPC 001 ✓" (focused), the number on the card, the sticker fixed, the card in storage', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    // Before saving there's no Download (the PNG must have its card number)
    expect(screen.queryByRole('button', { name: 'Download PNG' })).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))

    expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument()
    const notice = screen.getByText('Saved as MPC 001 ✓')
    expect(notice).toHaveAttribute('role', 'status') // announced by screen readers
    expect(notice).toHaveFocus()
    expect(screen.getByRole('link', { name: 'View in My Cards' })).toHaveAttribute('href', '/my-cards')
    const card = screen.getByRole('article', { name: 'Your card' })
    expect(within(card).getByText('MPC 001')).toBeInTheDocument()
    // Saved: the sticker is fixed (an image, not a button), the tip is gone, and there's no second Save
    expect(screen.queryByRole('button', { name: 'Pikachu sticker' })).toBeNull()
    expect(within(card).getByRole('img', { name: 'Pikachu' })).toBeInTheDocument()
    expect(screen.queryByText(/Tip: drag the Pokémon sticker/)).toBeNull()
    expect(screen.queryByRole('button', { name: 'Save to My Cards' })).toBeNull()

    // In localStorage: the full snapshot, number 1, not a favorite
    const { cards } = loadSavedCards()
    expect(cards).toHaveLength(1)
    expect(cards[0]).toMatchObject({
      number: 1,
      favorite: false,
      card: { name: 'Amit', age: 30, superpower: 'Super speed' },
      pokemon: { id: 25, name: 'pikachu', gameTypes: ['electric'] },
      info: { genus: 'Mouse Pokémon' },
    })
    expect(cards[0].info.attacks.map((attack) => attack.name)).toEqual(['Thunder Shock', 'Quick Attack'])
    expect(window.localStorage.getItem(COUNTER_KEY)).toBe('1')
  })

  it('Edit after saving → a new, unsaved card; saving it gives MPC 002', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    // Not saved yet: no number on the card, the sticker can move again, Save is back
    expect(screen.queryByText(/^MPC \d+$/)).toBeNull()
    expect(screen.getByRole('button', { name: 'Pikachu sticker' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))
    expect(screen.getByText('Saved as MPC 002 ✓')).toBeInTheDocument()
    expect(loadSavedCards().cards.map((saved) => saved.number)).toEqual([2, 1])
  })

  it('after saving, "Change" goes to the list without a warning (nothing is lost)', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))

    await user.click(screen.getByRole('button', { name: 'Change' }))

    expect(screen.getByText('LIST PAGE')).toBeInTheDocument()
  })

  it('Save while the attacks are still loading → "Please wait…", and nothing is saved', async () => {
    // The Pokémon loads, but its species and moves never answer
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo | URL) =>
        String(input).endsWith('/pokemon/25')
          ? Promise.resolve(new Response(JSON.stringify(pikachuDetails), { status: 200 }))
          : new Promise<Response>(() => {}),
      ),
    )
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))

    expect(screen.getByRole('alert')).toHaveTextContent('Please wait until the attacks are loaded.')
    expect(screen.getByRole('button', { name: 'Save to My Cards' })).toBeEnabled() // still enabled
    expect(loadSavedCards().cards).toHaveLength(0)
  })

  it('a full storage → the "storage is full" message with a link to My Cards; nothing is saved', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    try {
      await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))
    } finally {
      setItem.mockRestore() // the real localStorage again, for the next tests
    }

    expect(screen.getByRole('alert')).toHaveTextContent(
      "Your browser's storage is full. Delete some cards in My Cards, then try again.",
    )
    expect(within(screen.getByRole('alert')).getByRole('link', { name: 'My Cards' })).toHaveAttribute('href', '/my-cards')
    expect(screen.getByRole('button', { name: 'Save to My Cards' })).toBeInTheDocument()
    expect(loadSavedCards().cards).toHaveLength(0)
  })
})
