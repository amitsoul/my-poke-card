// Site navigation. NavLink adds the "active" class to the link of the page we're on.
import { NavLink, useMatch } from 'react-router'
import { parsePokemonId } from '../utils/pokemonId.ts'

export default function NavBar() {
  // NavLink to "/" is only active on exactly "/", but a details page is part of "Pokémon" too.
  // Only a real details page counts: /pokemon/abc shows the 404 page, so "Pokémon" isn't highlighted there.
  const detailsMatch = useMatch('/pokemon/:id')
  const isOnDetailsPage = detailsMatch !== null && parsePokemonId(detailsMatch.params.id) !== null

  // NavLink to "/create" is also active on /create/25 by itself. Same rule: not on /create/abc (the 404 page).
  const createMatch = useMatch('/create/:id')
  const isOnInvalidCreatePage = createMatch !== null && parsePokemonId(createMatch.params.id) === null

  return (
    <nav className="navbar" aria-label="Main">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive || isOnDetailsPage ? 'nav-link active' : 'nav-link')}
      >
        Pokémon
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
