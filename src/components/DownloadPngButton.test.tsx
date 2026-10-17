import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { downloadCardPng } from '../utils/downloadCardPng.ts'
import DownloadPngButton from './DownloadPngButton.tsx'

// The real download needs real drawing; here we only check what the button asks for and shows
vi.mock('../utils/downloadCardPng.ts', () => ({ downloadCardPng: vi.fn() }))

// The button inside a card <article>, like on the Create page and in My Cards
function renderInCard() {
  render(
    <article>
      <div className="poke-card-frame" data-testid="frame" />
      <DownloadPngButton fileName="amits-pikachu-mpc-001.png" />
    </article>,
  )
  return userEvent.setup()
}

describe('DownloadPngButton', () => {
  it('downloads its own card frame with the file name', async () => {
    vi.mocked(downloadCardPng).mockResolvedValue()
    const user = renderInCard()

    await user.click(screen.getByRole('button', { name: 'Download PNG' }))

    expect(downloadCardPng).toHaveBeenCalledWith(screen.getByTestId('frame'), 'amits-pikachu-mpc-001.png')
  })

  it('shows "Preparing PNG..." (busy) while working, and "Download PNG" again after', async () => {
    let finish: () => void = () => {}
    vi.mocked(downloadCardPng).mockReturnValue(
      new Promise<void>((resolve) => {
        finish = resolve
      }),
    )
    const user = renderInCard()

    await user.click(screen.getByRole('button', { name: 'Download PNG' }))
    const busy = screen.getByRole('button', { name: 'Preparing PNG...' })
    expect(busy).toHaveAttribute('aria-busy', 'true')

    await user.click(busy) // a second click while working does nothing
    expect(downloadCardPng).toHaveBeenCalledTimes(1)

    finish()
    expect(await screen.findByRole('button', { name: 'Download PNG' })).toHaveAttribute('aria-busy', 'false')
  })

  it('shows the error message when the PNG fails', async () => {
    vi.mocked(downloadCardPng).mockRejectedValue(new Error('The card could not be drawn'))
    const user = renderInCard()

    await user.click(screen.getByRole('button', { name: 'Download PNG' }))

    expect(await screen.findByRole('alert')).toHaveTextContent("Sorry, the PNG couldn't be created. Please try again.")
  })
})
