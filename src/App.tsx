// The app layout: the nav menu on every page, and below it the page that matches the URL.
import { Route, Routes } from 'react-router'
import NavBar from './components/NavBar.tsx'
import PokemonListPage from './pages/PokemonListPage.tsx'
import PokemonDetailsPage from './pages/PokemonDetailsPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'

export default function App() {
  return (
    <>
      <NavBar />
      <main className="app">
        <Routes>
          <Route path="/" element={<PokemonListPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
          {/* "*" = any URL that no other route matches */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}
