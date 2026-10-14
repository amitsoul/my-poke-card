// Page "/": the Pokémon list, with search, card type filter and "Load more".
import { useEffect, useState } from 'react'
import PokemonList from '../components/PokemonList.tsx'
import SearchBar from '../components/SearchBar.tsx'
import CardTypeFilter from '../components/CardTypeFilter.tsx'
import type {
  CardType,
  PokemonListResponse,
  PokemonSummary,
  SpeciesCountResponse,
  TypeResponse,
} from '../types/pokemon.ts'
import { API_URL, fetchJson, getArtworkUrl } from '../utils/api.ts'
import { CARD_TYPES } from '../utils/cardType.ts'

const PAGE_SIZE = 50

// "https://pokeapi.co/api/v2/pokemon/25/" → 25
function getIdFromUrl(url: string): number {
  const parts = url.split('/').filter((part) => part !== '')
  return Number(parts[parts.length - 1])
}

export default function PokemonListPage() {
  const [pokemonList, setPokemonList] = useState<PokemonSummary[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)
  const [listRetryCount, setListRetryCount] = useState<number>(0)
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [searchText, setSearchText] = useState<string>('')
  const [selectedCardType, setSelectedCardType] = useState<CardType | null>(null) // null = All
  const [cardTypeIds, setCardTypeIds] = useState<Set<number> | null>(null) // ids of the selected card type's Pokémon
  const [hasCardTypeError, setHasCardTypeError] = useState<boolean>(false)
  const [cardTypeRetryCount, setCardTypeRetryCount] = useState<number>(0)

  // Still waiting for the selected card type's ids?
  const isCardTypeLoading = selectedCardType !== null && cardTypeIds === null && !hasCardTypeError

  // Filter the FULL list by search AND card type, then show only the first visibleCount
  const search = searchText.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesSearch = pokemon.name.includes(search)
    const matchesCardType = selectedCardType === null || (cardTypeIds !== null && cardTypeIds.has(pokemon.id))
    return matchesSearch && matchesCardType
  })
  const visiblePokemon = filteredPokemon.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPokemon.length

  // New search → start again from the first page
  function handleSearchChange(text: string) {
    setSearchText(text)
    setVisibleCount(PAGE_SIZE)
  }

  // New card type → forget the old ids and start again from the first page
  function handleCardTypeChange(cardType: CardType | null) {
    if (cardType === selectedCardType) return
    setSelectedCardType(cardType)
    setCardTypeIds(null)
    setHasCardTypeError(false)
    setVisibleCount(PAGE_SIZE)
  }

  // Same card type again: clear the error (→ loading) and bump the counter so the effect re-runs
  function handleCardTypeRetry() {
    setHasCardTypeError(false)
    setCardTypeRetryCount(cardTypeRetryCount + 1)
  }

  // List "Try again": show loading, clear the error, and bump the counter so the list effect re-runs
  function handleListRetry() {
    setIsLoading(true)
    setHasError(false)
    setListRetryCount(listRetryCount + 1)
  }

  // Load the list when App first appears (and again on "Try again").
  // isLoading/hasError are already set (by the initial state or handleListRetry),
  // so the effect only fetches and saves the result.
  useEffect(() => {
    // Becomes false if this run is replaced before the answer arrives
    let isCurrent = true

    async function loadPokemon() {
      try {
        // 1. How many species are there? (never hardcoded)
        const speciesData = await fetchJson<SpeciesCountResponse>(`${API_URL}/pokemon-species?limit=1`)

        // 2. Get that many Pokémon (name + url only)
        const listData = await fetchJson<PokemonListResponse>(`${API_URL}/pokemon?limit=${speciesData.count}`)

        // 3. Build our own objects and drop special forms (id 10001+)
        const list: PokemonSummary[] = listData.results
          .map((item) => {
            const id = getIdFromUrl(item.url)
            return { id, name: item.name, image: getArtworkUrl(id) }
          })
          .filter((pokemon) => pokemon.id < 10001)

        if (isCurrent) setPokemonList(list)
      } catch {
        if (isCurrent) setHasError(true)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadPokemon()

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [listRetryCount])

  // Fetch the ids for the selected card type every time it changes (or "Try again" is clicked)
  useEffect(() => {
    if (selectedCardType === null) return

    // Becomes false if another card type is picked before this answer arrives
    let isCurrent = true

    async function loadCardTypeIds() {
      try {
        // Psychic → ['psychic', 'ghost', 'fairy'] → 3 requests at the same time
        const cardType = CARD_TYPES.find((item) => item.name === selectedCardType)
        // Can't happen (selectedCardType is always one of CARD_TYPES), but TypeScript makes us check
        if (cardType === undefined) throw new Error(`Unknown card type: ${selectedCardType}`)
        const typeDataList = await Promise.all(
          cardType.types.map((type) => fetchJson<TypeResponse>(`${API_URL}/type/${type}`)),
        )

        // Merge into one set: only Pokémon whose FIRST type is this type, and no forms
        const ids = new Set<number>()
        for (const typeData of typeDataList) {
          for (const item of typeData.pokemon) {
            const id = getIdFromUrl(item.pokemon.url)
            if (item.slot === 1 && id < 10001) ids.add(id)
          }
        }

        if (isCurrent) setCardTypeIds(ids)
      } catch {
        if (isCurrent) setHasCardTypeError(true)
      }
    }

    loadCardTypeIds()

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [selectedCardType, cardTypeRetryCount])

  return (
    <>
      <h1>My Poke Card</h1>

      {isLoading && <p className="status">Loading Pokémon...</p>}

      {!isLoading && hasError && (
        <div className="status">
          <p>Oops! We couldn't load the Pokémon. Please check your internet connection.</p>
          <button type="button" className="button" onClick={handleListRetry}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !hasError && (
        <>
          <SearchBar value={searchText} onChange={handleSearchChange} />
          <CardTypeFilter selectedCardType={selectedCardType} onChange={handleCardTypeChange} />

          {isCardTypeLoading && <p className="status">Loading {selectedCardType} Pokémon...</p>}

          {hasCardTypeError && (
            <div className="status">
              <p>Oops! We couldn't load the {selectedCardType} Pokémon.</p>
              <div className="status-actions">
                <button type="button" className="button" onClick={handleCardTypeRetry}>
                  Try again
                </button>
                <button type="button" className="button" onClick={() => handleCardTypeChange(null)}>
                  Show all Pokémon
                </button>
              </div>
            </div>
          )}

          {!isCardTypeLoading && !hasCardTypeError && (
            <>
              {filteredPokemon.length === 0 && <p className="status">No Pokémon found</p>}
              <PokemonList pokemonList={visiblePokemon} />
              {hasMore && (
                <button
                  type="button"
                  className="button load-more"
                  onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
                >
                  Load more
                </button>
              )}
            </>
          )}
        </>
      )}
    </>
  )
}
