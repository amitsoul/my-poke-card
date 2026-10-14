// Site navigation. NavLink adds the "active" class to the link of the page we're on.
import { NavLink } from 'react-router'

export default function NavBar() {
  return (
    <nav className="navbar" aria-label="Main">
      <NavLink to="/" className="nav-link">
        Pokémon
      </NavLink>
    </nav>
  )
}
