// Page "/": the Pokémon list, with search, card type filter and "Load more".
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
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
import { CARD_TYPES, parseCardType } from '../utils/cardType.ts'

const PAGE_SIZE = 50

// The ids of one card type's Pokémon, or an error — remembered together with the card type they belong to
type CardTypeResult =
  | { cardType: CardType; status: 'ready'; ids: Set<number> }
  | { cardType: CardType; status: 'error' }

// How many Pokémon "Load more" has opened, for one search + filter combination
interface PageState {
  filterKey: string
  count: number
}

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
  const [cardTypeResult, setCardTypeResult] = useState<CardTypeResult | null>(null)
  const [cardTypeRetryCount, setCardTypeRetryCount] = useState<number>(0)
  const [page, setPage] = useState<PageState>({ filterKey: '', count: PAGE_SIZE })

  // Search and card type live in the URL: /?q=char&type=Fire. The URL is the source of truth.
  const [searchParams, setSearchParams] = useSearchParams()
  const searchText = searchParams.get('q') ?? ''
  const selectedCardType = parseCardType(searchParams.get('type')) // null = All (also for ?type=Fairy)

  // The answer for the selected card type, if it has arrived (an older answer for another type doesn't count)
  const currentCardTypeResult =
    cardTypeResult !== null && cardTypeResult.cardType === selectedCardType ? cardTypeResult : null
  const isCardTypeLoading = selectedCardType !== null && currentCardTypeResult === null
  const hasCardTypeError = currentCardTypeResult !== null && currentCardTypeResult.status === 'error'

  // Filter the FULL list by search AND card type
  const search = searchText.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesSearch = pokemon.name.includes(search)
    const matchesCardType =
      selectedCardType === null ||
      (currentCardTypeResult !== null &&
        currentCardTypeResult.status === 'ready' &&
        currentCardTypeResult.ids.has(pokemon.id))
    return matchesSearch && matchesCardType
  })

  // "Load more" counts per search + filter: when either changes (typing, a click, or Back), we're back to 50
  const filterKey = `${search}|${selectedCardType ?? ''}`
  const visibleCount = page.filterKey === filterKey ? page.count : PAGE_SIZE
  const visiblePokemon = filteredPokemon.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPokemon.length

  // Typing → update ?q= in place (replace), so Back doesn't step through every letter
  function handleSearchChange(text: string) {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (text === '') next.delete('q')
        else next.set('q', text)
        return next
      },
      { replace: true },
    )
  }

  // A card type click → a new history entry, so Back returns to the previous filter
  function handleCardTypeChange(cardType: CardType | null) {
    const currentParam = searchParams.get('type')
    if (cardType === null ? currentParam === null : currentParam === cardType) return
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cardType === null) next.delete('type')
      else next.set('type', cardType)
      return next
    })
  }

  // Same card type again: forget the error (→ loading) and bump the counter so the effect re-runs
  function handleCardTypeRetry() {
    setCardTypeResult(null)
    setCardTypeRetryCount(cardTypeRetryCount + 1)
  }

  function handleLoadMore() {
    setPage({ filterKey, count: visibleCount + PAGE_SIZE })
  }

  // List "Try again": show loading, clear the error, and bump the counter so the list effect re-runs
  function handleListRetry() {
    setIsLoading(true)
    setHasError(false)
    setListRetryCount(listRetryCount + 1)
  }

  // Load the list when this page first appears (and again on "Try again").
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

    async function loadCardTypeIds(selected: CardType) {
      try {
        // Psychic → ['psychic', 'ghost', 'fairy'] → 3 requests at the same time
        const cardType = CARD_TYPES.find((item) => item.name === selected)
        // Can't happen (parseCardType only returns one of CARD_TYPES), but TypeScript makes us check
        if (cardType === undefined) throw new Error(`Unknown card type: ${selected}`)
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

        if (isCurrent) setCardTypeResult({ cardType: selected, status: 'ready', ids })
      } catch {
        if (isCurrent) setCardTypeResult({ cardType: selected, status: 'error' })
      }
    }

    loadCardTypeIds(selectedCardType)

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
                  onClick={handleLoadMore}
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
