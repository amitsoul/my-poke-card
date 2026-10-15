import { describe, expect, it } from 'vitest'
import { toTitleCase } from './text.ts'

describe('toTitleCase', () => {
  it('capitalizes the first letter of every word ("super speed" → "Super Speed")', () => {
    expect(toTitleCase('super speed')).toBe('Super Speed')
  })

  it('also after a hyphen, like the attack names ("x-ray vision" → "X-Ray Vision")', () => {
    expect(toTitleCase('x-ray vision')).toBe('X-Ray Vision')
    expect(toTitleCase('fire-breathing')).toBe('Fire-Breathing')
  })

  it('keeps the other letters as typed', () => {
    expect(toTitleCase('super SPEED')).toBe('Super SPEED')
    expect(toTitleCase('Fly')).toBe('Fly')
  })
})
