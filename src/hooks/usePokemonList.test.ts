// The hook with a fake PokéAPI: loading → ready, the error state and "Try again", and the shared cache.
// renderHook runs a hook inside a tiny test component, so we can read what it returns.
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { stubPokemonList } from '../test/fakeApi.ts'
import { usePokemonList } from './usePokemonList.ts'

const NAMES: [number, string][] = [
  [1, 'bulbasaur'],
  [25, 'pikachu'],
]

describe('usePokemonList', () => {
  it('is "loading" first, then "ready" with the list', async () => {
    stubPokemonList(NAMES)

    const { result } = renderHook(() => usePokemonList())
    expect(result.current.state.status).toBe('loading')

    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    const state = result.current.state
    expect(state.status === 'ready' && state.list.map((pokemon) => pokemon.name)).toEqual(['bulbasaur', 'pikachu'])
  })

  it('is "error" when the API fails; "Try again" shows loading, then the list', async () => {
    stubPokemonList(NAMES, { failures: 1 })

    const { result } = renderHook(() => usePokemonList())
    await waitFor(() => expect(result.current.state.status).toBe('error'))

    act(() => result.current.retry())
    expect(result.current.state.status).toBe('loading')
    await waitFor(() => expect(result.current.state.status).toBe('ready'))
  })

  it('two users of the hook (like the list page and the Create page) share one load: 2 requests in all', async () => {
    const api = stubPokemonList(NAMES)

    const first = renderHook(() => usePokemonList())
    await waitFor(() => expect(first.result.current.state.status).toBe('ready'))
    const second = renderHook(() => usePokemonList())
    await waitFor(() => expect(second.result.current.state.status).toBe('ready'))

    expect(api.requests).toHaveLength(2)
  })
})
