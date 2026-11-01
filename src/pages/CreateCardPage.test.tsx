// The whole Create card page: the Pokémon search in the form, the URL, Edit, changing the Pokémon, saving.
// The form's own rules (errors, focus, counter) are tested in CardForm.test.tsx.
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
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
// the list of names for the search, or 404 for anything else. The page doesn't know the difference.
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
    names: [
      [4, 'charmander'],
      [25, 'pikachu'],
      [26, 'raichu'],
    ],
  })
  vi.mocked(resizePhoto).mockResolvedValue(SMALL_JPEG)
})

// Shows the URL, and a Back button — to check that a pick REPLACES the URL (Back skips it)
function UrlAndBack() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <p data-testid="location">{location.pathname}</p>
      <button type="button" onClick={() => navigate(-1)}>
        Browser Back
      </button>
    </>
  )
}

// FAKE #3 — the router. MemoryRouter keeps the URL in memory instead of the address bar. The page opens from
// "/start" (so Back has somewhere to go). The link outside the routes plays the menu's "Create card".
function renderPage(path: string) {
  render(
    <MemoryRouter initialEntries={['/start', path]} initialIndex={1}>
      <Link to="/create">Menu: Create card</Link>
      <UrlAndBack />
      <Routes>
        <Route path="/start" element={<p>START PAGE</p>} />
        <Route path="/pokemon" element={<p>LIST PAGE</p>} />
        <Route path="/create/:id?" element={<CreateCardPage />} />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

function pokemonField() {
  return screen.getByRole('combobox', { name: 'Your favorite Pokémon' })
}

// Type part of a name in the Pokémon search and click the match (waits for the names to load first)
async function pickPokemon(user: ReturnType<typeof userEvent.setup>, text: string, name: string) {
  await waitFor(() => expect(screen.queryByText('Loading Pokémon names...')).toBeNull())
  await user.clear(pokemonField())
  await user.type(pokemonField(), text)
  await user.click(screen.getByRole('option', { name }))
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
  it('"/create" shows the full form right away; its first field is the empty Pokémon search', () => {
    renderPage('/create')

    expect(screen.getByRole('heading', { level: 1, name: 'Create your card' })).toBeInTheDocument()
    expect(pokemonField()).toHaveValue('')
    expect(screen.getByLabelText('Your name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create my card' })).toBeInTheDocument()
    // The Pokémon field is inside the form, before Your name
    expect(pokemonField().closest('form')).not.toBeNull()
    const nameField = screen.getByLabelText('Your name')
    expect(pokemonField().compareDocumentPosition(nameField) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('"/create/25" starts with Pikachu in the field and its preview (image, name, Type)', async () => {
    renderPage('/create/25')

    expect(await screen.findByText('Type: Lightning')).toBeInTheDocument()
    expect(pokemonField()).toHaveValue('Pikachu')
    expect(screen.getByRole('img', { name: 'Pikachu' })).toHaveAttribute('crossorigin', 'anonymous')
  })

  it('picking a Pokémon → the URL becomes /create/25 (replaced: Back skips it), and everything typed stays', async () => {
    const user = renderPage('/create')
    await user.type(screen.getByLabelText('Your name'), 'Amit')
    await user.type(screen.getByLabelText('Age (HP)'), '30')

    await pickPokemon(user, 'pika', 'Pikachu')

    expect(screen.getByTestId('location')).toHaveTextContent('/create/25')
    expect(await screen.findByText('Type: Lightning')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')
    expect(screen.getByLabelText('Age (HP)')).toHaveValue('30')

    // Another Pokémon: the URL follows, the answers still stay
    await pickPokemon(user, 'char', 'Charmander')
    expect(screen.getByTestId('location')).toHaveTextContent('/create/4')
    expect(await screen.findByText('Type: Fire')).toBeInTheDocument()
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')

    // The picks replaced the URL, so Back goes to the page before Create
    await user.click(screen.getByRole('button', { name: 'Browser Back' }))
    expect(screen.getByText('START PAGE')).toBeInTheDocument()
  })

  it('typing over the chosen Pokémon un-picks it: the URL goes back to /create and the preview goes', async () => {
    const user = renderPage('/create/25')
    await screen.findByText('Type: Lightning')

    await user.type(pokemonField(), 'x')

    expect(screen.getByTestId('location')).toHaveTextContent(/^\/create$/)
    expect(screen.queryByText('Type: Lightning')).toBeNull()
    expect(pokemonField()).toHaveValue('Pikachux')
  })

  it('"Create my card" with no Pokémon: the error on the field, and the focus moves to it (the first field)', async () => {
    const user = renderPage('/create')
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(pokemonField()).toHaveFocus()
    expect(pokemonField()).toHaveAccessibleDescription(expect.stringContaining('Please choose your favorite Pokémon'))
    expect(screen.queryByRole('article', { name: 'Your card' })).toBeNull()

    // Pick one, and the same answers make the card
    await pickPokemon(user, 'pika', 'Pikachu')
    await screen.findByText('Type: Lightning')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(within(screen.getByRole('article', { name: 'Your card' })).getByText("Amit's Pikachu")).toBeInTheDocument()
  })

  it('changing the Pokémon while the (saved) card is shown → back to the form, everything kept, focus on the field', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    await user.click(screen.getByRole('button', { name: 'Save to My Cards' }))

    await pickPokemon(user, 'char', 'Charmander')

    expect(screen.queryByRole('article', { name: 'Your card' })).toBeNull()
    expect(screen.getByTestId('location')).toHaveTextContent('/create/4')
    expect(pokemonField()).toHaveFocus()
    expect(pokemonField()).toHaveValue('Charmander')
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')
    expect(screen.getByLabelText('Superpower')).toHaveValue('Super speed')
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', SMALL_JPEG)

    // A new, unsaved card with Charmander (the saved Pikachu card stays saved)
    await screen.findByText('Type: Fire')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    const card = screen.getByRole('article', { name: 'Your card' })
    expect(within(card).getByText("Amit's Charmander")).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save to My Cards' })).toBeInTheDocument()
    expect(loadSavedCards().cards).toHaveLength(1)
  })

  it('above a shown card, typing in the Pokémon field keeps the card; leaving without a pick shows its Pokémon again', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    await waitFor(() => expect(screen.queryByText('Loading Pokémon names...')).toBeNull())

    await user.clear(pokemonField())
    await user.type(pokemonField(), 'zz')
    expect(screen.getByRole('article', { name: 'Your card' })).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('/create/25')

    await user.tab()
    expect(pokemonField()).toHaveValue('Pikachu')
    expect(screen.getByRole('article', { name: 'Your card' })).toBeInTheDocument()
  })

  it('a full submit shows the card with every field, the attacks and the photo; "Edit" keeps everything', async () => {
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
    // Look inside the card: the Pokémon preview above it also has a Pikachu image
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
  })

  it('shows the name in Title Case on the card, but keeps it as typed: after Edit the field says "amit"', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user, 'amit')

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(within(screen.getByRole('article', { name: 'Your card' })).getByText("Amit's Pikachu")).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Your name')).toHaveValue('amit')
  })

  it('accepts two names with " & " (16 characters) and shows them on the card in Title Case', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user, 'philip & charlie')

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    const card = screen.getByRole('article', { name: 'Your card' })
    expect(within(card).getByText("Philip & Charlie's Pikachu")).toBeInTheDocument()
  })

  it('a moved sticker stays after Edit → Create; after picking another Pokémon it starts at the default again', async () => {
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

    // Another Pokémon (picked above the card) → the form, then a new card with the sticker at the default place
    await pickPokemon(user, 'char', 'Charmander')
    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(screen.getByRole('button', { name: 'Charmander sticker' })).toHaveStyle({
      left: `${DEFAULT_STICKER_POSITION.x}%`,
      top: `${DEFAULT_STICKER_POSITION.y}%`,
    })
  })

  it('a link to "/create" (e.g. "Create card" in the menu) starts a fresh, empty form', async () => {
    const user = renderPage('/create/25')
    await user.type(await screen.findByLabelText('Your name'), 'Amit')

    await user.click(screen.getByRole('link', { name: 'Menu: Create card' }))

    expect(screen.getByTestId('location')).toHaveTextContent('/create')
    expect(screen.getByLabelText('Your name')).toHaveValue('')
    expect(pokemonField()).toHaveValue('')
  })

  it('shows the 404 page for /create/abc', () => {
    renderPage('/create/abc')
    expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
  })

  it('shows "Pokémon not found" for /create/99999 (the API answers 404)', async () => {
    renderPage('/create/99999')
    expect(await screen.findByText('Pokémon not found')).toBeInTheDocument()
  })

  it('the tab title: "Create card" while loading, then with the Pokémon name', async () => {
    renderPage('/create/25')
    expect(document.title).toBe('Create card · My Poké Card')

    await screen.findByText('Type: Lightning')
    expect(document.title).toBe('Create card with Pikachu · My Poké Card')
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
