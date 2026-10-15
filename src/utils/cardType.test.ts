import { describe, expect, it } from 'vitest'
import { getCardType, parseCardType } from './cardType.ts'

describe('parseCardType', () => {
  it('accepts our card type names from the URL', () => {
    expect(parseCardType('Fire')).toBe('Fire')
    expect(parseCardType('Colorless')).toBe('Colorless')
  })

  it('is case-sensitive: "fire" is not accepted', () => {
    expect(parseCardType('fire')).toBeNull()
  })

  it('rejects types that are not TCG card types, like "Fairy"', () => {
    expect(parseCardType('Fairy')).toBeNull()
  })

  it('rejects random text', () => {
    expect(parseCardType('abc')).toBeNull()
  })

  it('returns null for an empty or missing value', () => {
    expect(parseCardType('')).toBeNull()
    expect(parseCardType(null)).toBeNull()
  })
})

describe('getCardType', () => {
  it('maps a game type to its card type (ghost → Psychic)', () => {
    expect(getCardType(['ghost'])).toBe('Psychic')
  })

  it('maps normal/flying to Colorless', () => {
    expect(getCardType(['normal', 'flying'])).toBe('Colorless')
  })

  it('uses only the FIRST game type (grass/poison → Grass, not Darkness)', () => {
    expect(getCardType(['grass', 'poison'])).toBe('Grass')
  })

  it('maps ice to Water', () => {
    expect(getCardType(['ice'])).toBe('Water')
  })

  it('maps fairy to Psychic (Fairy was retired from the TCG in 2020)', () => {
    expect(getCardType(['fairy'])).toBe('Psychic')
  })

  it('falls back to Colorless for an unknown type', () => {
    expect(getCardType(['unknown'])).toBe('Colorless')
  })
})
