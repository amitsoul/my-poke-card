import { describe, expect, it } from 'vitest'
import { CARD_TYPES } from './cardType.ts'
import { contrastRatio, getNameFontSize, TYPE_THEME } from './cardTheme.ts'

describe('contrastRatio', () => {
  it('gives the known WCAG values: black on white is 21, a color with itself is 1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5)
    expect(contrastRatio('#A67C00', '#A67C00')).toBeCloseTo(1, 5)
  })

  it('is the same in both directions', () => {
    expect(contrastRatio('#FFFFFF', '#2A78C4')).toBeCloseTo(contrastRatio('#2A78C4', '#FFFFFF'), 10)
  })

  it("shows why the mockup's Lightning color was changed: #C99A00 is below 3:1, #A67C00 is above", () => {
    expect(contrastRatio('#FFFFFF', '#C99A00')).toBeLessThan(3)
    expect(contrastRatio('#FFFFFF', '#A67C00')).toBeGreaterThanOrEqual(3)
  })
})

describe('TYPE_THEME', () => {
  it('has a theme for each of the 10 card types', () => {
    expect(Object.keys(TYPE_THEME).sort()).toEqual(CARD_TYPES.map((cardType) => cardType.name).sort())
  })

  it('every circle has at least 3:1 contrast with its white icon (WCAG 1.4.11)', () => {
    for (const [cardType, theme] of Object.entries(TYPE_THEME)) {
      expect(contrastRatio('#FFFFFF', theme.color), `${cardType} ${theme.color}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('every Type has its own circle color', () => {
    const colors = Object.values(TYPE_THEME).map((theme) => theme.color)
    expect(new Set(colors).size).toBe(10)
  })

  it('the strip is a bit darker than the panel, and both stay light enough for the dark text', () => {
    for (const [cardType, theme] of Object.entries(TYPE_THEME)) {
      expect(contrastRatio('#FFFFFF', theme.stripTint), cardType).toBeGreaterThan(contrastRatio('#FFFFFF', theme.tint))
      // The card's text color #1E1B14 must stay very readable on the strip (WCAG AA for text: 4.5:1)
      expect(contrastRatio('#1E1B14', theme.stripTint), cardType).toBeGreaterThanOrEqual(4.5)
    }
  })
})

describe('getNameFontSize', () => {
  it(`keeps the full 23px for names up to 16 characters ("Amit's Pikachu")`, () => {
    expect(getNameFontSize("Amit's Pikachu")).toBe(23)
    expect(getNameFontSize('a'.repeat(16))).toBe(23)
  })

  it('uses 19px for 17–22 characters and 16px for 23–29', () => {
    expect(getNameFontSize('a'.repeat(17))).toBe(19)
    expect(getNameFontSize('a'.repeat(22))).toBe(19)
    expect(getNameFontSize('a'.repeat(23))).toBe(16)
    expect(getNameFontSize('a'.repeat(29))).toBe(16)
  })

  it('uses 14px for 30+ characters (the name may then wrap to 2 lines)', () => {
    expect(getNameFontSize('a'.repeat(30))).toBe(14)
    expect(getNameFontSize("Bartholomewz's Squawkabilly-Green-Plumage")).toBe(14) // 41 characters
  })
})
