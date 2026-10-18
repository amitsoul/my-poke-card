// Site navigation. NavLink adds the "active" class to the link of the page we're on.
import { NavLink, useMatch } from 'react-router'
import { parsePokemonId } from '../utils/pokemonId.ts'

export default function NavBar() {
  // A NavLink is also active on the pages below it: "/pokemon" on /pokemon/25, "/create" on /create/25.
  // But /pokemon/abc and /create/abc show the 404 page, so their link isn't highlighted there.
  const detailsMatch = useMatch('/pokemon/:id')
  const isOnInvalidDetailsPage = detailsMatch !== null && parsePokemonId(detailsMatch.params.id) === null
  const createMatch = useMatch('/create/:id')
  const isOnInvalidCreatePage = createMatch !== null && parsePokemonId(createMatch.params.id) === null

  return (
    <nav className="navbar" aria-label="Main">
      <NavLink
        to="/pokemon"
        className={({ isActive }) => (isActive && !isOnInvalidDetailsPage ? 'nav-link active' : 'nav-link')}
      >
        Find a Pokémon
      </NavLink>
      <NavLink
        to="/create"
        className={({ isActive }) => (isActive && !isOnInvalidCreatePage ? 'nav-link active' : 'nav-link')}
      >
        Create card
      </NavLink>
      <NavLink to="/my-cards" className="nav-link">
        My Cards
      </NavLink>
    </nav>
  )
}
