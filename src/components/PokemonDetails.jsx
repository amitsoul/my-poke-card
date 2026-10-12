// Details of the selected Pokémon. Shows a message when nothing is selected.
// The list only has id, name and image, so the details are fetched here when the selection changes.
import { useEffect, useState } from 'react'
import { getEnergy } from '../utils/energy.js'

const API_URL = 'https://pokeapi.co/api/v2'

export default function PokemonDetails({ pokemon }) {
  const [details, setDetails] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  const pokemonId = pokemon === null ? null : pokemon.id

  // Runs every time a different Pokémon is selected (or "Try again" is clicked)
  useEffect(() => {
    if (pokemonId === null) return

    // Becomes false if another Pokémon is selected before this answer arrives
    let isCurrent = true

    async function loadDetails() {
      setDetails(null)
      setIsLoading(true)
      setHasError(false)

      try {
        const response = await fetch(`${API_URL}/pokemon/${pokemonId}`)
        if (!response.ok) throw new Error('Details request failed')
        const data = await response.json()

        if (isCurrent) {
          setDetails({
            // Sort by slot so the first type is always first (it decides the energy)
            types: [...data.types].sort((a, b) => a.slot - b.slot).map((item) => item.type.name),
            weight: data.weight, // in hectograms: 60 → 6.0 kg
            artwork: data.sprites.other['official-artwork'].front_default,
          })
        }
      } catch {
        if (isCurrent) setHasError(true)
      } finally {
        if (isCurrent) setIsLoading(false)
      }
    }

    loadDetails()

    // Cleanup: React calls this before the next run, so an old answer is ignored
    return () => {
      isCurrent = false
    }
  }, [pokemonId, retryCount])

  if (pokemon === null) {
    return (
      <section className="pokemon-details">
        <p>Pick a Pokémon to see its details</p>
      </section>
    )
  }

  // 25 → "#025"
  const number = '#' + String(pokemon.id).padStart(3, '0')
  // Some Pokémon have no official artwork; fall back to the list image
  const image = details && details.artwork ? details.artwork : pokemon.image

  return (
    <section className="pokemon-details">
      <img src={image} alt={pokemon.name} width="250" height="250" />
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <p className="pokemon-number">{number}</p>

      {isLoading && <p>Loading details...</p>}

      {hasError && (
        <div>
          <p>Oops! We couldn't load the details.</p>
          <button type="button" className="button" onClick={() => setRetryCount(retryCount + 1)}>
            Try again
          </button>
        </div>
      )}

      {details && (
        <>
          <ul className="pokemon-types">
            {details.types.map((type) => (
              <li key={type} className="pokemon-type">{type}</li>
            ))}
          </ul>
          <p className="pokemon-energy">Energy: {getEnergy(details.types)}</p>
          <p className="pokemon-weight">Weight: {(details.weight / 10).toFixed(1)} kg</p>
        </>
      )}
    </section>
  )
}
