import { describe, expect, it } from 'vitest'
import type { PokemonSummary } from '../types/pokemon.ts'
import { findExactPokemon, findPokemonMatches, MAX_MATCHES } from './pokemonSearch.ts'

function pokemon(id: number, name: string): PokemonSummary {
  return { id, name, image: '' }
}

// Not in number order on purpose: the search sorts by number itself
const LIST = [
  pokemon(731, 'pikipek'),
  pokemon(25, 'pikachu'),
  pokemon(26, 'raichu'),
  pokemon(10, 'caterpie'),
  pokemon(172, 'pichu'),
  pokemon(122, 'mr-mime'),
]

const names = (list: PokemonSummary[]) => list.map((item) => item.name)

describe('findPokemonMatches', () => {
  it('finds names that contain the text, ignoring case and spaces around it', () => {
    expect(names(findPokemonMatches(LIST, '  CHU '))).toEqual(['pikachu', 'raichu', 'pichu'])
  })

  it('shows names that START with the text first, then the others; each group by number', () => {
    // pikachu (25), pichu (172), pikipek (731) start with "pi"; caterpie (10) only contains it
    expect(names(findPokemonMatches(LIST, 'pi'))).toEqual(['pikachu', 'pichu', 'pikipek', 'caterpie'])
  })

  it(`shows at most ${MAX_MATCHES}`, () => {
    const many = Array.from({ length: 25 }, (_, index) => pokemon(index + 1, `pokemon-${index + 1}`))
    expect(findPokemonMatches(many, 'pokemon')).toHaveLength(MAX_MATCHES)
    expect(findPokemonMatches(many, 'pokemon', 3)).toHaveLength(3)
  })

  it('finds nothing for an empty text (the list stays closed) or a name that does not exist', () => {
    expect(findPokemonMatches(LIST, '   ')).toEqual([])
    expect(findPokemonMatches(LIST, 'zzz')).toEqual([])
  })

  it('treats a space like a hyphen, the same rule as the list page ("mr mime" finds mr-mime)', () => {
    expect(names(findPokemonMatches(LIST, 'mr mime'))).toEqual(['mr-mime'])
    expect(names(findPokemonMatches(LIST, 'MR M'))).toEqual(['mr-mime'])
  })
})

describe('findExactPokemon', () => {
  it('finds the Pokémon whose name is exactly the text, as written by the API or as we show it, any case', () => {
    expect(findExactPokemon(LIST, 'pikachu')?.id).toBe(25)
    expect(findExactPokemon(LIST, ' PIKACHU ')?.id).toBe(25)
    expect(findExactPokemon(LIST, 'Mr-Mime')?.id).toBe(122)
    expect(findExactPokemon(LIST, 'mr mime')?.id).toBe(122) // a space counts as a hyphen
  })

  it('is null for part of a name or an empty text', () => {
    expect(findExactPokemon(LIST, 'pika')).toBeNull()
    expect(findExactPokemon(LIST, '')).toBeNull()
  })
})
