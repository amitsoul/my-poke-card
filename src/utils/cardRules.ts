// The card's rules, exactly as in CARD_SPEC.md "Rules": damage, cost, Weakness, Resistance, Retreat
// and the Pokédex strip. Plain functions (no React, no API), so every rule can be tested on its own.
import type { CardType } from '../types/pokemon.ts'
import { getCardType } from './cardType.ts'

export const WEAKNESS_MULTIPLIER = 2 // shown as "×2"
export const RESISTANCE_AMOUNT = 30 // shown as "−30"

// ---------- Attacks ----------

// Power rounded to the nearest multiple of 10, at least 10: 35 → 40, 15 → 20, 125 → 130, 4 → 10
export function roundDamage(power: number): number {
  return Math.max(10, Math.round(power / 10) * 10)
}

// How many cost symbols an attack needs: 10–30 → 1, 40–70 → 2, 80–120 → 3, 130+ → 4
export function getCostCount(damage: number): number {
  if (damage <= 30) return 1
  if (damage <= 70) return 2
  if (damage <= 120) return 3
  return 4
}

// The cost symbols: the first is the card's Type, the rest Colorless.
// Dragon has no Dragon Energy, so a Dragon card pays only Colorless.
export function getAttackCost(damage: number, cardType: CardType): CardType[] {
  const count = getCostCount(damage)
  const first: CardType = cardType === 'Dragon' ? 'Colorless' : cardType
  const rest = Array<CardType>(count - 1).fill('Colorless')
  return [first, ...rest]
}

// ---------- Weakness, Resistance, Retreat ----------

// The fixed TCG table (CARD_SPEC "Weakness ×2"), before the exceptions
const WEAKNESS_BY_TYPE: Record<CardType, CardType | null> = {
  Grass: 'Fire',
  Fire: 'Water',
  Water: 'Lightning',
  Lightning: 'Fighting',
  Psychic: 'Darkness',
  Fighting: 'Grass',
  Darkness: 'Grass',
  Metal: 'Fire',
  Dragon: null,
  Colorless: 'Fighting',
}

// gameTypes: the Pokémon's game types in slot order, e.g. ['electric', 'flying']
export function getWeakness(gameTypes: string[]): CardType | null {
  const cardType = getCardType(gameTypes)
  const hasFlying = gameTypes.includes('flying')

  if (gameTypes[0] === 'ice') return 'Metal' // Ice as the FIRST game type (Glaceon); Lapras (water, ice) stays Lightning
  if ((cardType === 'Colorless' || cardType === 'Lightning') && hasFlying) return 'Lightning' // Pidgey, Zapdos
  return WEAKNESS_BY_TYPE[cardType]
}

// Safety rule: if Weakness and Resistance ever end up the same Type, drop the Resistance
export function dropResistanceIfSameAsWeakness(weakness: CardType | null, resistance: CardType | null): CardType | null {
  return resistance !== null && resistance === weakness ? null : resistance
}

export function getResistance(gameTypes: string[]): CardType | null {
  const cardType = getCardType(gameTypes)
  let resistance: CardType | null = null

  // The Type rules come first, so they win over the Flying rule (Skarmory: Metal + Flying → Grass)
  if (cardType === 'Metal') resistance = 'Grass'
  else if (cardType === 'Psychic') resistance = 'Fighting'
  else if (gameTypes.includes('flying')) resistance = 'Fighting'

  return dropResistanceIfSameAsWeakness(getWeakness(gameTypes), resistance)
}

// Colorless symbols by weight (hectograms): under 100 → 1, 100–999 → 2, 1000+ → 3
export function getRetreatCost(weight: number): number {
  if (weight < 100) return 1
  if (weight < 1000) return 2
  return 3
}

// Everything the card needs from the game types and weight, in one call
export function getCardRules(
  gameTypes: string[],
  weight: number,
): { cardType: CardType; weakness: CardType | null; resistance: CardType | null; retreat: number } {
  return {
    cardType: getCardType(gameTypes),
    weakness: getWeakness(gameTypes),
    resistance: getResistance(gameTypes),
    retreat: getRetreatCost(weight),
  }
}

// ---------- Pokédex strip ----------

// 25 → "NO. 0025"
export function formatDexNumber(id: number): string {
  return 'NO. ' + String(id).padStart(4, '0')
}

// Decimeters → feet and inches. The total inches are rounded FIRST, then split,
// so 6 dm (23.6 in) becomes 24 in = 2'00" instead of 1'12". Inches always have 2 digits.
export function formatHeight(decimeters: number): string {
  const totalInches = Math.round(decimeters * 3.93701)
  const feet = Math.floor(totalInches / 12)
  const inches = totalInches % 12
  return `${feet}'${String(inches).padStart(2, '0')}"`
}

// Hectograms → pounds, one decimal: 60 → "13.2 lbs"
export function formatWeight(hectograms: number): string {
  return `${(hectograms * 0.220462).toFixed(1)} lbs`
}

// "Weakness: Fighting ×2 · Resistance: none · Retreat: 1" (with a Resistance: "Resistance: Fighting −30")
export function formatWeaknessLine(weakness: CardType | null, resistance: CardType | null, retreat: number): string {
  const weaknessText = weakness === null ? 'none' : `${weakness} ×${WEAKNESS_MULTIPLIER}`
  const resistanceText = resistance === null ? 'none' : `${resistance} −${RESISTANCE_AMOUNT}`
  return `Weakness: ${weaknessText} · Resistance: ${resistanceText} · Retreat: ${retreat}`
}
