// The 10 card energies and the Pokémon types that belong to each (mapping from the PRD).
// Used by the details panel now, and by the energy filter and the card later.

export const ENERGIES = [
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

// ['ghost', 'poison'] → 'Psychic' (only the FIRST type counts)
export function getEnergy(types) {
  const firstType = types[0]
  const energy = ENERGIES.find((item) => item.types.includes(firstType))
  // Types that no Pokémon really uses (like "unknown") fall back to Colorless
  return energy ? energy.name : 'Colorless'
}
