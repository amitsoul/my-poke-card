import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getWeaknessValue } from '../test/cardQueries.ts'
import WeaknessRow from './WeaknessRow.tsx'

describe('WeaknessRow', () => {
  it('is a description list with the 3 terms', () => {
    render(<WeaknessRow weakness="Fighting" resistance={null} retreat={1} />)
    expect(screen.getAllByRole('term').map((term) => term.textContent)).toEqual(['Weakness', 'Resistance', 'Retreat'])
  })

  it('Pikachu: Weakness Fighting ×2, Resistance none, Retreat 1', () => {
    const { container } = render(<WeaknessRow weakness="Fighting" resistance={null} retreat={1} />)
    expect(getWeaknessValue(container, 'Weakness')).toBe('Fighting ×2')
    expect(getWeaknessValue(container, 'Resistance')).toBe('none')
    expect(getWeaknessValue(container, 'Retreat')).toBe('Colorless')
  })

  it('Gardevoir: a Resistance with −30, Retreat 2', () => {
    const { container } = render(<WeaknessRow weakness="Darkness" resistance="Fighting" retreat={2} />)
    expect(getWeaknessValue(container, 'Weakness')).toBe('Darkness ×2')
    expect(getWeaknessValue(container, 'Resistance')).toBe('Fighting −30')
    expect(getWeaknessValue(container, 'Retreat')).toBe('Colorless, Colorless')
  })

  it('Dragonite: no Weakness, Retreat 3 as one image of 3 symbols', () => {
    const { container } = render(<WeaknessRow weakness={null} resistance="Fighting" retreat={3} />)
    expect(getWeaknessValue(container, 'Weakness')).toBe('none')
    expect(screen.getByRole('img', { name: 'Colorless, Colorless, Colorless' })).toBeInTheDocument()
  })
})
