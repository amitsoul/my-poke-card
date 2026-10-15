// Fetching a Pokémon's attacks from /move/{name}, without sending a request for every one of its moves.
import type { CardType, MoveResponse, PokemonDetailsResponse } from '../types/pokemon.ts'
import { API_URL, fetchJson } from './api.ts'
import { getMoveCandidates, hasPower, STRUGGLE, toAttack, toNoDamageAttack, type Attack } from './moves.ts'

export const MOVE_BATCH_SIZE = 4 // moves fetched at the same time
export const MAX_MOVES_CHECKED = 20 // never more move requests than this for one Pokémon

// A small cache: each move is fetched only once while the page is open (Pikachu's details page and then
// its Create card page share it). We keep the PROMISE, so two requests for the same move at once
// also share one fetch.
const moveCache = new Map<string, Promise<MoveResponse>>()

export function fetchMove(name: string): Promise<MoveResponse> {
  const cached = moveCache.get(name)
  if (cached !== undefined) return cached

  const request = fetchJson<MoveResponse>(`${API_URL}/move/${name}`)
  moveCache.set(name, request)
  // A failed request is NOT kept, so "Try again" really asks again
  request.catch(() => moveCache.delete(name))
  return request
}

// Empties the cache. Used after every test (src/test/setup.ts), so one test can't reuse another's moves.
export function clearMoveCache(): void {
  moveCache.clear()
}

// Up to 2 attacks, in the order of getMoveCandidates: fetch the moves 4 at a time and stop as soon as
// 2 have power; check at most 20. If none of them has power → the first one, without damage (Ditto).
// No moves at all → Struggle.
export async function chooseAttacks(details: PokemonDetailsResponse, cardType: CardType): Promise<Attack[]> {
  const candidates = getMoveCandidates(details).slice(0, MAX_MOVES_CHECKED)
  if (candidates.length === 0) return [STRUGGLE]

  const attacks: Attack[] = []
  let firstMove: MoveResponse | null = null

  for (let start = 0; start < candidates.length && attacks.length < 2; start += MOVE_BATCH_SIZE) {
    const batch = candidates.slice(start, start + MOVE_BATCH_SIZE)
    const moves = await Promise.all(batch.map(fetchMove)) // one failed request → the whole thing fails
    for (const move of moves) {
      if (firstMove === null) firstMove = move
      if (hasPower(move) && attacks.length < 2) attacks.push(toAttack(move, cardType))
    }
  }

  if (attacks.length > 0) return attacks
  return firstMove !== null ? [toNoDamageAttack(firstMove)] : [STRUGGLE]
}
