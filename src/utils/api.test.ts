import { describe, expect, it } from 'vitest'
import { getIdFromUrl, getSpriteUrl } from './api.ts'

describe('getIdFromUrl', () => {
  it('reads the id from a PokéAPI link with a trailing slash', () => {
    expect(getIdFromUrl('https://pokeapi.co/api/v2/pokemon/25/')).toBe(25)
  })

  it('reads the id from a link without a trailing slash', () => {
    expect(getIdFromUrl('https://pokeapi.co/api/v2/pokemon/25')).toBe(25)
  })
})

describe('getSpriteUrl', () => {
  it('builds the small sprite URL from the id (no request needed)', () => {
    expect(getSpriteUrl(25)).toBe('https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png')
  })
})
