// The 10 TCG card types and the Pokémon game types that belong to each (mapping from the PRD).
// Used by the details panel now, and by the card type filter and the card later.

export const CARD_TYPES = [
  { name: 'Grass', types: ['grass', 'bug'] },
  { name: 'Fire', types: ['fire'] },
  { name: 'Water', types: ['water', 'ice'] },
  { name: 'Lightning', types: ['electric'] },
  { name: 'Psychic', types: ['psychic', 'ghost', 'fairy'] },
  { name: 'Fighting', types: ['fighting', 'rock', 'ground'] },
  { name: 'Darkness', types: ['dark', 'poison'] },
  { name: 'Metal', types: ['steel'] },
  { name: 'Dragon', types: ['dragon'] },
  { name: 'Colorless', types: ['normal', 'flying'] },
]

// ['ghost', 'poison'] → 'Psychic' (only the FIRST game type counts)
export function getCardType(types) {
  const firstType = types[0]
  const cardType = CARD_TYPES.find((item) => item.types.includes(firstType))
  // Types that no Pokémon really uses (like "unknown") fall back to Colorless
  return cardType ? cardType.name : 'Colorless'
}
