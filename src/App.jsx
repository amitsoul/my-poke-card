// Task 2: clicking a Pokémon selects it. The selected Pokémon lives here in App.
import { useState } from 'react'
import pokemonData from './data/pokemon.json'
import PokemonList from './components/PokemonList.jsx'
import PokemonDetails from './components/PokemonDetails.jsx'

export default function App() {
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  return (
    <main className="app">
      <h1>My Poke Card</h1>
      <div className="layout">
        <PokemonDetails pokemon={selectedPokemon} />
        <PokemonList
          pokemonList={pokemonData}
          selectedPokemon={selectedPokemon}
          onSelect={setSelectedPokemon}
        />
      </div>
    </main>
  )
}
