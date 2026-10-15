// Small, typed PokéAPI answers for tests (only the fields our code reads).
import type { PokemonDetailsResponse, PokemonMoveSlot } from '../types/pokemon.ts'

// One move slot: learned by level-up at `level`, or (level = null) only by another way, e.g. a TM ("machine")
export function moveSlot(name: string, level: number | null): PokemonMoveSlot {
  return {
    move: { name, url: `https://pokeapi.co/api/v2/move/${name}/` },
    version_group_details: [
      level === null
        ? { level_learned_at: 0, move_learn_method: { name: 'machine', url: '' } }
        : { level_learned_at: level, move_learn_method: { name: 'level-up', url: '' } },
    ],
  }
}

export const pikachuDetails: PokemonDetailsResponse = {
  id: 25,
  name: 'pikachu',
  types: [{ slot: 1, type: { name: 'electric', url: 'https://pokeapi.co/api/v2/type/13/' } }],
  height: 4,
  weight: 60,
  moves: [
    moveSlot('mega-punch', null),
    moveSlot('pay-day', null),
    moveSlot('tail-whip', 1),
    moveSlot('growl', 1),
    moveSlot('thunder-shock', 1),
    moveSlot('quick-attack', 1),
    moveSlot('thunderbolt', 36),
  ],
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
  moves: [moveSlot('scratch', 1), moveSlot('growl', 1), moveSlot('ember', 4)],
  sprites: {
    other: {
      'official-artwork': {
        front_default:
          'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
      },
    },
  },
}
