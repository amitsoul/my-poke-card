// Details of the selected Pokémon. Shows a message when nothing is selected.

export default function PokemonDetails({ pokemon }) {
  if (pokemon === null) {
    return (
      <section className="pokemon-details">
        <p>Pick a Pokémon to see its details</p>
      </section>
    )
  }

  // 25 → "#025"
  const number = '#' + String(pokemon.id).padStart(3, '0')

  return (
    <section className="pokemon-details">
      <img src={pokemon.image} alt={pokemon.name} width="250" height="250" />
      <h2 className="pokemon-name">{pokemon.name}</h2>
      <p className="pokemon-number">{number}</p>
      <ul className="pokemon-types">
        {pokemon.types.map((type) => (
          <li key={type} className="pokemon-type">{type}</li>
        ))}
      </ul>
    </section>
  )
}
