// The app layout: the nav menu on every page, below it the page that matches the URL, and the footer.
import { Route, Routes } from 'react-router'
import NavBar from './components/NavBar.tsx'
import SiteFooter from './components/SiteFooter.tsx'
import HomePage from './pages/HomePage.tsx'
import PokemonListPage from './pages/PokemonListPage.tsx'
import PokemonDetailsPage from './pages/PokemonDetailsPage.tsx'
import CreateCardPage from './pages/CreateCardPage.tsx'
import MyCardsPage from './pages/MyCardsPage.tsx'
import NotFoundPage from './pages/NotFoundPage.tsx'

export default function App() {
  return (
    <>
      <NavBar />
      <main className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pokemon" element={<PokemonListPage />} />
          <Route path="/pokemon/:id" element={<PokemonDetailsPage />} />
          <Route path="/create" element={<CreateCardPage />} />
          <Route path="/create/:id" element={<CreateCardPage />} />
          <Route path="/my-cards" element={<MyCardsPage />} />
          {/* "*" = any URL that no other route matches */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <SiteFooter />
    </>
  )
}
