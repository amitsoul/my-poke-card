// Choosing the attacks with a fake PokéAPI (src/test/fakeApi.ts): which moves, and how many requests.
import { describe, expect, it } from 'vitest'
import { moveResponse, stubPokeApi } from '../test/fakeApi.ts'
import { moveSlot, pikachuDetails } from '../test/pokemonFixtures.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { chooseAttacks } from './moveApi.ts'

const PIKACHU_MOVES = [
  moveResponse('mega-punch', 80, 'Mega Punch'),
  moveResponse('pay-day', 40, 'Pay Day'),
  moveResponse('tail-whip', null, 'Tail Whip'),
  moveResponse('growl', null, 'Growl'),
  moveResponse('thunder-shock', 40, 'Thunder Shock'),
  moveResponse('quick-attack', 40, 'Quick Attack'),
  moveResponse('thunderbolt', 90, 'Thunderbolt'),
]

function withMoves(moves: PokemonDetailsResponse['moves']): PokemonDetailsResponse {
  return { ...pikachuDetails, moves }
}

describe('chooseAttacks', () => {
  it('Pikachu → Thunder Shock + Quick Attack, after only 4 move requests (one batch)', async () => {
    const api = stubPokeApi({ moves: PIKACHU_MOVES })

    const attacks = await chooseAttacks(pikachuDetails, 'Lightning')

    expect(attacks).toEqual([
      { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
      { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
    ])
    expect(api.moveRequests()).toHaveLength(4) // tail-whip, growl, thunder-shock, quick-attack
  })

  it('Ditto (only Transform, no power) → Transform without damage, cost 1 Colorless', async () => {
    const api = stubPokeApi({ moves: [moveResponse('transform', null, 'Transform')] })

    const attacks = await chooseAttacks(withMoves([moveSlot('transform', 1)]), 'Colorless')

    expect(attacks).toEqual([{ name: 'Transform', damage: null, cost: ['Colorless'] }])
    expect(api.moveRequests()).toHaveLength(1)
  })

  it('only 1 move with power → 1 attack (Magikarp: Splash, Tackle, Flail)', async () => {
    stubPokeApi({
      moves: [moveResponse('splash', null, 'Splash'), moveResponse('tackle', 40, 'Tackle'), moveResponse('flail', null, 'Flail')],
    })
    const magikarp = withMoves([moveSlot('splash', 1), moveSlot('tackle', 15), moveSlot('flail', 30)])

    const attacks = await chooseAttacks(magikarp, 'Water')

    expect(attacks).toEqual([{ name: 'Tackle', damage: 40, cost: ['Water', 'Colorless'] }])
  })

  it('no moves at all → Struggle (50, all Colorless), with no move request at all', async () => {
    const api = stubPokeApi({})

    const attacks = await chooseAttacks(withMoves([]), 'Fire')

    expect(attacks).toEqual([{ name: 'Struggle', damage: 50, cost: ['Colorless', 'Colorless'] }])
    expect(api.moveRequests()).toHaveLength(0)
  })

  it('checks at most 20 moves: 25 moves without power → 20 requests, then the first move without damage', async () => {
    const names = Array.from({ length: 25 }, (_, index) => `status-move-${index + 1}`)
    const api = stubPokeApi({ moves: names.map((name) => moveResponse(name, null)) })

    const attacks = await chooseAttacks(withMoves(names.map((name) => moveSlot(name, 1))), 'Psychic')

    expect(api.moveRequests()).toHaveLength(20)
    expect(attacks).toEqual([{ name: 'Status-Move-1', damage: null, cost: ['Colorless'] }])
  })

  it('uses the formatted slug when a move has no English name', async () => {
    stubPokeApi({ moves: [moveResponse('mystery-beam', 60, null)] })

    const attacks = await chooseAttacks(withMoves([moveSlot('mystery-beam', 1)]), 'Psychic')

    expect(attacks).toEqual([{ name: 'Mystery-Beam', damage: 60, cost: ['Psychic', 'Colorless'] }])
  })

  it('uses the cache: a second load for the same Pokémon sends no new move requests', async () => {
    const api = stubPokeApi({ moves: PIKACHU_MOVES })

    await chooseAttacks(pikachuDetails, 'Lightning')
    await chooseAttacks(pikachuDetails, 'Lightning')

    expect(api.moveRequests()).toHaveLength(4)
  })

  it('fails when a move request fails, and does not keep the failure in the cache', async () => {
    stubPokeApi({ moves: PIKACHU_MOVES, failingMoves: ['thunder-shock'] })
    await expect(chooseAttacks(pikachuDetails, 'Lightning')).rejects.toThrow()

    // The server works again: asking again really fetches thunder-shock again, and succeeds
    const api = stubPokeApi({ moves: PIKACHU_MOVES })
    const attacks = await chooseAttacks(pikachuDetails, 'Lightning')
    expect(attacks.map((attack) => attack.name)).toEqual(['Thunder Shock', 'Quick Attack'])
    expect(api.moveRequests().some((url) => url.endsWith('/move/thunder-shock'))).toBe(true)
  })
})
