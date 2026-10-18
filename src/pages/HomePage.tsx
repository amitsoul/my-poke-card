// Page "/": the landing page. For now only the headline and the two ways in;
// the hero cards, "How it works" and "About me" come later in task 12.
import { Link } from 'react-router'
import { APP_NAME } from '../utils/text.ts'

export default function HomePage() {
  return (
    <section className="status">
      <title>{APP_NAME}</title>
      <h1>Turn yourself into a Pokémon card</h1>
      <div className="status-actions">
        <Link to="/create" className="button">
          Create your card
        </Link>
        <Link to="/pokemon" className="button">
          Find a Pokémon
        </Link>
      </div>
    </section>
  )
}
