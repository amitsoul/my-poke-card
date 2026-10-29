// The landing page's example cards must be cards the app could really make
import { describe, expect, it } from 'vitest'
import { validateCardForm } from '../utils/cardForm.ts'
import { getCardRules } from '../utils/cardRules.ts'
import { SAMPLE_CARDS } from './sampleCards.ts'

describe('SAMPLE_CARDS', () => {
  it('both pass the real Create form rules (name, age, photo, superpower, about you)', () => {
    for (const { card } of SAMPLE_CARDS) {
      const result = validateCardForm({
        name: card.name,
        age: String(card.age),
        photo: card.photo,
        superpower: card.superpower,
        aboutYou: card.aboutYou,
      })
      expect(result.errors, card.name).toEqual({})
    }
  })

  it('are Amit & Amit with Squirtle (Water, MPC 001) and Philip & Charlie with Pikachu (Lightning, MPC 002)', () => {
    const summary = SAMPLE_CARDS.map((sample) => [
      sample.number,
      sample.card.name,
      sample.pokemon.name,
      getCardRules(sample.pokemon.gameTypes, sample.pokemon.weight).cardType,
    ])
    expect(summary).toEqual([
      [1, 'Amit & Amit', 'squirtle', 'Water'],
      [2, 'Philip & Charlie', 'pikachu', 'Lightning'],
    ])
  })

  it('each illustration has its own description, not "Your photo"', () => {
    for (const sample of SAMPLE_CARDS) expect(sample.photoAlt).toMatch(/^Illustration of /)
  })
})
