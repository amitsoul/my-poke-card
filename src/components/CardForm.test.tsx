// The Create card form on its own: errors, focus, counter and photo.
// The page around it (warning, Edit, reset) is tested in CreateCardPage.test.tsx.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

function renderForm() {
  const onSubmit = vi.fn()
  const onDirtyChange = vi.fn()
  render(<CardForm onSubmit={onSubmit} onDirtyChange={onDirtyChange} />)
  return { onSubmit, onDirtyChange, user: userEvent.setup() }
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

  it('on submit with an empty form: shows all 5 errors and focuses Your name, connected to its error', async () => {
    const { user, onSubmit } = renderForm()

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    for (const error of [
      'Please enter your name',
      'Please enter your age',
      'Please upload an image',
      'Please enter your superpower',
      'Please write something about you',
    ]) {
      expect(screen.getByText(error)).toBeInTheDocument()
    }
    const name = screen.getByLabelText('Your name')
    expect(name).toHaveFocus()
    expect(name).toHaveAttribute('aria-invalid', 'true')
    // aria-describedby points to the error, so a screen reader reads it with the field
    expect(name).toHaveAccessibleDescription('Please enter your name')
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('shows the error BEFORE moving focus, so a screen reader reads the field together with its error', async () => {
    const { user } = renderForm()
    const name = screen.getByLabelText('Your name')
    // Record what the field's description is at the exact moment it receives focus
    let descriptionWhenFocused = ''
    name.addEventListener('focus', () => {
      const errorId = name.getAttribute('aria-describedby') ?? ''
      descriptionWhenFocused = document.getElementById(errorId)?.textContent ?? ''
    })

    await user.click(screen.getByRole('button', { name: 'Create my card' }))

    expect(descriptionWhenFocused).toBe('Please enter your name')
  })

  it('on submit with name and age filled: focuses Photo (the 3rd field), connected to its error', async () => {
    const { user } = renderForm()
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

  it('tells the page whether the form has values (only spaces count as empty)', async () => {
    const { user, onDirtyChange } = renderForm()
    const name = screen.getByLabelText('Your name')

    await user.type(name, 'A')
    expect(onDirtyChange).toHaveBeenLastCalledWith(true)

    await user.clear(name)
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)

    await user.type(name, '   ')
    expect(onDirtyChange).toHaveBeenLastCalledWith(false)
  })

  it('on submit while the photo is preparing: asks to wait', async () => {
    const resize = promiseWeFinishLater()
    vi.mocked(resizePhoto).mockReturnValue(resize.promise) // the fake resize doesn't answer yet
    const { user } = renderForm()

    await user.upload(screen.getByLabelText('Photo'), pngFile())
    expect(screen.getByRole('status')).toHaveTextContent('Preparing your photo...')
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
    const { user, onSubmit } = renderForm()

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
