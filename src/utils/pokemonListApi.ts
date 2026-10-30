// All Pokémon species (name, id, image): for the list page and the Create page's Pokémon search.
// Loaded with 2 requests, then kept in memory for the visit, so going from one page to the other asks again for nothing.
import type { PokemonListResponse, PokemonSummary, SpeciesCountResponse } from '../types/pokemon.ts'
import { API_URL, fetchJson, getArtworkUrl, getIdFromUrl } from './api.ts'

// Ids from 10001 up are special forms (Mega, regional…), not species
const FIRST_FORM_ID = 10001

async function fetchPokemonList(): Promise<PokemonSummary[]> {
  // 1. How many species are there? (never hardcoded)
  const species = await fetchJson<SpeciesCountResponse>(`${API_URL}/pokemon-species?limit=1`)
  // 2. Get that many Pokémon (name + url only)
  const list = await fetchJson<PokemonListResponse>(`${API_URL}/pokemon?limit=${species.count}`)
  // 3. Build our own objects and drop special forms
  return list.results
    .map((item) => {
      const id = getIdFromUrl(item.url)
      return { id, name: item.name, image: getArtworkUrl(id) }
    })
    .filter((pokemon) => pokemon.id < FIRST_FORM_ID)
}

// Like the move cache: we keep the PROMISE, so two pages asking at the same time also share one load
let cachedList: Promise<PokemonSummary[]> | null = null

export function loadPokemonList(): Promise<PokemonSummary[]> {
  if (cachedList !== null) return cachedList
  const request = fetchPokemonList()
  cachedList = request
  // A failed load is NOT kept, so "Try again" really asks again
  request.catch(() => {
    if (cachedList === request) cachedList = null
  })
  return request
}

// Empties the cache. Used after every test (src/test/setup.ts), so one test can't reuse another's list.
export function clearPokemonListCache(): void {
  cachedList = null
}
