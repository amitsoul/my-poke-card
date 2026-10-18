import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Logo, { LETTERS_PATH, LOGO_VIEW_BOX, STAR_PATH } from './Logo.tsx'

// Every pair of numbers in a path made of M, L, Q and Z commands is a point (x, y)
function points(path: string): [number, number][] {
  const numbers = (path.match(/-?\d*\.?\d+/g) ?? []).map(Number)
  const result: [number, number][] = []
  for (let index = 0; index < numbers.length; index += 2) result.push([numbers[index], numbers[index + 1]])
  return result
}

describe('Logo', () => {
  it('is one image named "My Poké Card" (screen readers read the name, not the drawn letters)', () => {
    render(<Logo />)
    expect(screen.getByRole('img', { name: 'My Poké Card' })).toBeInTheDocument()
  })

  it('draws the cream band, the blue letters and the yellow star', () => {
    const { container } = render(<Logo />)
    const fills = [...container.querySelectorAll('path')].map((path) => path.getAttribute('fill'))
    expect(fills).toEqual(['#FFF6DE', '#4A78A8', '#E9B949'])
  })

  // Like the Type symbols: the letters and the star use only straight lines and curves with absolute points,
  // so if every point is inside the viewBox, nothing of the logo is cut off
  it('every point of the letters and the star is inside the viewBox', () => {
    expect(LETTERS_PATH).toMatch(/^[MLQZ\d .-]+$/)
    expect(STAR_PATH).toMatch(/^[MLZ\d .-]+$/)
    const [left, top, width, height] = LOGO_VIEW_BOX.split(' ').map(Number)

    for (const [x, y] of [...points(LETTERS_PATH), ...points(STAR_PATH)]) {
      expect(x, `x ${x}`).toBeGreaterThanOrEqual(left)
      expect(x, `x ${x}`).toBeLessThanOrEqual(left + width)
      expect(y, `y ${y}`).toBeGreaterThanOrEqual(top)
      expect(y, `y ${y}`).toBeLessThanOrEqual(top + height)
    }
  })
})
