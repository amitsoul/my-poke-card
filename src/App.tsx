// The app layout: the nav menu on every page, and below it the page that matches the URL.
import { Route, Routes } from 'react-router'
import NavBar from './components/NavBar.tsx'
import PokemonListPage from './pages/PokemonListPage.tsx'
import PokemonDetailsPage from './pages/PokemonDetailsPage.tsx'

export default function App() {
  return (
    <>
      <NavBar />
      <main className="app">
        <Routes>
          <Route path="/" element={<PokemonListPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
        </Routes>
      </main>
    </>
  )
}
