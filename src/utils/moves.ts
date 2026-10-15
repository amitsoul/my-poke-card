// Turning a Pokémon's moves into card attacks (CARD_SPEC.md "Attacks"). Plain functions, no API.
import type { CardType, MoveResponse, PokemonDetailsResponse, SpeciesResponse } from '../types/pokemon.ts'
import { getAttackCost, roundDamage } from './cardRules.ts'
import { formatPokemonName } from './pokemonDetails.ts'

// One attack on the card. damage = null: a move without power (Ditto's Transform) — no damage number.
export interface Attack {
  name: string
  damage: number | null
  cost: CardType[]
}

// When a Pokémon has no moves at all: Struggle, the attack Pokémon use in the games when they have no moves.
// All Colorless, because Struggle has no type (an exception to "the first symbol is the card's Type").
export const STRUGGLE: Attack = { name: 'Struggle', damage: 50, cost: ['Colorless', 'Colorless'] }

// The order to try the moves in: moves learned by leveling up first, lowest level first
// (ties keep the API's order), then all other moves in the API's order.
// Why: the API starts with old TM moves (Pikachu: Mega Punch, Pay Day); level-up order gives
// Pikachu Thunder Shock + Quick Attack, like its real cards.
export function getMoveCandidates(details: PokemonDetailsResponse): string[] {
  const withLevel = details.moves.map((slot, apiIndex) => {
    const levels = slot.version_group_details
      .filter((detail) => detail.move_learn_method.name === 'level-up')
      .map((detail) => detail.level_learned_at)
    return { name: slot.move.name, apiIndex, level: levels.length > 0 ? Math.min(...levels) : null }
  })

  const levelUp = withLevel
    .filter((move) => move.level !== null)
    .sort((a, b) => (a.level ?? 0) - (b.level ?? 0) || a.apiIndex - b.apiIndex)
  const others = withLevel.filter((move) => move.level === null)

  return [...levelUp, ...others].map((move) => move.name)
}

// The English name from the API ("Thunder Shock", "U-turn"), or the formatted slug if there is none
export function getMoveName(move: MoveResponse): string {
  const english = move.names.find((item) => item.language.name === 'en')
  return english !== undefined ? english.name : formatPokemonName(move.name)
}

// A move with power → an attack: damage rounded to 10 (at least 10), cost by damage and card type
export function toAttack(move: MoveResponse & { power: number }, cardType: CardType): Attack {
  const damage = roundDamage(move.power)
  return { name: getMoveName(move), damage, cost: getAttackCost(damage, cardType) }
}

// A move without power (when the Pokémon has none with power) → no damage number, cost 1 Colorless
export function toNoDamageAttack(move: MoveResponse): Attack {
  return { name: getMoveName(move), damage: null, cost: ['Colorless'] }
}

// Does this move have power? (status moves and variable-power moves have power: null)
export function hasPower(move: MoveResponse): move is MoveResponse & { power: number } {
  return move.power !== null
}

// "Mouse Pokémon" — or null if the species has no English genus (then the card leaves it out)
export function getEnglishGenus(species: SpeciesResponse): string | null {
  const english = species.genera.find((item) => item.language.name === 'en')
  return english !== undefined ? english.genus : null
}
