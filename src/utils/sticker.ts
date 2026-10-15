// Where the Pokémon sticker sits in the photo window (CARD_SPEC.md "The sticker"). Plain functions, no React.
// Positions are in PERCENT of the window, so the sticker lands in the same place at any card size
// (phone, desktop, the PNG in task 11).

// The sticker's top-left corner: x = % of the window's width from the left, y = % of its height from the top
export interface StickerPosition {
  x: number
  y: number
}

// The window inside its gold border, in design pixels: 380 − 2×12 (frame) − 2×12 (panel padding) − 2×4 (border)
const WINDOW_WIDTH = 324
const WINDOW_HEIGHT = 196

// The sticker is square and 45% of the window's height → 27.2% of its width
export const STICKER_SIZE = {
  height: 45,
  width: (45 * WINDOW_HEIGHT) / WINDOW_WIDTH,
}

// Starts at the bottom right, 3% from the edges
export const STICKER_GAP = 3
export const DEFAULT_STICKER_POSITION: StickerPosition = {
  x: 100 - STICKER_SIZE.width - STICKER_GAP,
  y: 100 - STICKER_SIZE.height - STICKER_GAP,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Keeps the WHOLE sticker inside the window: x from 0 to (100 − its width), y from 0 to (100 − its height)
export function clampStickerPosition(position: StickerPosition): StickerPosition {
  return {
    x: clamp(position.x, 0, 100 - STICKER_SIZE.width),
    y: clamp(position.y, 0, 100 - STICKER_SIZE.height),
  }
}

// Moves the sticker by dx / dy percent, and keeps it inside
export function moveStickerBy(position: StickerPosition, dx: number, dy: number): StickerPosition {
  return clampStickerPosition({ x: position.x + dx, y: position.y + dy })
}

// A finger or mouse moved by (dxPixels, dyPixels) on screen → how many percent of the window that is
export function pixelsToPercent(
  dxPixels: number,
  dyPixels: number,
  windowWidth: number,
  windowHeight: number,
): { dx: number; dy: number } {
  return {
    dx: windowWidth > 0 ? (dxPixels / windowWidth) * 100 : 0,
    dy: windowHeight > 0 ? (dyPixels / windowHeight) * 100 : 0,
  }
}
