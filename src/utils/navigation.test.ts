import { describe, expect, it } from 'vitest'
import { getBackToListUrl } from './navigation.ts'

describe('getBackToListUrl', () => {
  it('returns to the list with the same search and filter', () => {
    expect(getBackToListUrl({ listSearch: '?q=char&type=Fire' })).toBe('/pokemon?q=char&type=Fire')
  })

  it('returns "/pokemon" when the list had no search or filter', () => {
    expect(getBackToListUrl({ listSearch: '' })).toBe('/pokemon')
  })

  it('returns "/pokemon" when there is no state (page opened directly)', () => {
    expect(getBackToListUrl(null)).toBe('/pokemon')
    expect(getBackToListUrl(undefined)).toBe('/pokemon')
  })

  it('returns "/pokemon" for a state that is not an object', () => {
    expect(getBackToListUrl(42)).toBe('/pokemon')
  })

  it('returns "/pokemon" for an object without listSearch', () => {
    expect(getBackToListUrl({ somethingElse: '?q=char' })).toBe('/pokemon')
  })

  it('returns "/pokemon" when listSearch is not a string', () => {
    expect(getBackToListUrl({ listSearch: 123 })).toBe('/pokemon')
  })
})
