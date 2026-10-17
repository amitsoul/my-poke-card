// Helpers for showing a Pokémon: its name, its game types and its image.
import type { CardPokemon, PokemonDetailsResponse } from '../types/pokemon.ts'
import { getArtworkUrl } from './api.ts'

// PokéAPI names are lowercase with hyphens: "pikachu" → "Pikachu", "ho-oh" → "Ho-Oh", "mr-mime" → "Mr-Mime"
export function formatPokemonName(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

// The game types in slot order, so the first type (which decides the card type) is always first
export function getGameTypes(details: PokemonDetailsResponse): string[] {
  return [...details.types].sort((a, b) => a.slot - b.slot).map((item) => item.type.name)
}

// The official artwork, or — if the response has none — the artwork URL built from the id
export function getDetailsImage(details: PokemonDetailsResponse): string {
  return details.sprites.other['official-artwork'].front_default || getArtworkUrl(details.id)
}

// The API's details → the small CardPokemon a card is drawn from (and saved with)
export function toCardPokemon(details: PokemonDetailsResponse): CardPokemon {
  return {
    id: details.id,
    name: details.name,
    gameTypes: getGameTypes(details),
    height: details.height,
    weight: details.weight,
    artworkUrl: getDetailsImage(details),
  }
}
