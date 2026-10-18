// A Type symbol: our own SVG — a colored circle with a white icon (no official logos).
// Used for the card's Type, attack costs, Weakness, Resistance and Retreat.
import type { ReactElement } from 'react'
import type { CardType } from '../types/pokemon.ts'
import { TYPE_THEME } from '../utils/cardTheme.ts'

interface TypeSymbolProps {
  type: CardType
  size?: string // a CSS size, e.g. "26px" or "calc(26 * var(--u))"; default: a bit bigger than the text
  // true inside a group that already has a name (e.g. "Cost: Lightning, Colorless"),
  // so screen readers don't read every symbol a second time
  decorative?: boolean
}

// Drawn on a 32×32 grid with the center at (16, 16).
// The circle stays 1 unit away from the edge, so it's never cut at small or fractional pixel sizes.
export const CIRCLE_RADIUS = 15
// Every icon fits inside this smaller circle, so there is always color around it (checked in TypeSymbol.test.tsx)
export const ICON_SAFE_RADIUS = 12

// The white icons. Only straight lines and Bézier curves with absolute points (M, L, C, Z) — no arcs —
// so the test can check every point. `bg` = the circle's color, for cut-out details.
function icon(type: CardType, bg: string): ReactElement {
  switch (type) {
    case 'Grass': // leaf with a vein
      return (
        <>
          <path d="M8.6 23.4C8.6 15.1 14.2 9.6 23.4 8.6C23.4 17.8 17.8 23.4 8.6 23.4Z" fill="#fff" />
          <path d="M9.6 22.4L18.8 13.2" stroke={bg} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'Fire': // flame
      return (
        <path
          d="M16 5.9C16.9 10.5 22.4 12.3 22.4 18.8C22.4 22.3 19.6 25.2 16 25.2C12.4 25.2 9.6 22.3 9.6 18.8C9.6 16 10.9 14.2 12.3 12.8C12.3 15.1 13.2 16.5 14.6 16.9C13.7 13.2 14.2 9.6 16 5.9Z"
          fill="#fff"
        />
      )
    case 'Water': // droplet
      return (
        <path
          d="M16 5.9C20.1 11.9 22.9 15.1 22.9 18.8C22.9 22.6 19.8 25.7 16 25.7C12.2 25.7 9.1 22.6 9.1 18.8C9.1 15.1 11.9 11.9 16 5.9Z"
          fill="#fff"
        />
      )
    case 'Lightning': // bolt
      return <path d="M18.3 5L9.1 17.8L15.1 17.8L12.8 27L22.9 14.2L16.9 14.2L18.3 5Z" fill="#fff" />
    case 'Psychic': // eye
      return (
        <>
          <path
            d="M5.4 16C8.2 10.9 11.9 8.6 16 8.6C20.1 8.6 23.8 10.9 26.6 16C23.8 21.1 20.1 23.4 16 23.4C11.9 23.4 8.2 21.1 5.4 16Z"
            fill="#fff"
          />
          <circle cx="16" cy="16" r="3.9" fill={bg} />
          <circle cx="16" cy="16" r="1.5" fill="#fff" />
        </>
      )
    case 'Fighting': // fist: a block with finger lines and a thumb
      return (
        <>
          <path
            d="M9.6 11.9L21.1 11.9C22.3 11.9 23.4 12.9 23.4 14.2L23.4 20.6C23.4 23.1 21.3 25.2 18.8 25.2L12.8 25.2C11 25.2 9.6 23.8 9.6 22Z"
            fill="#fff"
          />
          <path d="M13.2 11.9L13.2 16.5M16.5 11.9L16.5 16.5M19.7 11.9L19.7 16.5" stroke={bg} strokeWidth="1.4" />
          <path d="M9.6 18.3L16 18.3" stroke={bg} strokeWidth="1.4" strokeLinecap="round" />
        </>
      )
    case 'Darkness': // crescent moon: a circle (center 16,16) with a smaller one cut away at the top right
      return (
        <path
          d="M25.4 19.5C23.7 24.1 18.8 26.8 14 25.8C9.2 24.8 5.8 20.4 6 15.5C6.2 10.6 10 6.6 15 6.1C11.5 9 11 14.1 13.8 17.7C16.6 21.3 21.7 22.1 25.4 19.5Z"
          fill="#fff"
        />
      )
    case 'Metal': // triangle with a cut-out triangle inside
      return (
        <>
          <path d="M16 7.6L24.8 23.2L7.2 23.2Z" fill="#fff" />
          <path d="M16 13.6L20 20.8L12 20.8Z" fill={bg} />
        </>
      )
    case 'Dragon': // three claw slashes
      return (
        <>
          <path d="M9.1 24.3C9.6 17.8 11.4 12.8 15.1 8.2C13.7 13.2 12.8 18.3 12.3 24.3Z" fill="#fff" />
          <path d="M14.2 24.7C14.6 18.3 16.5 13.2 20.1 8.6C18.8 13.7 17.8 18.8 17.4 24.7Z" fill="#fff" />
          <path d="M19.2 24.3C19.7 18.8 21.5 14.6 23.8 11.4C22.9 15.5 22.4 19.7 22 24.3Z" fill="#fff" />
        </>
      )
    case 'Colorless': // five-pointed star
      return (
        <path
          d="M16 6.3L18.9 12.4L25.4 13.1L20.5 17.7L21.9 24.2L16 20.9L10.1 24.2L11.5 17.7L6.6 13.1L13.1 12.4Z"
          fill="#fff"
        />
      )
  }
}

export default function TypeSymbol({ type, size = '1.25em', decorative = false }: TypeSymbolProps) {
  const { color } = TYPE_THEME[type]
  return (
    <svg
      className="type-symbol"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : type}
      aria-hidden={decorative ? true : undefined}
      focusable="false" // old browsers would otherwise put the SVG in the Tab order
    >
      <circle cx="16" cy="16" r={CIRCLE_RADIUS} fill={color} />
      {icon(type, color)}
    </svg>
  )
}
