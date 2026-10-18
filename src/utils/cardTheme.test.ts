import { describe, expect, it } from 'vitest'
import { CARD_TYPES } from './cardType.ts'
import {
  CARD_RED,
  CARD_TEXT_COLOR,
  colorDistance,
  contrastRatio,
  getNameFontSize,
  TYPE_THEME,
} from './cardTheme.ts'

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

  // The symbols sit on the card's panel, so each circle must also stand out from its own tint
  it("each Type's symbol has at least 3:1 against its own tint (WCAG 1.4.11)", () => {
    for (const [cardType, theme] of Object.entries(TYPE_THEME)) {
      expect(contrastRatio(theme.color, theme.tint), `${cardType} ${theme.color} on ${theme.tint}`).toBeGreaterThanOrEqual(3)
    }
  })

  it('every Type has its own circle color', () => {
    const colors = Object.values(TYPE_THEME).map((theme) => theme.color)
    expect(new Set(colors).size).toBe(10)
  })

  it('the strip is a bit darker than the panel', () => {
    for (const [cardType, theme] of Object.entries(TYPE_THEME)) {
      expect(contrastRatio('#FFFFFF', theme.stripTint), cardType).toBeGreaterThan(contrastRatio('#FFFFFF', theme.tint))
    }
  })

  // WCAG AA for normal text: at least 4.5:1
  it('the dark text is readable on every tint and strip, and the red HP/Ability text on every tint', () => {
    for (const [cardType, theme] of Object.entries(TYPE_THEME)) {
      expect(contrastRatio(CARD_TEXT_COLOR, theme.tint), `${cardType} tint`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(CARD_TEXT_COLOR, theme.stripTint), `${cardType} strip`).toBeGreaterThanOrEqual(4.5)
      expect(contrastRatio(CARD_RED, theme.tint), `${cardType} red`).toBeGreaterThanOrEqual(4.5)
    }
  })

  // Before task 12e2, Darkness/Metal (4.2), Fire/Fighting (4.9) and Metal/Colorless (5.0) looked alike
  it('no two Types have tints that look alike (ΔE76 at least 12 for every pair)', () => {
    const themes = Object.entries(TYPE_THEME)
    for (const [index, [typeA, themeA]] of themes.entries()) {
      for (const [typeB, themeB] of themes.slice(index + 1)) {
        expect(colorDistance(themeA.tint, themeB.tint), `${typeA} / ${typeB}`).toBeGreaterThanOrEqual(12)
      }
    }
  })
})

describe('colorDistance (ΔE76)', () => {
  it('is 0 for the same color and 100 between black and white (lightness 0 → 100)', () => {
    expect(colorDistance('#3E8E3A', '#3E8E3A')).toBe(0)
    expect(colorDistance('#000000', '#FFFFFF')).toBeCloseTo(100, 1)
  })

  it('a tiny step is small, a different color is big', () => {
    expect(colorDistance('#808080', '#828282')).toBeLessThan(1)
    expect(colorDistance('#FBCDC2', '#C4DEFB')).toBeGreaterThan(20) // the Fire and Water tints
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
