// The two example cards on the landing page: real cards the app could make (they pass the form's rules,
// see sampleCards.test.ts). Fixed data like a saved card, so the landing page needs no PokéAPI calls.
// The Pokémon and its genus and attacks were made once by the app's own code (the same hooks as the
// Create page) against the real PokéAPI. Type, Weakness and Retreat are worked out by the card as usual.
import type { PokemonCardInfo } from '../hooks/usePokemonCardInfo.ts'
import type { CardPokemon } from '../types/pokemon.ts'
import type { CardData } from '../utils/cardForm.ts'
import { DEFAULT_STICKER_POSITION } from '../utils/sticker.ts'
// Our own illustrations, 800×533 JPEG (published with permission)
import couplePhoto from '../assets/landing/sample-couple.jpg'
import catsPhoto from '../assets/landing/sample-cats.jpg'

export interface SampleCard {
  number: number // shown as "MPC 001"
  card: CardData
  pokemon: CardPokemon
  info: PokemonCardInfo
  photoAlt: string // what the illustration shows, for screen readers
}

const ARTWORK_URL = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork'

export const SAMPLE_CARDS: SampleCard[] = [
  {
    number: 1,
    card: {
      name: 'Amit & Amit',
      age: 24,
      superpower: 'Endless Road Trips',
      aboutYou: 'Two Amits, one team. We never run out of snacks!',
      photo: { dataUrl: couplePhoto, type: 'image/jpeg', size: 82739 },
      stickerPosition: DEFAULT_STICKER_POSITION,
    },
    pokemon: { id: 7, name: 'squirtle', gameTypes: ['water'], height: 5, weight: 90, artworkUrl: `${ARTWORK_URL}/7.png` },
    info: {
      genus: 'Tiny Turtle Pokémon',
      attacks: [
        { name: 'Tackle', damage: 40, cost: ['Water', 'Colorless'] },
        { name: 'Water Gun', damage: 40, cost: ['Water', 'Colorless'] },
      ],
    },
    photoAlt: 'Illustration of Amit and Amit sitting side by side in front of a green hedge',
  },
  {
    number: 2,
    card: {
      name: 'Philip & Charlie',
      age: 9,
      superpower: 'Nap Anywhere',
      aboutYou: 'We knock things off tables and nap in the sun.',
      photo: { dataUrl: catsPhoto, type: 'image/jpeg', size: 64238 },
      stickerPosition: DEFAULT_STICKER_POSITION,
    },
    pokemon: { id: 25, name: 'pikachu', gameTypes: ['electric'], height: 4, weight: 60, artworkUrl: `${ARTWORK_URL}/25.png` },
    info: {
      genus: 'Mouse Pokémon',
      attacks: [
        { name: 'Thunder Shock', damage: 40, cost: ['Lightning', 'Colorless'] },
        { name: 'Quick Attack', damage: 40, cost: ['Lightning', 'Colorless'] },
      ],
    },
    photoAlt:
      'Illustration of Philip and Charlie on a wooden table: Charlie, a cream kitten, rests its chin on its paws, ' +
      'and Philip, a gray tabby, has one leg hanging over the edge',
  },
]
