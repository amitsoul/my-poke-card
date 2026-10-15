import { describe, expect, it } from 'vitest'
import type { CardType } from '../types/pokemon.ts'
import {
  dropResistanceIfSameAsWeakness,
  formatDexNumber,
  formatHeight,
  formatWeight,
  getAttackCost,
  getCardRules,
  getCostCount,
  getResistance,
  getRetreatCost,
  getWeakness,
  roundDamage,
} from './cardRules.ts'

// Every row of the CARD_SPEC.md "Examples" table
describe('getCardRules — the CARD_SPEC examples', () => {
  const examples: {
    pokemon: string
    gameTypes: string[]
    cardType: CardType
    weakness: CardType | null
    resistance: CardType | null
  }[] = [
    { pokemon: 'Pikachu', gameTypes: ['electric'], cardType: 'Lightning', weakness: 'Fighting', resistance: null },
    { pokemon: 'Charmander', gameTypes: ['fire'], cardType: 'Fire', weakness: 'Water', resistance: null },
    { pokemon: 'Gardevoir', gameTypes: ['psychic', 'fairy'], cardType: 'Psychic', weakness: 'Darkness', resistance: 'Fighting' },
    { pokemon: 'Glaceon', gameTypes: ['ice'], cardType: 'Water', weakness: 'Metal', resistance: null },
    { pokemon: 'Pidgey', gameTypes: ['normal', 'flying'], cardType: 'Colorless', weakness: 'Lightning', resistance: 'Fighting' },
    { pokemon: 'Snorlax', gameTypes: ['normal'], cardType: 'Colorless', weakness: 'Fighting', resistance: null },
    { pokemon: 'Dragonite', gameTypes: ['dragon', 'flying'], cardType: 'Dragon', weakness: null, resistance: 'Fighting' },
    { pokemon: 'Zapdos', gameTypes: ['electric', 'flying'], cardType: 'Lightning', weakness: 'Lightning', resistance: 'Fighting' },
    { pokemon: 'Skarmory', gameTypes: ['steel', 'flying'], cardType: 'Metal', weakness: 'Fire', resistance: 'Grass' },
  ]

  for (const example of examples) {
    it(`${example.pokemon} (${example.gameTypes.join(', ')}) → ${example.cardType}, Weakness ${example.weakness ?? 'none'}, Resistance ${example.resistance ?? 'none'}`, () => {
      const rules = getCardRules(example.gameTypes, 60)
      expect(rules.cardType).toBe(example.cardType)
      expect(rules.weakness).toBe(example.weakness)
      expect(rules.resistance).toBe(example.resistance)
    })
  }
})

describe('roundDamage', () => {
  it('keeps a power that is already a multiple of 10', () => {
    expect(roundDamage(40)).toBe(40)
  })

  it('rounds to the nearest 10 (35 → 40, 44 → 40, 15 → 20, 125 → 130)', () => {
    expect(roundDamage(35)).toBe(40)
    expect(roundDamage(44)).toBe(40)
    expect(roundDamage(15)).toBe(20)
    expect(roundDamage(125)).toBe(130)
  })

  it('never goes below 10 (power 4 → 10)', () => {
    expect(roundDamage(4)).toBe(10)
  })
})

describe('getCostCount / getAttackCost', () => {
  it('uses the borders 30/40, 70/80 and 120/130', () => {
    expect([10, 30, 40, 70, 80, 120, 130, 200].map(getCostCount)).toEqual([1, 1, 2, 2, 3, 3, 4, 4])
  })

  it('a power of 35 costs 2, because it rounds to 40 first', () => {
    expect(getCostCount(roundDamage(35))).toBe(2)
  })

  it('starts with the card type, then Colorless', () => {
    expect(getAttackCost(20, 'Lightning')).toEqual(['Lightning'])
    expect(getAttackCost(40, 'Lightning')).toEqual(['Lightning', 'Colorless'])
    expect(getAttackCost(80, 'Fire')).toEqual(['Fire', 'Colorless', 'Colorless'])
    expect(getAttackCost(130, 'Water')).toEqual(['Water', 'Colorless', 'Colorless', 'Colorless'])
  })

  it('a Dragon card pays only Colorless (there is no Dragon Energy)', () => {
    expect(getAttackCost(80, 'Dragon')).toEqual(['Colorless', 'Colorless', 'Colorless'])
  })
})

