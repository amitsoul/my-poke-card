// Page "/pokemon": the Pokémon list, with search, card type filter and "Load more".
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import PokemonList from '../components/PokemonList.tsx'
import SearchBar from '../components/SearchBar.tsx'
import CardTypeFilter from '../components/CardTypeFilter.tsx'
import { usePokemonList } from '../hooks/usePokemonList.ts'
import type { CardType, PokemonSummary, TypeResponse } from '../types/pokemon.ts'
import { API_URL, fetchJson, getIdFromUrl } from '../utils/api.ts'
import { CARD_TYPES, parseCardType } from '../utils/cardType.ts'
import { filterPokemon, normalizeSearch } from '../utils/filterPokemon.ts'
import { getPageTitle } from '../utils/text.ts'

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

// While a card type's ids are loading (or failed), no Pokémon matches it — same as before the move to utils
const NO_IDS = new Set<number>()
// While the list loads (or failed), there are no Pokémon to show
const NO_POKEMON: PokemonSummary[] = []

export default function PokemonListPage() {
  // All species: 2 requests, then cached for the visit (shared with the Create page's Pokémon search)
  const { state: listState, retry: handleListRetry } = usePokemonList()
  const pokemonList = listState.status === 'ready' ? listState.list : NO_POKEMON
  const isLoading = listState.status === 'loading'
  const hasError = listState.status === 'error'
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

  // Filter the FULL list by search AND card type (null = All)
  const cardTypeIds =
    selectedCardType === null
      ? null
      : currentCardTypeResult !== null && currentCardTypeResult.status === 'ready'
        ? currentCardTypeResult.ids
        : NO_IDS
  const filteredPokemon = filterPokemon(pokemonList, searchText, cardTypeIds)
  const search = normalizeSearch(searchText)

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
      <title>{getPageTitle('Find a Pokémon')}</title>
      <h1 className="page-title">Find a Pokémon</h1>

      {isLoading && <p className="loading-text">Loading Pokémon...</p>}

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

          {isCardTypeLoading && <p className="loading-text">Loading {selectedCardType} Pokémon...</p>}

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
