// Page for any URL that doesn't exist (route "*"), and for /pokemon/<not a valid id>.
import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="status">
      <h1>Page not found</h1>
      <p>We couldn't find this page. Maybe the link is broken or the address has a typo.</p>
      <Link to="/" className="button">
        Back to the Pokémon list
      </Link>
    </section>
  )
}
