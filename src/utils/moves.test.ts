import { describe, expect, it } from 'vitest'
import { moveResponse, speciesResponse } from '../test/fakeApi.ts'
import { moveSlot, pikachuDetails } from '../test/pokemonFixtures.ts'
import type { PokemonDetailsResponse } from '../types/pokemon.ts'
import { formatAttack, getEnglishGenus, getMoveCandidates, getMoveName, toAttack, toNoDamageAttack } from './moves.ts'

function withMoves(moves: PokemonDetailsResponse['moves']): PokemonDetailsResponse {
  return { ...pikachuDetails, moves }
}

describe('getMoveCandidates', () => {
  it('puts level-up moves first, then the other moves (Pikachu: TM moves Mega Punch, Pay Day go last)', () => {
    expect(getMoveCandidates(pikachuDetails)).toEqual([
      'tail-whip',
      'growl',
      'thunder-shock',
      'quick-attack',
      'thunderbolt',
      'mega-punch',
      'pay-day',
    ])
  })

  it('sorts level-up moves by the lowest level they are learned at', () => {
    const details = withMoves([moveSlot('thunderbolt', 36), moveSlot('spark', 20), moveSlot('thunder-shock', 1)])
    expect(getMoveCandidates(details)).toEqual(['thunder-shock', 'spark', 'thunderbolt'])
  })

  it('keeps the API order for moves learned at the same level', () => {
    const details = withMoves([moveSlot('growl', 1), moveSlot('tail-whip', 1), moveSlot('thunder-shock', 1)])
    expect(getMoveCandidates(details)).toEqual(['growl', 'tail-whip', 'thunder-shock'])
  })

  it('uses the lowest level when a move is learned at different levels in different games', () => {
    const quickAttack = moveSlot('quick-attack', 16)
    quickAttack.version_group_details.push({ level_learned_at: 1, move_learn_method: { name: 'level-up', url: '' } })
    const details = withMoves([moveSlot('spark', 10), quickAttack])
    expect(getMoveCandidates(details)).toEqual(['quick-attack', 'spark'])
  })

  it('returns an empty list for a Pokémon with no moves', () => {
    expect(getMoveCandidates(withMoves([]))).toEqual([])
  })
})

describe('getMoveName / toAttack / toNoDamageAttack', () => {
  it('uses the English name from the API', () => {
    expect(getMoveName(moveResponse('u-turn', 70, 'U-turn'))).toBe('U-turn')
  })

  it('falls back to the formatted slug when there is no English name', () => {
    expect(getMoveName(moveResponse('thunder-shock', 40, null))).toBe('Thunder-Shock')
  })

  it('turns a move with power into an attack: rounded damage and cost by card type', () => {
    expect(toAttack({ ...moveResponse('thunder-shock', 40, 'Thunder Shock'), power: 40 }, 'Lightning')).toEqual({
      name: 'Thunder Shock',
      damage: 40,
      cost: ['Lightning', 'Colorless'],
    })
    expect(toAttack({ ...moveResponse('ember', 35, 'Ember'), power: 35 }, 'Fire')).toEqual({
      name: 'Ember',
      damage: 40,
      cost: ['Fire', 'Colorless'],
    })
  })

  it('a move without power has no damage and costs 1 Colorless', () => {
    expect(toNoDamageAttack(moveResponse('transform', null, 'Transform'))).toEqual({
      name: 'Transform',
      damage: null,
      cost: ['Colorless'],
    })
  })
})

describe('formatAttack', () => {
  it('shows name, damage and cost', () => {
    expect(formatAttack({ name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] })).toBe(
      'Thunder Shock — 40 · Cost: Lightning, Colorless',
    )
  })

  it('leaves out the damage for an attack without damage', () => {
    expect(formatAttack({ name: 'Transform', damage: null, cost: ['Colorless'] })).toBe('Transform · Cost: Colorless')
  })
})

describe('getEnglishGenus', () => {
  it('returns the English genus', () => {
    expect(getEnglishGenus(speciesResponse('Mouse Pokémon'))).toBe('Mouse Pokémon')
  })

  it('returns null when there is no English genus', () => {
    expect(getEnglishGenus(speciesResponse(null))).toBeNull()
  })
})
