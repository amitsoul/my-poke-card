// Loading all species with a fake PokéAPI (src/test/fakeApi.ts): 2 requests, forms dropped, cached for the visit.
import { describe, expect, it } from 'vitest'
import { stubPokemonList } from '../test/fakeApi.ts'
import { getArtworkUrl } from './api.ts'
import { clearPokemonListCache, loadPokemonList } from './pokemonListApi.ts'

const NAMES: [number, string][] = [
  [1, 'bulbasaur'],
  [4, 'charmander'],
  [25, 'pikachu'],
]

describe('loadPokemonList', () => {
  it('asks for the species count, then that many Pokémon: 2 requests', async () => {
    const api = stubPokemonList(NAMES)

    await loadPokemonList()

    expect(api.requests).toEqual([
      'https://pokeapi.co/api/v2/pokemon-species?limit=1',
      'https://pokeapi.co/api/v2/pokemon?limit=3',
    ])
  })

  it('gives each Pokémon its id (from the url), name and artwork, and drops special forms (10001+)', async () => {
    stubPokemonList(NAMES, { forms: [[10034, 'charizard-mega-x']] })

    const list = await loadPokemonList()

    expect(list.map((pokemon) => pokemon.name)).toEqual(['bulbasaur', 'charmander', 'pikachu'])
    expect(list[2]).toEqual({ id: 25, name: 'pikachu', image: getArtworkUrl(25) })
  })

  it('is cached for the visit: a second page asking (even at the same time) sends no new request', async () => {
    const api = stubPokemonList(NAMES)

    const [first, second] = await Promise.all([loadPokemonList(), loadPokemonList()])
    const third = await loadPokemonList()

    expect(api.requests).toHaveLength(2)
    expect(second).toBe(first)
    expect(third).toBe(first)
  })

  it('does not keep a failure, so "Try again" really asks again', async () => {
    const api = stubPokemonList(NAMES, { failures: 1 })

    await expect(loadPokemonList()).rejects.toThrow()
    const list = await loadPokemonList()

    expect(list).toHaveLength(3)
    expect(api.requests).toHaveLength(3) // the failed count request, then count + list
  })

  it('starts over after clearPokemonListCache (used between tests)', async () => {
    const api = stubPokemonList(NAMES)
    await loadPokemonList()
    clearPokemonListCache()
    await loadPokemonList()
    expect(api.requests).toHaveLength(4)
  })
})
