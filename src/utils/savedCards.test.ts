import { describe, expect, it } from 'vitest'
import { newPikachuCard } from '../test/cardFixtures.ts'
import { FakeStorage } from '../test/fakeStorage.ts'
import {
  CARDS_KEY,
  COUNTER_KEY,
  deleteSavedCard,
  filterSavedCards,
  formatCardNumber,
  getPngFileName,
  isSavedCard,
  loadSavedCards,
  parseShowFilter,
  SAVED_CARDS_VERSION,
  saveCard,
  setFavorite,
  type SavedCard,
} from './savedCards.ts'

// Save a card and return its number (fails the test if saving fails)
function saveNumber(storage: Storage): number {
  const result = saveCard(newPikachuCard, storage)
  if (!result.ok) throw new Error(`save failed: ${result.error}`)
  return result.saved.number
}

function storedJson(storage: FakeStorage): string | null {
  return storage.getItem(CARDS_KEY)
}

// The stored JSON as an object we can change by hand (to make broken data on purpose)
function readStored(storage: FakeStorage): { version: number; cards: unknown[] } {
  return JSON.parse(storedJson(storage) ?? '') as { version: number; cards: unknown[] }
}

describe('formatCardNumber', () => {
  it('shows 3 digits, more when needed', () => {
    expect(formatCardNumber(1)).toBe('MPC 001')
    expect(formatCardNumber(42)).toBe('MPC 042')
    expect(formatCardNumber(1000)).toBe('MPC 1000')
  })
})

describe('saveCard — the card number', () => {
  it('gives 1, 2, 3 to the first cards', () => {
    const storage = new FakeStorage()
    expect([saveNumber(storage), saveNumber(storage), saveNumber(storage)]).toEqual([1, 2, 3])
  })

  it('two saved cards always get different numbers (the number is also their id)', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    const numbers = loadSavedCards(storage).cards.map((saved) => saved.number)
    expect(new Set(numbers).size).toBe(2)
  })

  it('never reuses a number: after deleting MPC 002, the next card is MPC 004', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    saveNumber(storage)
    deleteSavedCard(2, storage)
    expect(saveNumber(storage)).toBe(4)
  })

  it('never reuses a number even after deleting the newest card (MPC 003 deleted → next is 4)', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    saveNumber(storage)
    deleteSavedCard(3, storage)
    expect(saveNumber(storage)).toBe(4)
  })

  it('a missing or broken counter continues after the highest saved number', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    storage.removeItem(COUNTER_KEY)
    expect(saveNumber(storage)).toBe(3)
    storage.setItem(COUNTER_KEY, 'banana')
    expect(saveNumber(storage)).toBe(4)
  })
})

describe('saveCard / loadSavedCards', () => {
  it('saves a card that loads back the same, not a favorite yet', () => {
    const storage = new FakeStorage()
    const result = saveCard(newPikachuCard, storage, new Date('2026-10-17T10:00:00.000Z'))

    expect(result).toEqual({
      ok: true,
      saved: { number: 1, savedAt: '2026-10-17T10:00:00.000Z', favorite: false, ...newPikachuCard },
    })
    expect(loadSavedCards(storage)).toEqual({ cards: [result.ok && result.saved], hiddenCount: 0, problem: null })
  })

  it('loads the newest card first', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    expect(loadSavedCards(storage).cards.map((saved) => saved.number)).toEqual([2, 1])
  })

  it('stores the cards with a version number', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    expect(JSON.parse(storedJson(storage) ?? '')).toMatchObject({ version: SAVED_CARDS_VERSION })
  })

  it('a full storage: "full", and neither the cards nor the counter change', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    const cardsBefore = storedJson(storage)
    storage.failWith = 'QuotaExceededError'

    expect(saveCard(newPikachuCard, storage)).toEqual({ ok: false, error: 'full' })
    expect(storedJson(storage)).toBe(cardsBefore)
    expect(storage.getItem(COUNTER_KEY)).toBe('1')
  })

  it('every other write error: "blocked"', () => {
    const storage = new FakeStorage()
    storage.failWith = 'SecurityError'
    expect(saveCard(newPikachuCard, storage)).toEqual({ ok: false, error: 'blocked' })
  })
})

