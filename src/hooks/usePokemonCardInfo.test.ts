// The hook with a fake PokéAPI: genus + attacks, the error state and "Try again".
// renderHook runs a hook inside a tiny test component, so we can read what it returns.
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { moveResponse, speciesResponse, stubPokeApi } from '../test/fakeApi.ts'
import { pikachuDetails } from '../test/pokemonFixtures.ts'
import { usePokemonCardInfo } from './usePokemonCardInfo.ts'

const PIKACHU_MOVES = [
  moveResponse('tail-whip', null, 'Tail Whip'),
  moveResponse('growl', null, 'Growl'),
  moveResponse('thunder-shock', 40, 'Thunder Shock'),
  moveResponse('quick-attack', 40, 'Quick Attack'),
]

describe('usePokemonCardInfo', () => {
  it('is "loading" first, then "ready" with the genus and the 2 attacks', async () => {
    stubPokeApi({ moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') })

    const { result } = renderHook(() => usePokemonCardInfo(pikachuDetails))
    expect(result.current.state.status).toBe('loading')

    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    expect(result.current.state).toEqual({
      status: 'ready',
      info: {
        genus: 'Mouse Pokémon',
        attacks: [
          { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
          { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
        ],
      },
    })
  })

  it('gives genus null when there is no English genus', async () => {
    stubPokeApi({ moves: PIKACHU_MOVES, species: speciesResponse(null) })

    const { result } = renderHook(() => usePokemonCardInfo(pikachuDetails))

    await waitFor(() => expect(result.current.state.status).toBe('ready'))
    expect(result.current.state.status === 'ready' && result.current.state.info.genus).toBeNull()
  })

  it('fetches nothing while the Pokémon itself is not loaded (details = null)', () => {
    const api = stubPokeApi({})

    const { result } = renderHook(() => usePokemonCardInfo(null))

    expect(result.current.state.status).toBe('loading')
    expect(api.requests).toHaveLength(0)
  })

  it('a failed request → "error"; "Try again" → loading → ready', async () => {
    stubPokeApi({ moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon'), failingMoves: ['thunder-shock'] })
    const { result } = renderHook(() => usePokemonCardInfo(pikachuDetails))
    await waitFor(() => expect(result.current.state.status).toBe('error'))

    stubPokeApi({ moves: PIKACHU_MOVES, species: speciesResponse('Mouse Pokémon') }) // the server works again
    act(() => result.current.retry())

    expect(result.current.state.status).toBe('loading')
    await waitFor(() => expect(result.current.state.status).toBe('ready'))
  })
})
