// Page "/my-cards": the saved cards (newest first), with favorites and Delete.
// The "All / Favorites" choice lives in the URL (?show=favorites), like the search on the list page.
import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useSearchParams } from 'react-router'
import SavedCardItem from '../components/SavedCardItem.tsx'
import {
  deleteSavedCard,
  filterSavedCards,
  loadSavedCards,
  parseShowFilter,
  setFavorite,
  type LoadResult,
  type ShowFilter,
} from '../utils/savedCards.ts'

// "1 saved card couldn't be read and is hidden." / "2 saved cards couldn't be read and are hidden."
function hiddenCardsNote(count: number): string {
  return count === 1
    ? "1 saved card couldn't be read and is hidden."
    : `${count} saved cards couldn't be read and are hidden.`
}

export default function MyCardsPage() {
  // Read the storage once when the page opens (later: again after every change that worked)
  const [loaded, setLoaded] = useState<LoadResult>(() => loadSavedCards())
  const [changeFailed, setChangeFailed] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()
  const headingRef = useRef<HTMLHeadingElement>(null)

  const show = parseShowFilter(searchParams.get('show'))
  const favoritesCount = loaded.cards.filter((saved) => saved.favorite).length
  const shownCards = filterSavedCards(loaded.cards, show)

  function handleShow(next: ShowFilter) {
    setSearchParams(next === 'favorites' ? { show: 'favorites' } : {})
  }

  // Write first; only if it worked, show the change (by reading the storage again).
  // If it failed, nothing changed on screen — and the user is told.
  function applyChange(write: () => { ok: boolean }): boolean {
    const result = write()
    setChangeFailed(!result.ok)
    if (result.ok) setLoaded(loadSavedCards())
    return result.ok
  }

  function handleToggleFavorite(number: number) {
    const saved = loaded.cards.find((card) => card.number === number)
    if (saved !== undefined) applyChange(() => setFavorite(number, !saved.favorite))
  }

  function handleDelete(number: number) {
    // flushSync: the card is removed from the screen FIRST, then focus moves to the page heading
    flushSync(() => {
      applyChange(() => deleteSavedCard(number))
    })
    headingRef.current?.focus()
  }

  return (
    <div className="my-cards-page">
      <h1 tabIndex={-1} ref={headingRef}>
        My Cards
      </h1>

      {loaded.problem === 'unreadable' && <p className="status-note">Your saved cards couldn't be read.</p>}
      {loaded.problem === 'blocked' && (
        <p className="status-note">Cards can't be saved in this browser (storage is blocked or full).</p>
      )}
      {loaded.hiddenCount > 0 && <p className="status-note">{hiddenCardsNote(loaded.hiddenCount)}</p>}
      {changeFailed && (
        <p role="alert" className="save-message">
          That change couldn't be saved.
        </p>
      )}

      {loaded.cards.length === 0 && loaded.problem === null && (
        <div className="status">
          <p>You haven't saved any cards yet.</p>
          <Link to="/create" className="button">
            Create your first card
          </Link>
        </div>
      )}

      {loaded.cards.length > 0 && (
        <>
          <div className="my-cards-filter" role="group" aria-label="Show">
            <button
              type="button"
              className={show === 'all' ? 'card-type-button selected' : 'card-type-button'}
              aria-pressed={show === 'all'}
              onClick={() => handleShow('all')}
            >
              All ({loaded.cards.length})
            </button>
            <button
              type="button"
              className={show === 'favorites' ? 'card-type-button selected' : 'card-type-button'}
              aria-pressed={show === 'favorites'}
              onClick={() => handleShow('favorites')}
            >
              Favorites ({favoritesCount})
            </button>
          </div>

          {shownCards.length === 0 && <p className="status">No favorites yet. Tap ❤️ on a card to add it.</p>}

          <ul className="my-cards-grid">
            {shownCards.map((saved) => (
              // The card number is the id: unique and never reused
              <li key={saved.number}>
                <SavedCardItem saved={saved} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
