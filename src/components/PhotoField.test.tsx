import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { CardPhoto } from '../utils/cardForm.ts'
import PhotoField from './PhotoField.tsx'

const readyPhoto: CardPhoto = { dataUrl: 'data:image/jpeg;base64,AAAA', type: 'image/jpeg', size: 3 }

describe('PhotoField', () => {
  it('without a photo: shows "Choose a photo" and the hint', () => {
    render(<PhotoField photo={{ status: 'empty' }} error={undefined} onSelect={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByText('Choose a photo')).toBeInTheDocument()
    expect(screen.getByText('JPG, PNG or WebP, up to 10 MB')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('while preparing: shows "Preparing your photo..."', () => {
    render(<PhotoField photo={{ status: 'preparing' }} error={undefined} onSelect={vi.fn()} onRemove={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent('Preparing your photo...')
  })

  it('with a photo: shows the preview, "Choose another photo" and "Remove photo"', async () => {
    const user = userEvent.setup()
    const handleRemove = vi.fn()
    render(
      <PhotoField photo={{ status: 'ready', photo: readyPhoto }} error={undefined} onSelect={vi.fn()} onRemove={handleRemove} />,
    )

    expect(screen.getByRole('img', { name: 'Your photo' })).toHaveAttribute('src', readyPhoto.dataUrl)
    expect(screen.getByText('Choose another photo')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Remove photo' }))
    expect(handleRemove).toHaveBeenCalledTimes(1)
  })

  it('choosing an image calls onSelect with that file', async () => {
    const user = userEvent.setup()
    const handleSelect = vi.fn()
    render(<PhotoField photo={{ status: 'empty' }} error={undefined} onSelect={handleSelect} onRemove={vi.fn()} />)
    const file = new File(['photo'], 'me.png', { type: 'image/png' })

    await user.upload(screen.getByLabelText('Photo'), file)

    expect(handleSelect).toHaveBeenCalledWith(file)
  })

  it('the file picker only offers JPG, PNG and WebP: a PDF is not passed on', async () => {
    const user = userEvent.setup() // like the real picker, upload() respects the accept list
    const handleSelect = vi.fn()
    render(<PhotoField photo={{ status: 'empty' }} error={undefined} onSelect={handleSelect} onRemove={vi.fn()} />)

    await user.upload(screen.getByLabelText('Photo'), new File(['%PDF'], 'cv.pdf', { type: 'application/pdf' }))

    expect(handleSelect).not.toHaveBeenCalled()
  })

  it('shows the error and connects it to the input', () => {
    render(
      <PhotoField photo={{ status: 'empty' }} error="Please upload an image" onSelect={vi.fn()} onRemove={vi.fn()} />,
    )

    const input = screen.getByLabelText('Photo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAccessibleDescription(/Please upload an image/)
  })
})