describe('loadSavedCards — reading safely', () => {
  it('nothing saved yet: no cards and no problem', () => {
    expect(loadSavedCards(new FakeStorage())).toEqual({ cards: [], hiddenCount: 0, problem: null })
  })

  it('broken JSON: no cards, "unreadable", no crash', () => {
    const storage = new FakeStorage()
    storage.setItem(CARDS_KEY, '{ this is not JSON')
    expect(loadSavedCards(storage)).toEqual({ cards: [], hiddenCount: 0, problem: 'unreadable' })
  })

  it('another format (a wrong or missing version, or no list): "unreadable"', () => {
    const storage = new FakeStorage()
    for (const stored of [{ version: 2, cards: [] }, { cards: [] }, [1, 2, 3], { version: 1, cards: 'nope' }]) {
      storage.setItem(CARDS_KEY, JSON.stringify(stored))
      expect(loadSavedCards(storage).problem).toBe('unreadable')
    }
  })

  it('keeps the valid cards and counts the broken ones as hidden', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    const stored = readStored(storage)
    stored.cards.push({ number: 9, favorite: 'yes' }) // broken: missing fields, wrong type
    storage.setItem(CARDS_KEY, JSON.stringify(stored))

    const result = loadSavedCards(storage)
    expect(result.cards.map((saved) => saved.number)).toEqual([2, 1])
    expect(result.hiddenCount).toBe(1)
    expect(result.problem).toBeNull()
  })

  it('a second card with the same number is hidden (the number is the id)', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    const stored = readStored(storage)
    stored.cards.push(stored.cards[0])
    storage.setItem(CARDS_KEY, JSON.stringify(stored))

    expect(loadSavedCards(storage)).toMatchObject({ hiddenCount: 1 })
    expect(loadSavedCards(storage).cards).toHaveLength(1)
  })

  it('a storage that throws when read: "blocked", no crash', () => {
    const blocked = new FakeStorage()
    blocked.getItem = () => {
      throw new DOMException('Access denied', 'SecurityError')
    }
    expect(loadSavedCards(blocked)).toEqual({ cards: [], hiddenCount: 0, problem: 'blocked' })
  })
})

describe('isSavedCard', () => {
  const valid: SavedCard = { number: 1, savedAt: '2026-10-17T10:00:00.000Z', favorite: false, ...newPikachuCard }

  it('accepts a complete saved card', () => {
    expect(isSavedCard(valid)).toBe(true)
  })

  it('rejects a card with a wrong field', () => {
    expect(isSavedCard({ ...valid, number: 0 })).toBe(false)
    expect(isSavedCard({ ...valid, card: { ...valid.card, photo: { ...valid.card.photo, dataUrl: 'javascript:alert(1)' } } })).toBe(false)
    expect(isSavedCard({ ...valid, info: { ...valid.info, attacks: [{ name: 'X', damage: 10, cost: ['Fairy'] }] } })).toBe(false)
    expect(isSavedCard({ ...valid, pokemon: { ...valid.pokemon, gameTypes: 'electric' } })).toBe(false)
    expect(isSavedCard({ ...valid, pokemon: { ...valid.pokemon, artworkUrl: 'javascript:alert(1)' } })).toBe(false)
    expect(isSavedCard({ ...valid, pokemon: { ...valid.pokemon, artworkUrl: 'http://example.com/25.png' } })).toBe(false)
    expect(isSavedCard(null)).toBe(false)
  })
})

describe('setFavorite / deleteSavedCard', () => {
  it('marks and unmarks a favorite', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    expect(setFavorite(1, true, storage)).toEqual({ ok: true })
    expect(loadSavedCards(storage).cards[0].favorite).toBe(true)
    setFavorite(1, false, storage)
    expect(loadSavedCards(storage).cards[0].favorite).toBe(false)
  })

  it('deletes only the given card, and keeps the counter', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    expect(deleteSavedCard(1, storage)).toEqual({ ok: true })
    expect(loadSavedCards(storage).cards.map((saved) => saved.number)).toEqual([2])
    expect(storage.getItem(COUNTER_KEY)).toBe('2')
  })

  it('reports a failed write', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    storage.failWith = 'QuotaExceededError'
    expect(setFavorite(1, true, storage)).toEqual({ ok: false, error: 'full' })
  })
})

describe('the favorites filter', () => {
  it('reads ?show=favorites from the URL; anything else is "all"', () => {
    expect(parseShowFilter('favorites')).toBe('favorites')
    expect(parseShowFilter(null)).toBe('all')
    expect(parseShowFilter('banana')).toBe('all')
  })

  it('shows all cards, or only the favorites', () => {
    const storage = new FakeStorage()
    saveNumber(storage)
    saveNumber(storage)
    setFavorite(1, true, storage)
    const { cards } = loadSavedCards(storage)

    expect(filterSavedCards(cards, 'all')).toHaveLength(2)
    expect(filterSavedCards(cards, 'favorites').map((saved) => saved.number)).toEqual([1])
  })
})

describe('getPngFileName', () => {
  it('"Amit" + Pikachu + MPC 001 → "amits-pikachu-mpc-001.png"', () => {
    expect(getPngFileName('Amit', 'pikachu', 1)).toBe('amits-pikachu-mpc-001.png')
  })

  it("drops apostrophes and joins everything else with single hyphens (O'Neil's Mr-Mime)", () => {
    expect(getPngFileName("O'Neil", 'mr-mime', 4)).toBe('oneils-mr-mime-mpc-004.png')
  })
})