describe('getWeakness', () => {
  it('follows the fixed table for each card type (no Flying, not Ice-first)', () => {
    const table: [string, CardType | null][] = [
      ['grass', 'Fire'],
      ['fire', 'Water'],
      ['water', 'Lightning'],
      ['electric', 'Fighting'],
      ['psychic', 'Darkness'],
      ['fighting', 'Grass'],
      ['dark', 'Grass'],
      ['steel', 'Fire'],
      ['dragon', null],
      ['normal', 'Fighting'],
    ]
    for (const [gameType, weakness] of table) {
      expect(getWeakness([gameType])).toBe(weakness)
    }
  })

  it('Ice as the first game type → Metal; Ice as the second (Lapras: water, ice) → the normal Water weakness', () => {
    expect(getWeakness(['ice'])).toBe('Metal')
    expect(getWeakness(['water', 'ice'])).toBe('Lightning')
  })

  it('Colorless or Lightning with Flying → Lightning', () => {
    expect(getWeakness(['normal', 'flying'])).toBe('Lightning')
    expect(getWeakness(['flying'])).toBe('Lightning')
    expect(getWeakness(['electric', 'flying'])).toBe('Lightning')
  })
})

describe('getResistance', () => {
  it('Metal resists Grass; Psychic resists Fighting', () => {
    expect(getResistance(['steel'])).toBe('Grass')
    expect(getResistance(['psychic'])).toBe('Fighting')
  })

  it('every Pokémon with Flying resists Fighting (Charizard: fire, flying)', () => {
    expect(getResistance(['fire', 'flying'])).toBe('Fighting')
  })

  it('without one of these rules there is no Resistance', () => {
    expect(getResistance(['fire'])).toBeNull()
    expect(getResistance(['grass', 'poison'])).toBeNull()
  })

  it('safety rule: drops the Resistance when it is the same as the Weakness', () => {
    expect(dropResistanceIfSameAsWeakness('Fighting', 'Fighting')).toBeNull()
    expect(dropResistanceIfSameAsWeakness('Lightning', 'Fighting')).toBe('Fighting')
    expect(dropResistanceIfSameAsWeakness(null, 'Fighting')).toBe('Fighting')
  })
})

describe('getRetreatCost', () => {
  it('uses the weight borders 100 and 1000 hectograms', () => {
    expect(getRetreatCost(99)).toBe(1)
    expect(getRetreatCost(100)).toBe(2)
    expect(getRetreatCost(999)).toBe(2)
    expect(getRetreatCost(1000)).toBe(3)
  })
})

describe('Pokédex strip', () => {
  it('shows the number with 4 digits', () => {
    expect(formatDexNumber(25)).toBe('NO. 0025')
    expect(formatDexNumber(1025)).toBe('NO. 1025')
  })

  it('shows the height in feet and 2-digit inches (Pikachu 4 dm → 1\'04", Charizard 17 dm → 5\'07")', () => {
    expect(formatHeight(4)).toBe(`1'04"`)
    expect(formatHeight(17)).toBe(`5'07"`)
  })

  it('rounds the total inches first, so 6 dm (23.6 in) is 2\'00", not 1\'12"', () => {
    expect(formatHeight(6)).toBe(`2'00"`)
  })

  it('shows the weight in lbs with one decimal', () => {
    expect(formatWeight(60)).toBe('13.2 lbs')
    expect(formatWeight(85)).toBe('18.7 lbs')
    expect(formatWeight(4600)).toBe('1014.1 lbs')
  })
})
