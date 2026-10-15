import { describe, expect, it } from 'vitest'
import { parsePokemonId } from './pokemonId.ts'

describe('parsePokemonId', () => {
  it('turns a whole number from the URL into a number', () => {
    expect(parsePokemonId('25')).toBe(25)
  })

  it('accepts 1, the smallest id', () => {
    expect(parsePokemonId('1')).toBe(1)
  })

  it('returns null for text that is not a number', () => {
    expect(parsePokemonId('abc')).toBeNull()
  })

  it('returns null for 0 and negative numbers', () => {
    expect(parsePokemonId('0')).toBeNull()
    expect(parsePokemonId('-3')).toBeNull()
  })

  it('returns null for a number with decimals', () => {
    expect(parsePokemonId('1.5')).toBeNull()
  })

  it('returns null for an empty or missing value', () => {
    expect(parsePokemonId('')).toBeNull()
    expect(parsePokemonId(undefined)).toBeNull()
  })
})
