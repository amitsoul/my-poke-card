import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FavoriteButton from './FavoriteButton.tsx'

describe('FavoriteButton', () => {
  it('is a toggle button named after the card, not pressed when not a favorite', () => {
    render(<FavoriteButton cardNumber={1} favorite={false} onToggle={vi.fn()} />)
    expect(screen.getByRole('button', { name: 'Favorite MPC 001' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('is pressed (and red) when the card is a favorite', () => {
    render(<FavoriteButton cardNumber={1} favorite onToggle={vi.fn()} />)
    const heart = screen.getByRole('button', { name: 'Favorite MPC 001' })
    expect(heart).toHaveAttribute('aria-pressed', 'true')
    expect(heart).toHaveClass('is-favorite')
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<FavoriteButton cardNumber={1} favorite={false} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: 'Favorite MPC 001' }))

    expect(onToggle).toHaveBeenCalledTimes(1)
  })
})
