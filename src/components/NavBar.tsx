// Site navigation. NavLink adds the "active" class to the link of the page we're on.
import { NavLink, useMatch } from 'react-router'

export default function NavBar() {
  // NavLink to "/" is only active on exactly "/", but a details page is part of "Pokémon" too
  const isOnDetailsPage = useMatch('/pokemon/:id') !== null

  return (
    <nav className="navbar" aria-label="Main">
      <NavLink
        to="/"
        className={({ isActive }) => (isActive || isOnDetailsPage ? 'nav-link active' : 'nav-link')}
      >
        Pokémon
      </NavLink>
    </nav>
  )
}
