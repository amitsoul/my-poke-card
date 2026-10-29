// Page "/": the landing page. The hero with two example cards, "How it works" and "About me".
// The example cards are real cards (the same PokeCard as everywhere) with fixed data: no PokéAPI calls here.
import { Link } from 'react-router'
import PokeCard from '../components/PokeCard.tsx'
import { SAMPLE_CARDS } from '../data/sampleCards.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import { APP_NAME, toTitleCase } from '../utils/text.ts'

const STEPS = [
  { to: '/pokemon', title: 'Pick a Pokémon', text: 'Browse all of them and choose your favorite.' },
  { to: '/create', title: 'Add your photo and details', text: 'Your name, age, a superpower and a line about you.' },
  {
    to: '/my-cards',
    title: 'Save and download',
    text: 'Keep your cards in My Cards and download each one as a PNG.',
  },
]

export default function HomePage() {
  return (
    <div className="home-page">
      <title>{APP_NAME}</title>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-text">
          <h1 id="home-title" className="page-title">
            Turn yourself into a Pokémon card
          </h1>
          <p className="home-lead">
            Pick a Pokémon, add your photo and a few words about you, and get your own card to save and download.
          </p>
          <div className="home-actions">
            <Link to="/create" className="button">
              Create your card
            </Link>
            <Link to="/pokemon" className="button button-secondary">
              Find a Pokémon
            </Link>
          </div>
        </div>

        {/* Two real cards as examples; never tilted, like every card */}
        <ul className="home-cards" aria-label="Example cards">
          {SAMPLE_CARDS.map((sample) => (
            <li key={sample.number}>
              <PokeCard
                card={sample.card}
                pokemon={sample.pokemon}
                cardInfo={{ status: 'ready', info: sample.info }}
                onRetryCardInfo={() => {}}
                cardNumber={sample.number}
                heading={`Example: ${toTitleCase(sample.card.name)}'s ${formatPokemonName(sample.pokemon.name)}`}
                focusOnMount={false}
                photoAlt={sample.photoAlt}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="home-section" aria-labelledby="how-title">
        <h2 id="how-title" className="section-title">
          How it works
        </h2>
        <ol className="home-steps">
          {STEPS.map((step, index) => (
            <li key={step.to} className="home-step">
              <span className="home-step-number" aria-hidden="true">
                {index + 1}
              </span>
              {/* Only the title is the link (a short name for screen readers); CSS makes the whole sticker clickable */}
              <Link to={step.to} className="home-step-link">
                {step.title}
              </Link>
              <p className="home-step-text">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section home-about" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">
          About me
        </h2>
        <p>
          Hi, I'm Amit. I made My Poké Card as my final project, with my partner Amit and our cats, Philip and Charlie,
          in mind. They're the first two cards on this page. It's a fan-made project and not an official Pokémon
          product.
        </p>
      </section>
    </div>
  )
}
