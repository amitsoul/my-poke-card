// Saved cards in localStorage (task 11). Every function takes the storage as an argument
// (default: the browser's localStorage), so tests can pass a small fake one.
// Nothing here may crash the app: broken data, blocked storage or a full storage give a result, never an error.
import type { PokemonCardInfo } from '../hooks/usePokemonCardInfo.ts'
import type { CardPokemon } from '../types/pokemon.ts'
import type { CardData } from './cardForm.ts'
import { CARD_TYPES } from './cardType.ts'

export const CARDS_KEY = 'my-poke-card/cards' // { version: 1, cards: SavedCard[] }
export const COUNTER_KEY = 'my-poke-card/card-counter' // the last card number given, e.g. "3"
export const SAVED_CARDS_VERSION = 1

// One saved card: everything needed to draw it again without the API.
// The card number is also its id: numbers are unique and never reused.
export interface SavedCard {
  number: number // 1 → "MPC 001"
  savedAt: string // ISO date
  favorite: boolean
  card: CardData // the user's answers, photo and sticker position
  pokemon: CardPokemon
  info: PokemonCardInfo // genus + attacks, as they were when saved
}

// What loading found. problem: 'unreadable' = the stored data is broken or another format;
// 'blocked' = the browser doesn't let us read storage. hiddenCount = broken cards that were skipped.
export interface LoadResult {
  cards: SavedCard[]
  hiddenCount: number
  problem: 'unreadable' | 'blocked' | null
}

export type WriteError = 'full' | 'blocked'
export type SaveResult = { ok: true; saved: SavedCard } | { ok: false; error: WriteError }
export type WriteResult = { ok: true } | { ok: false; error: WriteError }

export type ShowFilter = 'all' | 'favorites'

// ---------- Small helpers ----------

// 1 → "MPC 001", 42 → "MPC 042", 1000 → "MPC 1000"
export function formatCardNumber(number: number): string {
  return 'MPC ' + String(number).padStart(3, '0')
}

// ?show=favorites → 'favorites'; anything else (or nothing) → 'all'
export function parseShowFilter(value: string | null): ShowFilter {
  return value === 'favorites' ? 'favorites' : 'all'
}

export function filterSavedCards(cards: SavedCard[], show: ShowFilter): SavedCard[] {
  return show === 'favorites' ? cards.filter((saved) => saved.favorite) : cards
}

// "Amit" + Pikachu + 1 → "amits-pikachu-mpc-001.png"; "O'Neil" + "mr-mime" → "oneils-mr-mime-mpc-004.png"
export function getPngFileName(saved: SavedCard): string {
  const slug = `${saved.card.name}s ${saved.pokemon.name} ${formatCardNumber(saved.number)}`
    .toLowerCase()
    .replace(/['’]/g, '') // "o'neil" → "oneil"
    .replace(/[^a-z0-9]+/g, '-') // spaces, hyphens, anything else → one "-"
    .replace(/^-|-$/g, '')
  return `${slug}.png`
}

// ---------- Checking stored data (it may be broken, old, or changed by hand) ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isPositiveInteger(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value > 0
}

const CARD_TYPE_NAMES: string[] = CARD_TYPES.map((cardType) => cardType.name)

function isCardData(value: unknown): boolean {
  if (!isRecord(value) || !isRecord(value.photo) || !isRecord(value.stickerPosition)) return false
  return (
    typeof value.name === 'string' &&
    isPositiveInteger(value.age) &&
    typeof value.superpower === 'string' &&
    typeof value.aboutYou === 'string' &&
    typeof value.photo.dataUrl === 'string' &&
    value.photo.dataUrl.startsWith('data:image/jpeg') &&
    value.photo.type === 'image/jpeg' &&
    isFiniteNumber(value.photo.size) &&
    isFiniteNumber(value.stickerPosition.x) &&
    isFiniteNumber(value.stickerPosition.y)
  )
}

function isCardPokemon(value: unknown): boolean {
  return (
    isRecord(value) &&
    isPositiveInteger(value.id) &&
    typeof value.name === 'string' &&
    Array.isArray(value.gameTypes) &&
    value.gameTypes.every((type) => typeof type === 'string') &&
    isFiniteNumber(value.height) &&
    isFiniteNumber(value.weight) &&
    typeof value.artworkUrl === 'string'
  )
}

function isAttack(value: unknown): boolean {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    (value.damage === null || isFiniteNumber(value.damage)) &&
    Array.isArray(value.cost) &&
    value.cost.every((type) => typeof type === 'string' && CARD_TYPE_NAMES.includes(type))
  )
}

