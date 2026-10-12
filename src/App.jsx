// The list comes from PokéAPI. The selection, search and energy filter live here in App.
import { useEffect, useState } from 'react'
import PokemonList from './components/PokemonList.jsx'
import PokemonDetails from './components/PokemonDetails.jsx'
import SearchBar from './components/SearchBar.jsx'
import EnergyFilter from './components/EnergyFilter.jsx'
import { ENERGIES } from './utils/energy.js'

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
  const [selectedEnergy, setSelectedEnergy] = useState(null) // null = All
  const [energyIds, setEnergyIds] = useState(null) // ids of the selected energy's Pokémon
  const [hasEnergyError, setHasEnergyError] = useState(false)

  // Still waiting for the selected energy's ids?
  const isEnergyLoading = selectedEnergy !== null && energyIds === null && !hasEnergyError

  // Filter the FULL list by search AND energy, then show only the first visibleCount
  const search = searchText.trim().toLowerCase()
  const filteredPokemon = pokemonList.filter((pokemon) => {
    const matchesSearch = pokemon.name.includes(search)
    const matchesEnergy = selectedEnergy === null || (energyIds !== null && energyIds.has(pokemon.id))
    return matchesSearch && matchesEnergy
  })
  const visiblePokemon = filteredPokemon.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPokemon.length

  // New search → start again from the first page
  function handleSearchChange(text) {
    setSearchText(text)
    setVisibleCount(PAGE_SIZE)
  }

  // New energy → forget the old ids and start again from the first page
  function handleEnergyChange(energy) {
    if (energy === selectedEnergy) return
    setSelectedEnergy(energy)
    setEnergyIds(null)
    setHasEnergyError(false)
    setVisibleCount(PAGE_SIZE)
  }

  // Fetch the ids for the selected energy every time it changes
  useEffect(() => {
    if (selectedEnergy === null) return

    // Becomes false if another energy is picked before this answer arrives
    let isCurrent = true

    async function loadEnergyIds() {
      try {
        // Psychic → ['psychic', 'ghost', 'fairy'] → 3 requests at the same time
        const energy = ENERGIES.find((item) => item.name === selectedEnergy)
        const responses = await Promise.all(
          energy.types.map((type) => fetch(`${API_URL}/type/${type}`)),
        )
        if (responses.some((response) => !response.ok)) throw new Error('Type request failed')
        const typeDataList = await Promise.all(responses.map((response) => response.json()))

        // Merge into one set: only Pokémon whose FIRST type is this type, and no forms
        const ids = new Set()
        for (const typeData of typeDataList) {
          for (const item of typeData.pokemon) {
            const id = getIdFromUrl(item.pokemon.url)
            if (item.slot === 1 && id < 10001) ids.add(id)
          }
        }

        if (isCurrent) setEnergyIds(ids)
      } catch {
        if (isCurrent) setHasEnergyError(true)
      }
    }

    loadEnergyIds()

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [selectedEnergy])

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
            <EnergyFilter selectedEnergy={selectedEnergy} onChange={handleEnergyChange} />

            {isEnergyLoading && <p className="status">Loading {selectedEnergy} Pokémon...</p>}

            {hasEnergyError && (
              <div className="status">
                <p>Oops! We couldn't load the {selectedEnergy} Pokémon.</p>
                <button type="button" className="button" onClick={() => handleEnergyChange(null)}>
                  Show all Pokémon
                </button>
              </div>
            )}

            {!isEnergyLoading && !hasEnergyError && (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
