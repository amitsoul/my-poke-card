import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import CardTypeFilter from './CardTypeFilter.tsx'

const CARD_TYPE_NAMES = [
  'Grass',
  'Fire',
  'Water',
  'Lightning',
  'Psychic',
  'Fighting',
  'Darkness',
  'Metal',
  'Dragon',
  'Colorless',
]

describe('CardTypeFilter', () => {
  it('shows "All" and the 10 card types as buttons', () => {
    render(<CardTypeFilter selectedCardType={null} onChange={vi.fn()} />)

    const group = screen.getByRole('group', { name: 'Filter by type' })
    expect(group).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'All' })).toBeInTheDocument()
    for (const name of CARD_TYPE_NAMES) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('button')).toHaveLength(11)
  })

  it('calls onChange with "Fire" when Fire is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<CardTypeFilter selectedCardType={null} onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: 'Fire' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('Fire')
  })

  it('calls onChange with null when All is clicked', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<CardTypeFilter selectedCardType="Fire" onChange={handleChange} />)

    await user.click(screen.getByRole('button', { name: 'All' }))

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith(null)
  })

  it('marks only the selected type as pressed', () => {
    render(<CardTypeFilter selectedCardType="Water" onChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Water' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button', { name: 'Fire' })).toHaveAttribute('aria-pressed', 'false')
  })
})
