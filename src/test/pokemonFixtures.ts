// Small, typed PokéAPI answers for tests (only the fields our code reads).
import type { PokemonDetailsResponse } from '../types/pokemon.ts'

export const pikachuDetails: PokemonDetailsResponse = {
  id: 25,
  name: 'pikachu',
  types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } }],
  height: 4,
  weight: 60,
  sprites: {
    other: {
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      },
    },
  },
}

export const charmanderDetails: PokemonDetailsResponse = {
  id: 4,
  name: 'charmander',
  types: [{ slot: 1, type: { name: 'fire', url: 'https://pokeapi.co/api/v2/type/10/' } }],
  height: 6,
  weight: 85,
  sprites: {
    other: {
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
      },
    },
  },
}
