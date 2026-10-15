import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { CardType } from '../types/pokemon.ts'
import { TYPE_THEME } from '../utils/cardTheme.ts'
import { CARD_TYPES } from '../utils/cardType.ts'
import TypeSymbol from './TypeSymbol.tsx'

const ALL_TYPES: CardType[] = CARD_TYPES.map((cardType) => cardType.name)

describe('TypeSymbol', () => {
  it('is an image named after its Type, for every Type', () => {
    for (const type of ALL_TYPES) {
      render(<TypeSymbol type={type} />)
      expect(screen.getByRole('img', { name: type })).toBeInTheDocument()
    }
  })

  it("uses the Type's circle color", () => {
    const { container } = render(<TypeSymbol type="Water" />)
    expect(container.querySelector('circle')).toHaveAttribute('fill', TYPE_THEME.Water.color)
  })

  it('draws a different icon for every Type', () => {
    const drawings = ALL_TYPES.map((type) => {
      const { container, unmount } = render(<TypeSymbol type={type} />)
      // The icon = everything after the circle, without the color (so only the shape is compared)
      const svg = container.querySelector('svg')
      const markup = (svg?.innerHTML ?? '').replaceAll(TYPE_THEME[type].color, 'BG')
      unmount()
      return markup
    })
    expect(new Set(drawings).size).toBe(10)
  })

  it('decorative: hidden from screen readers (used inside a group that already has a name)', () => {
    const { container } = render(<TypeSymbol type="Colorless" decorative />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses the given size, and a default size otherwise', () => {
    const { container, rerender } = render(<TypeSymbol type="Fire" size="26px" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '26px')
    rerender(<TypeSymbol type="Fire" />)
    expect(container.querySelector('svg')).toHaveAttribute('width', '1.25em')
  })
})
