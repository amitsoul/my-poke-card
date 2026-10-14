// The :id part of /pokemon/:id → a Pokémon id, or null if it can't be one.
// "25" → 25; "abc", "0", "1.5", "" or a missing param → null.
export function parsePokemonId(value: string | undefined): number | null {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}
