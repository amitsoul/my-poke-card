// Task 3: the list comes from PokéAPI. The selected Pokémon lives here in App.
import { useEffect, useState } from 'react'
import PokemonList from './components/PokemonList.jsx'
import PokemonDetails from './components/PokemonDetails.jsx'
import SearchBar from './components/SearchBar.jsx'

const API_URL = 'https://pokeapi.co/api/v2'
const ARTWORK_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'
const PAGE_SIZE = 50

// "https://pokeapi.co/api/v2/pokemon/25/" → 25
function getIdFromUrl(url) {
  const parts = url.split('/').filter((part) => part !== '')
  return Number(parts[parts.length - 1])
}

export default function App() {
  const [pokemonList, setPokemonList] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [searchText, setSearchText] = useState('')

  // Search the FULL list, then show only the first visibleCount of the results
  const search = searchText.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => pokemon.name.includes(search))
  const visiblePokemon = filteredPokemon.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPokemon.length

  // New search → start again from the first page
  function handleSearchChange(text) {
    setSearchText(text)
    setVisibleCount(PAGE_SIZE)
  }

  async function loadPokemon() {
    setIsLoading(true)
    setHasError(false)

    try {
      // 1. How many species are there? (never hardcoded)
      const speciesResponse = await fetch(`${API_URL}/pokemon-species?limit=1`)
      if (!speciesResponse.ok) throw new Error('Species request failed')
      const speciesData = await speciesResponse.json()

      // 2. Get that many Pokémon (name + url only)
      const listResponse = await fetch(`${API_URL}/pokemon?limit=${speciesData.count}`)
      if (!listResponse.ok) throw new Error('Pokémon request failed')
      const listData = await listResponse.json()

      // 3. Build our own objects and drop special forms (id 10001+)
      const list = listData.results
        .map((item) => {
          const id = getIdFromUrl(item.url)
          return { id, name: item.name, image: `${ARTWORK_URL}/${id}.png` }
        })
        .filter((pokemon) => pokemon.id < 10001)

      setPokemonList(list)
    } catch {
      setHasError(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Load the list once, when App first appears on screen
  useEffect(() => {
    loadPokemon()
  }, [])

  return (
    <main className="app">
      <h1>My Poke Card</h1>

      {isLoading && <p className="status">Loading Pokémon...</p>}

      {!isLoading && hasError && (
        <div className="status">
          <p>Oops! We couldn't load the Pokémon. Please check your internet connection.</p>
          <button type="button" className="button" onClick={loadPokemon}>
            Try again
          </button>
        </div>
      )}

      {!isLoading && !hasError && (
        <div className="layout">
          <PokemonDetails pokemon={selectedPokemon} />
          <div className="list-column">
            <SearchBar value={searchText} onChange={handleSearchChange} />
            {filteredPokemon.length === 0 && <p className="status">No Pokémon found</p>}
            <PokemonList
              pokemonList={visiblePokemon}
              selectedPokemon={selectedPokemon}
              onSelect={setSelectedPokemon}
            />
            {hasMore && (
              <button
                type="button"
                className="button load-more"
                onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}
              >
                Load more
              </button>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
