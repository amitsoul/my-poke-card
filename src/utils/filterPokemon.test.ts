import { describe, expect, it } from 'vitest'
import type { PokemonSummary } from '../types/pokemon.ts'
import { filterPokemon, normalizeSearch } from './filterPokemon.ts'

// A small list, enough to test every rule
const bulbasaur: PokemonSummary = { id: 1, name: 'bulbasaur', image: '1.png' }
const charmander: PokemonSummary = { id: 4, name: 'charmander', image: '4.png' }
const pikachu: PokemonSummary = { id: 25, name: 'pikachu', image: '25.png' }
const raichu: PokemonSummary = { id: 26, name: 'raichu', image: '26.png' }
const mrMime: PokemonSummary = { id: 122, name: 'mr-mime', image: '122.png' }
const list = [bulbasaur, charmander, pikachu, raichu, mrMime]

describe('filterPokemon', () => {
  it('returns the whole list for an empty search and no card type', () => {
    expect(filterPokemon(list, '', null)).toEqual(list)
  })

  it('ignores capital letters and spaces around the search ("  PIKA " finds pikachu)', () => {
    expect(filterPokemon(list, '  PIKA ', null)).toEqual([pikachu])
  })

  it('matches the search anywhere in the name ("chu" finds pikachu and raichu)', () => {
    expect(filterPokemon(list, 'chu', null)).toEqual([pikachu, raichu])
  })

  it('keeps only the ids in the set when a card type is selected', () => {
    const lightningIds = new Set([25, 26])
    expect(filterPokemon(list, '', lightningIds)).toEqual([pikachu, raichu])
  })

  it('needs BOTH the search and the card type to match', () => {
    const lightningIds = new Set([25, 26])
    expect(filterPokemon(list, 'rai', lightningIds)).toEqual([raichu])
    // "char" matches charmander, but charmander isn't in the set
    expect(filterPokemon(list, 'char', lightningIds)).toEqual([])
  })

  it('treats a space inside the search like a hyphen ("mr mime" finds mr-mime)', () => {
    expect(filterPokemon(list, 'mr mime', null)).toEqual([mrMime])
    expect(filterPokemon(list, 'Mr  Mime', null)).toEqual([mrMime]) // several spaces count as one hyphen
    expect(filterPokemon(list, 'mr-mime', null)).toEqual([mrMime])
  })

  it('returns an empty list when nothing matches', () => {
    expect(filterPokemon(list, 'zzz', null)).toEqual([])
  })
})

describe('normalizeSearch', () => {
  it('trims, lowercases, and turns spaces inside the text into a hyphen', () => {
    expect(normalizeSearch('  PIKA ')).toBe('pika')
    expect(normalizeSearch(' Mr \t Mime ')).toBe('mr-mime')
    expect(normalizeSearch('   ')).toBe('')
  })
})
