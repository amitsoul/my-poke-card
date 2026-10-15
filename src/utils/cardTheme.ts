// The card's colors per Type (CARD_SPEC.md "Type symbols and colors"). Plain data + functions, no React.
import type { CardType } from '../types/pokemon.ts'

export interface TypeTheme {
  color: string // the symbol's circle (the icon on it is white)
  tint: string // the card's inner panel
  stripTint: string // the Pokédex strip: a bit darker than the panel
}

export const TYPE_THEME: Record<CardType, TypeTheme> = {
  Grass: { color: '#3E8E3A', tint: '#DCEBC8', stripTint: '#C6DDAA' },
  Fire: { color: '#D9481F', tint: '#F8D6C8', stripTint: '#F0BDA8' },
  Water: { color: '#2A78C4', tint: '#D2E5F6', stripTint: '#B5D3EE' },
  // #C99A00 in the mockup had only ~2.6:1 contrast with the white icon; darkened for WCAG 1.4.11 (3:1)
  Lightning: { color: '#A67C00', tint: '#FAEDB4', stripTint: '#F2DC86' },
  Psychic: { color: '#8E4BA8', tint: '#E8D9EE', stripTint: '#D7C0E2' },
  Fighting: { color: '#A3521F', tint: '#EBD3C0', stripTint: '#DDBBA0' },
  Darkness: { color: '#3B3F4A', tint: '#D9D9DD', stripTint: '#C2C3C9' },
  Metal: { color: '#6F7C86', tint: '#E1E5E8', stripTint: '#CBD2D7' },
  Dragon: { color: '#7D6619', tint: '#ECE3C3', stripTint: '#DDD0A2' },
  Colorless: { color: '#8A877C', tint: '#ECEBE6', stripTint: '#DAD8D0' },
}

// How bright a color looks to the eye, 0 (black) … 1 (white) — the WCAG "relative luminance"
function relativeLuminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// The WCAG contrast ratio between two colors ("#FFFFFF" vs "#A67C00" → about 3.8). 1 = none, 21 = black on white.
export function contrastRatio(hexA: string, hexB: string): number {
  const [lighter, darker] = [relativeLuminance(hexA), relativeLuminance(hexB)].sort((a, b) => b - a)
  return (lighter + 0.05) / (darker + 0.05)
}

// The card name's font size in design pixels, so long names still fit next to HP and the Type symbol:
// up to 16 characters → 23 · 17–22 → 19 · 23–29 → 16 · 30+ → 14 (and the name may wrap to 2 lines).
// "Amit's Pikachu" (14) → 23 · "Bartholomewz's Squawkabilly-Green-Plumage" (41) → 14
export function getNameFontSize(name: string): number {
  if (name.length <= 16) return 23
  if (name.length <= 22) return 19
  if (name.length <= 29) return 16
  return 14
}
