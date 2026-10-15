import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import SearchBar from './SearchBar.tsx'

describe('SearchBar', () => {
  it('shows the value it receives', () => {
    render(<SearchBar value="pika" onChange={vi.fn()} />)

    expect(screen.getByRole('searchbox', { name: 'Search Pokémon by name' })).toHaveValue('pika')
  })

  it('calls onChange with the text when the user types a letter', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()
    render(<SearchBar value="" onChange={handleChange} />)

    await user.type(screen.getByRole('searchbox', { name: 'Search Pokémon by name' }), 'p')

    expect(handleChange).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenCalledWith('p')
  })
})
