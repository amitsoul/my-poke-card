// The card's colors per Type (CARD_SPEC.md "Type symbols and colors"). Plain data + functions, no React.
import type { CardType } from '../types/pokemon.ts'

export interface TypeTheme {
  color: string // the symbol's circle (the icon on it is white)
  tint: string // the card's inner panel
  stripTint: string // the Pokédex strip: a bit darker than the panel
}

// Every tint has its own clear color, so no two Types look alike (task 12e2; tested with colorDistance)
export const TYPE_THEME: Record<CardType, TypeTheme> = {
  Grass: { color: '#3E8E3A', tint: '#D3EBBE', stripTint: '#BCDE9E' },
  Fire: { color: '#D2461E', tint: '#FBCDC2', stripTint: '#F6B2A2' },
  Water: { color: '#2A78C4', tint: '#C4DEFB', stripTint: '#A5CBF3' },
  // #C99A00 in the mockup had only ~2.6:1 contrast with the white icon; darkened for WCAG 1.4.11 (3:1)
  Lightning: { color: '#A67C00', tint: '#FFF1A0', stripTint: '#F9E26B' },
  Psychic: { color: '#8E4BA8', tint: '#EED2F2', stripTint: '#E0B6E8' },
  Fighting: { color: '#A3521F', tint: '#E3CBA8', stripTint: '#D4B488' },
  Darkness: { color: '#3B3F4A', tint: '#C3C2DA', stripTint: '#ADACC9' },
  Metal: { color: '#69767F', tint: '#CFD5D8', stripTint: '#B9C2C7' },
  Dragon: { color: '#7D6619', tint: '#D6D29C', stripTint: '#C2BD7E' },
  Colorless: { color: '#8A877C', tint: '#FAF4DF', stripTint: '#EFE6C6' },
}

// The card's text colors (the same values are in src/index.css), so the tests can check them on every tint
export const CARD_TEXT_COLOR = '#1E1B14' // name, attacks, strip, flavor text
export const CARD_RED = '#8B2318' // HP and the Ability

// A color's red, green and blue as amounts of light, 0 … 1. A screen color like #808080 is not "half the light":
// this standard sRGB formula undoes the screen's curve. Both helpers below start from these numbers.
function toLinearRgb(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return [r, g, b]
}

// How bright a color looks to the eye, 0 (black) … 1 (white) — the WCAG "relative luminance".
// Green counts most and blue least, because our eyes are most sensitive to green.
function relativeLuminance(hex: string): number {
  const [r, g, b] = toLinearRgb(hex)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// A color in CIELAB: L = lightness (0–100), a = green ↔ red, b = blue ↔ yellow.
// CIELAB is built so that the same distance looks like about the same difference to the eye.
function toLab(hex: string): [number, number, number] {
  const [r, g, b] = toLinearRgb(hex)
  // 1. Light → the standard XYZ values, each divided by the value for white (D65)
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  // 2. A cube root, because the eye notices changes in dark colors more than in light ones
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

// How different two colors look: ΔE76, the straight-line distance between them in CIELAB.
// About 2 = the smallest difference you can see side by side · 10+ = clearly different colors at a glance.
export function colorDistance(hexA: string, hexB: string): number {
  const [l1, a1, b1] = toLab(hexA)
  const [l2, a2, b2] = toLab(hexB)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
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