function isCardInfo(value: unknown): boolean {
  return (
    isRecord(value) &&
    (value.genus === null || typeof value.genus === 'string') &&
    Array.isArray(value.attacks) &&
    value.attacks.every(isAttack)
  )
}

// Does this look exactly like a saved card? (a "type guard": after it says yes, TypeScript trusts the type)
export function isSavedCard(value: unknown): value is SavedCard {
  return (
    isRecord(value) &&
    isPositiveInteger(value.number) &&
    typeof value.savedAt === 'string' &&
    typeof value.favorite === 'boolean' &&
    isCardData(value.card) &&
    isCardPokemon(value.pokemon) &&
    isCardInfo(value.info)
  )
}

// ---------- Reading and writing ----------

// The browser's localStorage, or null if even asking for it throws (some browsers block it)
function getStorage(storage: Storage | undefined): Storage | null {
  if (storage !== undefined) return storage
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED') // the 2nd: old Firefox
  )
}

// Read and check everything. Valid cards are kept (newest first); broken ones are skipped and counted.
export function loadSavedCards(storage?: Storage): LoadResult {
  const store = getStorage(storage)
  if (store === null) return { cards: [], hiddenCount: 0, problem: 'blocked' }

  let raw: string | null
  try {
    raw = store.getItem(CARDS_KEY)
  } catch {
    return { cards: [], hiddenCount: 0, problem: 'blocked' }
  }
  if (raw === null) return { cards: [], hiddenCount: 0, problem: null } // nothing saved yet

  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return { cards: [], hiddenCount: 0, problem: 'unreadable' }
  }
  if (!isRecord(data) || data.version !== SAVED_CARDS_VERSION || !Array.isArray(data.cards)) {
    return { cards: [], hiddenCount: 0, problem: 'unreadable' } // broken, or another (old/new) format
  }

  const cards: SavedCard[] = []
  let hiddenCount = 0
  for (const item of data.cards) {
    // A card number is its id, so a second card with the same number is hidden too
    if (isSavedCard(item) && !cards.some((saved) => saved.number === item.number)) cards.push(item)
    else hiddenCount += 1
  }
  cards.sort((a, b) => b.number - a.number) // newest (highest number) first
  return { cards, hiddenCount, problem: null }
}

// The last number given. Missing or broken → 0 (the highest saved number protects us then).
function readCounter(store: Storage): number {
  try {
    const value = Number(store.getItem(COUNTER_KEY))
    return Number.isInteger(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeCards(store: Storage, cards: SavedCard[]): WriteResult {
  try {
    store.setItem(CARDS_KEY, JSON.stringify({ version: SAVED_CARDS_VERSION, cards }))
    return { ok: true }
  } catch (error) {
    return { ok: false, error: isQuotaError(error) ? 'full' : 'blocked' }
  }
}

// Save a new card with the next number. The number is never reused, even after a delete:
// next = (the highest of the counter and every saved number) + 1.
// If the storage is full, nothing changes — not the cards, not the counter.
export function saveCard(
  newCard: { card: CardData; pokemon: CardPokemon; info: PokemonCardInfo },
  storage?: Storage,
  now: Date = new Date(),
): SaveResult {
  const store = getStorage(storage)
  if (store === null) return { ok: false, error: 'blocked' }

  const { cards } = loadSavedCards(store) // unreadable data is replaced by this save (that's the agreed rule)
  const highestSaved = Math.max(0, ...cards.map((saved) => saved.number))
  const number = Math.max(readCounter(store), highestSaved) + 1
  const saved: SavedCard = { number, savedAt: now.toISOString(), favorite: false, ...newCard }

  const written = writeCards(store, [saved, ...cards])
  if (!written.ok) return written
  try {
    store.setItem(COUNTER_KEY, String(number))
  } catch {
    // The card is saved; if only the counter failed, the highest saved number still prevents reuse
  }
  return { ok: true, saved }
}

// Change one saved card (by its number) and write the list back
function updateCards(storage: Storage | undefined, change: (cards: SavedCard[]) => SavedCard[]): WriteResult {
  const store = getStorage(storage)
  if (store === null) return { ok: false, error: 'blocked' }
  const { cards } = loadSavedCards(store)
  return writeCards(store, change(cards))
}

export function setFavorite(number: number, favorite: boolean, storage?: Storage): WriteResult {
  return updateCards(storage, (cards) => cards.map((saved) => (saved.number === number ? { ...saved, favorite } : saved)))
}

// Deleting never frees the number: the counter stays as it is
export function deleteSavedCard(number: number, storage?: Storage): WriteResult {
  return updateCards(storage, (cards) => cards.filter((saved) => saved.number !== number))
}
