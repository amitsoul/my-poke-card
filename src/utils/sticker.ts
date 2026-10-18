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

// The die-cut look reaches past the image (the filter on .poke-card-sticker-image in index.css), in design px:
// a 2px white outline on every side, then a dark shadow 2px lower with a 3px blur.
const OUTLINE = 2
const SHADOW_DOWN = 2
const SHADOW_BLUR = 3

// So the sticker keeps this much room from each edge of the window (in %), and its outline and shadow are never cut:
//   left and right: outline + blur = 5px · top: outline + blur − the shadow's move down = 3px · bottom: 2 + 2 + 3 = 7px
export const STICKER_MARGIN = {
  left: ((OUTLINE + SHADOW_BLUR) / WINDOW_WIDTH) * 100,
  right: ((OUTLINE + SHADOW_BLUR) / WINDOW_WIDTH) * 100,
  top: ((OUTLINE + SHADOW_BLUR - SHADOW_DOWN) / WINDOW_HEIGHT) * 100,
  bottom: ((OUTLINE + SHADOW_DOWN + SHADOW_BLUR) / WINDOW_HEIGHT) * 100,
}

// The smallest and largest x / y the sticker's top-left corner can have
export const STICKER_LIMITS = {
  minX: STICKER_MARGIN.left,
  maxX: 100 - STICKER_SIZE.width - STICKER_MARGIN.right,
  minY: STICKER_MARGIN.top,
  maxY: 100 - STICKER_SIZE.height - STICKER_MARGIN.bottom,
}

// Starts at the bottom right, with 5 design px of free space to the right of and below its shadow
const START_SPACE = 5
export const DEFAULT_STICKER_POSITION: StickerPosition = {
  x: STICKER_LIMITS.maxX - (START_SPACE / WINDOW_WIDTH) * 100,
  y: STICKER_LIMITS.maxY - (START_SPACE / WINDOW_HEIGHT) * 100,
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Keeps the WHOLE sticker — with its outline and shadow — inside the window.
// Only used when the sticker moves: old saved cards keep the position they were saved with.
export function clampStickerPosition(position: StickerPosition): StickerPosition {
  return {
    x: clamp(position.x, STICKER_LIMITS.minX, STICKER_LIMITS.maxX),
    y: clamp(position.y, STICKER_LIMITS.minY, STICKER_LIMITS.maxY),
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
