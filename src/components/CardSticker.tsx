// The Pokémon sticker on the photo (CARD_SPEC.md "The sticker").
// With onMove it can be moved: drag it (mouse, finger, pen) or use the arrow keys when it has focus.
// Without onMove it stays where it is (the saved card and the PNG in task 11).
import { useId, useRef, type KeyboardEvent, type PointerEvent } from 'react'
import { moveStickerBy, pixelsToPercent, type StickerPosition } from '../utils/sticker.ts'

interface CardStickerProps {
  src: string // the official artwork
  pokemonName: string // already formatted, e.g. "Pikachu"
  position: StickerPosition
  onMove?: (position: StickerPosition) => void
}

const KEY_STEP = 2 // % per arrow press
const SHIFT_KEY_STEP = 10 // % with Shift held

// Arrow key → which way to move (in steps)
const ARROWS: Record<string, { x: number; y: number }> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
}

export default function CardSticker({ src, pokemonName, position, onMove }: CardStickerProps) {
  const descriptionId = useId()
  // Where the drag started: the pointer on screen and the sticker's position at that moment
  const dragStart = useRef<{ x: number; y: number; position: StickerPosition } | null>(null)

  const placement = { left: `${position.x}%`, top: `${position.y}%` }
  // crossOrigin: lets the PNG export (task 11) read the artwork; draggable={false}: no browser "drag this image"
  const image = (alt: string) => (
    <img className="poke-card-sticker-image" src={src} alt={alt} crossOrigin="anonymous" draggable={false} />
  )

  // A fixed sticker: just the image
  if (onMove === undefined) {
    return (
      <span className="poke-card-sticker" style={placement}>
        {image(pokemonName)}
      </span>
    )
  }
  const move = onMove

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    // Keep getting the pointer's moves even if the finger slides off the sticker
    // (?. because the test environment, jsdom, doesn't have setPointerCapture)
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragStart.current = { x: event.clientX, y: event.clientY, position }
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const start = dragStart.current
    const photoWindow = event.currentTarget.parentElement
    if (start === null || photoWindow === null) return
    // How far the pointer moved since the start, as % of the window (inside its border), then kept inside it
    const { dx, dy } = pixelsToPercent(
      event.clientX - start.x,
      event.clientY - start.y,
      photoWindow.clientWidth,
      photoWindow.clientHeight,
    )
    move(moveStickerBy(start.position, dx, dy))
  }

  function handlePointerEnd() {
    dragStart.current = null
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const direction = ARROWS[event.key]
    if (direction === undefined) return // other keys (Tab, Enter…) work as usual
    event.preventDefault() // the arrows move the sticker instead of scrolling the page
    const step = event.shiftKey ? SHIFT_KEY_STEP : KEY_STEP
    move(moveStickerBy(position, direction.x * step, direction.y * step))
  }

  return (
    <>
      <button
        type="button"
        className="poke-card-sticker sticker-button"
        style={placement}
        aria-label={`${pokemonName} sticker`}
        aria-describedby={descriptionId}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onKeyDown={handleKeyDown}
      >
        {/* The button has the name; the image inside is only the picture */}
        {image('')}
      </button>
      <span id={descriptionId} className="visually-hidden">
        Drag to move it, or use the arrow keys. Hold Shift to move faster.
      </span>
    </>
  )
}
