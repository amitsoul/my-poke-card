import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AttackList from './AttackList.tsx'

describe('AttackList', () => {
  it('shows each attack as a list item, with damage and cost', () => {
    render(
      <AttackList
        attacks={[
          { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
          { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
        ]}
      />,
    )

    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0]).toHaveTextContent('Thunder Shock — 40 · Cost: Lightning, Colorless')
    expect(items[1]).toHaveTextContent('Quick Attack — 40 · Cost: Lightning, Colorless')
  })

  it('shows an attack without damage (Ditto) without a damage number', () => {
    render(<AttackList attacks={[{ name: 'Transform', damage: null, cost: ['Colorless'] }]} />)

    expect(screen.getByRole('listitem')).toHaveTextContent('Transform · Cost: Colorless')
  })
})
