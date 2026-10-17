import { describe, expect, it } from 'vitest'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { formatPokemonName, getDetailsImage, getGameTypes, toCardPokemon } from './pokemonDetails.ts'

describe('formatPokemonName', () => {
  it('capitalizes a simple name ("pikachu" → "Pikachu")', () => {
    expect(formatPokemonName('pikachu')).toBe('Pikachu')
  })

  it('capitalizes every part of a hyphenated name ("ho-oh" → "Ho-Oh", "mr-mime" → "Mr-Mime")', () => {
    expect(formatPokemonName('ho-oh')).toBe('Ho-Oh')
    expect(formatPokemonName('mr-mime')).toBe('Mr-Mime')
  })
})

describe('getGameTypes', () => {
  it('returns the game types in slot order, even when the API sends slot 2 first', () => {
    const gengar: PokemonDetailsResponse = {
      ...pikachuDetails,
      id: 94,
      name: 'gengar',
      types: [
        { slot: 2, type: { name: 'poison', url: 'https://pokeapi.co/api/v2/type/4/' } },
        { slot: 1, type: { name: 'ghost', url: 'https://pokeapi.co/api/v2/type/8/' } },
      ],
    }
    expect(getGameTypes(gengar)).toEqual(['ghost', 'poison'])
  })
})

describe('getDetailsImage', () => {
  it('uses the official artwork from the response', () => {
    expect(getDetailsImage(pikachuDetails)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    )
  })

  it('falls back to the artwork URL built from the id when the response has none', () => {
    const noArtwork: PokemonDetailsResponse = {
      ...pikachuDetails,
      sprites: { other: { 'official-artwork': { front_default: null } } },
    }
    expect(getDetailsImage(noArtwork)).toBe(
      'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    )
  })
})

describe('toCardPokemon', () => {
  it('keeps only what the card needs: id, name, game types in slot order, height, weight, artwork', () => {
    expect(toCardPokemon(pikachuDetails)).toEqual({
      id: 25,
      name: 'pikachu',
      gameTypes: ['electric'],
      height: 4,
      weight: 60,
      artworkUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
    })
  })
})
