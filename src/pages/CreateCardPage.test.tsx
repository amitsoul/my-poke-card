// The whole Create card page: the Change warning, Edit, and starting fresh for another Pokémon.
// The form's own rules (errors, focus, counter) are tested in CardForm.test.tsx.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Link, MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { charmanderDetails, pikachuDetails } from '../test/pokemonFixtures.ts'
import { resizePhoto } from '../utils/photo.ts'
import CreateCardPage from './CreateCardPage.tsx'

// FAKE #2 — resizePhoto (same idea as in CardForm.test.tsx): jsdom can't draw, so only this one
// function is replaced; it answers with a made-up tiny JPEG.
vi.mock('../utils/photo.ts', async (importOriginal) => {
  const real = await importOriginal<typeof import('../utils/photo.ts')>()
  return { ...real, resizePhoto: vi.fn() }
})

const SMALL_JPEG = 'data:image/jpeg;base64,AAAA'

function jsonResponse(data: unknown): Response {
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } })
}

// FAKE #1 — fetch. Instead of the real PokéAPI (slow, needs internet, could change), the browser's fetch
// is replaced by a tiny fake that answers with our own Pikachu or Charmander, or 404 for anything else.
// The page doesn't know the difference: it just gets an answer. (setup.ts puts the real fetch back after each test.)
beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.endsWith('/pokemon/25')) return jsonResponse(pikachuDetails)
      if (url.endsWith('/pokemon/4')) return jsonResponse(charmanderDetails)
      return new Response('Not found', { status: 404 })
    }),
  )
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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(await screen.findByLabelText('Your name'), 'Amit')
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

  it('a full submit shows the summary with the photo; "Edit" keeps everything; "Change" then warns without typing', async () => {
    const user = renderPage('/create/25')
    await fillValidForm(user)

    await user.click(screen.getByRole('button', { name: 'Create my card' }))
    expect(screen.getByText("Amit's Pikachu · HP 30 · Lightning")).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', SMALL_JPEG)
    expect(screen.getByRole('heading', { name: 'Your card' })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByLabelText('Your name')).toHaveValue('Amit')
    expect(screen.getByLabelText('Age (HP)')).toHaveValue('30')
    expect(screen.getByLabelText('Superpower')).toHaveValue('Super speed')
    expect(screen.getByLabelText('About you')).toHaveValue('I love Pokémon cards!')
    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', SMALL_JPEG)

    // Nobody typed after "Edit", but the form is full — so "Change" must still warn
    await user.click(screen.getByRole('button', { name: 'Change' }))
    expect(screen.getByRole('alert')).toBeInTheDocument()
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
})
