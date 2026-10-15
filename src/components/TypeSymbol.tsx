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

// The white icons, drawn on a 32×32 grid (the circle fills it). `bg` = the circle's color, for cut-out details.
function icon(type: CardType, bg: string): ReactElement {
  switch (type) {
    case 'Grass': // leaf with a stem and a vein
      return (
        <>
          <path d="M8 24c0-9 6-15 16-16 0 10-6 16-16 16z" fill="#fff" />
          <path d="M9 23 19 13" stroke={bg} strokeWidth="1.6" strokeLinecap="round" />
        </>
      )
    case 'Fire': // flame
      return <path d="M16 5c1 5 7 7 7 14a7 7 0 0 1-14 0c0-3 1.5-5 3-6.5 0 2.5 1 4 2.5 4.5C13.5 13 14 9 16 5z" fill="#fff" />
    case 'Water': // droplet
      return <path d="M16 5c4.5 6.5 7.5 10 7.5 14a7.5 7.5 0 0 1-15 0c0-4 3-7.5 7.5-14z" fill="#fff" />
    case 'Lightning': // bolt
      return <path d="M18.5 4 8.5 18h6.5l-2.5 10L23.5 14H17l1.5-10z" fill="#fff" />
    case 'Psychic': // eye
      return (
        <>
          <path d="M4.5 16c3-5.5 7-8 11.5-8s8.5 2.5 11.5 8c-3 5.5-7 8-11.5 8s-8.5-2.5-11.5-8z" fill="#fff" />
          <circle cx="16" cy="16" r="4.2" fill={bg} />
          <circle cx="16" cy="16" r="1.6" fill="#fff" />
        </>
      )
    case 'Fighting': // fist: a block with finger lines and a thumb
      return (
        <>
          <path d="M9 11.5h12.5a2.5 2.5 0 0 1 2.5 2.5v7a5 5 0 0 1-5 5h-6.5A3.5 3.5 0 0 1 9 22.5z" fill="#fff" />
          <path d="M13 11.5v5M16.5 11.5v5M20 11.5v5" stroke={bg} strokeWidth="1.5" />
          <path d="M9 18.5h7" stroke={bg} strokeWidth="1.5" strokeLinecap="round" />
        </>
      )
    case 'Darkness': // crescent moon
      return <path d="M19.5 5.5a10.5 10.5 0 1 0 0 21 8.5 8.5 0 0 1 0-21z" fill="#fff" />
    case 'Metal': // triangle with a cut-out triangle inside
      return (
        <>
          <path d="M16 5.5 27 25H5z" fill="#fff" />
          <path d="M16 13 21 22H11z" fill={bg} />
        </>
      )
    case 'Dragon': // three claw slashes
      return (
        <>
          <path d="M8.5 25C9 18 11 12.5 15 7.5c-1.5 5.5-2.5 11-3 17.5z" fill="#fff" />
          <path d="M14 25.5c.5-7 2.5-12.5 6.5-17.5-1.5 5.5-2.5 11-3 17.5z" fill="#fff" />
          <path d="M19.5 25c.5-6 2.5-10.5 5-14-1 4.5-1.5 9-2 14z" fill="#fff" />
        </>
      )
    case 'Colorless': // five-pointed star
      return <path d="M16 5.5l3.1 6.6 7.1.8-5.3 4.9 1.5 7.1L16 21.3l-6.4 3.6 1.5-7.1-5.3-4.9 7.1-.8z" fill="#fff" />
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
      <circle cx="16" cy="16" r="16" fill={color} />
      {icon(type, color)}
    </svg>
  )
}
