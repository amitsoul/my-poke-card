import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getAttackRows } from '../test/cardQueries.ts'
import AttackList from './AttackList.tsx'

describe('AttackList', () => {
  it('shows each attack as a row: cost symbols, name, damage', () => {
    const { container } = render(
      <AttackList
        attacks={[
          { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
          { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
        ]}
      />,
    )

    expect(getAttackRows(container)).toEqual([
      'Cost: Lightning, Colorless | Thunder Shock | 40',
      'Cost: Lightning, Colorless | Quick Attack | 40',
    ])
  })

  it('the cost symbols are ONE image for screen readers, not one per symbol', () => {
    render(<AttackList attacks={[{ name: 'Hurricane', damage: 110, cost: ['Colorless', 'Colorless', 'Colorless'] }]} />)

    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.getByRole('img', { name: 'Cost: Colorless, Colorless, Colorless' })).toBeInTheDocument()
  })

  it('makes the cost column as wide as the attack with the most symbols in the list', () => {
    const { container, rerender } = render(
      <AttackList
        attacks={[
          { name: 'Wing Attack', damage: 60, cost: ['Colorless', 'Colorless'] },
          { name: 'Hurricane', damage: 110, cost: ['Colorless', 'Colorless', 'Colorless'] },
        ]}
      />,
    )
    const list = () => container.querySelector('ul') as HTMLElement
    expect(list().style.getPropertyValue('--cost-slots')).toBe('3')

    rerender(<AttackList attacks={[{ name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] }]} />)
    expect(list().style.getPropertyValue('--cost-slots')).toBe('2')
  })

  it('shows an attack without damage (Ditto) with an empty damage cell', () => {
    const { container } = render(<AttackList attacks={[{ name: 'Transform', damage: null, cost: ['Colorless'] }]} />)

    expect(getAttackRows(container)).toEqual(['Cost: Colorless | Transform | '])
  })
})
