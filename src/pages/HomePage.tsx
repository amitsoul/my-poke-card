// Page "/": the landing page. The hero with two example cards, "How it works" and "About me".
// The example cards are real cards (the same PokeCard as everywhere) with fixed data: no PokéAPI calls here.
// The small pictures in "How it works" and the stars and quote mark are decoration (hidden from screen readers).
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import couplePhoto from '../assets/landing/sample-couple.jpg'
// A real downloaded PNG of Philip & Charlie's Pikachu, made small (180 × 252 WebP)
import cardMini from '../assets/landing/card-mini.webp'
import PokeCard from '../components/PokeCard.tsx'
import { SAMPLE_CARDS } from '../data/sampleCards.ts'
import { formatPokemonName } from '../utils/pokemonDetails.ts'
import { APP_NAME, toTitleCase } from '../utils/text.ts'

// The logo's five-pointed star (the Colorless star from TypeSymbol)
function Star({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4.2L19.5 11.6L27.5 12.5L21.5 18L23.2 26L16 21.9L8.8 26L10.5 18L4.5 12.5L12.5 11.6Z" fill="currentColor" />
    </svg>
  )
}

// Step 1: a tiny search box with "pika" and a few Type chips
const searchPicture = (
  <>
    <span className="mini-search">
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15.5 15.5L21 21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      pika<span className="mini-caret" />
    </span>
    <span className="mini-chips">
      <span className="mini-chip mini-chip-selected">All</span>
      <span className="mini-chip">Fire</span>
      <span className="mini-chip">Water</span>
      <span className="mini-chip">Grass</span>
    </span>
  </>
)

// Step 2: the couple illustration next to three filled-in fields
const formPicture = (
  <>
    <img className="mini-photo" src={couplePhoto} alt="" />
    <span className="mini-fields">
      <span className="mini-field">Amit &amp; Amit</span>
      <span className="mini-field">24</span>
      <span className="mini-field">Endless Road Trips</span>
    </span>
  </>
)

// Step 3: a small real card next to a round download button
const downloadPicture = (
  <>
    <img className="mini-card" src={cardMini} alt="" />
    <span className="mini-download">
      <span className="mini-download-button">
        <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 4v11M7 10.5l5 5 5-5M5 19.5h14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      PNG
    </span>
  </>
)

const STEPS: { to: string; title: string; text: string; picture: ReactNode; pictureClass: string }[] = [
  {
    to: '/pokemon',
    title: 'Pick a Pokémon',
    text: 'Browse all of them and choose your favorite.',
    picture: searchPicture,
    pictureClass: 'home-step-picture-search',
  },
  {
    to: '/create',
    title: 'Add your photo and details',
    text: 'Your name, age, a superpower and a line about you.',
    picture: formPicture,
    pictureClass: 'home-step-picture-form',
  },
  {
    to: '/my-cards',
    title: 'Save and download',
    text: 'Keep your cards in My Cards and download each one as a PNG.',
    picture: downloadPicture,
    pictureClass: 'home-step-picture-download',
  },
]

export default function HomePage() {
  return (
    <div className="home-page">
      <title>{APP_NAME}</title>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero-text">
          {/* Two lines, read as one title: "Turn yourself into a Pokémon card" */}
          <h1 id="home-title" className="hero-title">
            <span className="hero-title-small">Turn yourself into a</span>{' '}
            <span className="hero-title-big">
              Pokémon card
              <Star className="hero-star" />
            </span>
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

        {/* Two real cards fanned like a hand (only here, as decoration: the cards in Create and My Cards never tilt).
            Their "Example: …" headings are hidden from the eye but keep each card's name for screen readers. */}
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
              <div className="home-step-head">
                <span className="home-step-number" aria-hidden="true">
                  {index + 1}
                </span>
                {/* Only the title is the link (a short name for screen readers); CSS makes the whole step clickable */}
                <Link to={step.to} className="home-step-link">
                  {step.title}
                </Link>
              </div>
              <p className="home-step-text">{step.text}</p>
              <div className={`home-step-picture ${step.pictureClass}`} aria-hidden="true">
                {step.picture}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section home-about" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">
          About me
        </h2>
        <p className="home-about-text">
          <span className="home-quote" aria-hidden="true">
            “
          </span>
          Hi, I'm Amit. I made My Poké Card as my final project, with my partner Amit and our cats, Philip and Charlie,
          in mind. They're the first two cards on this page. It's a fan-made project and not an official Pokémon
          product.
        </p>
        <p className="home-signature">
          — Amit <Star className="home-signature-star" />
        </p>
      </section>
    </div>
  )
}
