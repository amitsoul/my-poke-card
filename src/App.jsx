// Task 1: the list comes from a local JSON file. No API yet.
import pokemonData from './data/pokemon.json'
import PokemonList from './components/PokemonList.jsx'

export default function App() {
  return (
    <main className="app">
      <h1>My Poke Card</h1>
      <PokemonList pokemonList={pokemonData} />
    </main>
  )
}
