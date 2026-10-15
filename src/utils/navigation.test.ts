import { describe, expect, it } from 'vitest'
import { getBackToListUrl } from './navigation.ts'

describe('getBackToListUrl', () => {
  it('returns to the list with the same search and filter', () => {
    expect(getBackToListUrl({ listSearch: '?q=char&type=Fire' })).toBe('/?q=char&type=Fire')
  })

  it('returns "/" when the list had no search or filter', () => {
    expect(getBackToListUrl({ listSearch: '' })).toBe('/')
  })

  it('returns "/" when there is no state (page opened directly)', () => {
    expect(getBackToListUrl(null)).toBe('/')
    expect(getBackToListUrl(undefined)).toBe('/')
  })

  it('returns "/" for a state that is not an object', () => {
    expect(getBackToListUrl(42)).toBe('/')
  })

  it('returns "/" for an object without listSearch', () => {
    expect(getBackToListUrl({ somethingElse: '?q=char' })).toBe('/')
  })

  it('returns "/" when listSearch is not a string', () => {
    expect(getBackToListUrl({ listSearch: 123 })).toBe('/')
  })
})
