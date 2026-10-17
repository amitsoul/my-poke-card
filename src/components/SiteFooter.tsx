// Site footer on every page: the fan-made disclaimer and where the data comes from.
// It sits outside the card (.poke-card-frame), so it never ends up in a downloaded PNG.
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>Fan-made · Not an official Pokémon card</p>
      <p>
        Data from <a href="https://pokeapi.co">PokéAPI</a>
      </p>
    </footer>
  )
}
