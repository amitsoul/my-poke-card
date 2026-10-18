import { describe, expect, it } from 'vitest'
import {
  clampStickerPosition,
  DEFAULT_STICKER_POSITION,
  moveStickerBy,
  pixelsToPercent,
  STICKER_LIMITS,
  STICKER_MARGIN,
  STICKER_SIZE,
} from './sticker.ts'

const { minX: MIN_X, maxX: MAX_X, minY: MIN_Y, maxY: MAX_Y } = STICKER_LIMITS

// % of the 324×196 window → design pixels, to compare with the CSS filter's numbers
const toPixelsX = (percent: number) => (percent / 100) * 324
const toPixelsY = (percent: number) => (percent / 100) * 196

describe('STICKER_SIZE / DEFAULT_STICKER_POSITION', () => {
  it('is 45% of the window height and square (≈ 27.2% of the window width)', () => {
    expect(STICKER_SIZE.height).toBe(45)
    expect(STICKER_SIZE.width).toBeCloseTo(27.22, 2)
  })

  it('starts at the bottom right, with 5 design px free beyond the shadow (right 5 + 5, bottom 7 + 5)', () => {
    expect(toPixelsX(100 - DEFAULT_STICKER_POSITION.x - STICKER_SIZE.width)).toBeCloseTo(10, 10)
    expect(toPixelsY(100 - DEFAULT_STICKER_POSITION.y - STICKER_SIZE.height)).toBeCloseTo(12, 10)
  })

  it('the starting position is inside the limits, so its shadow fits from the start', () => {
    expect(clampStickerPosition(DEFAULT_STICKER_POSITION)).toEqual(DEFAULT_STICKER_POSITION)
  })
})

describe('STICKER_MARGIN', () => {
  // From the filter in index.css: a 2px outline, then a shadow 2px lower with a 3px blur
  it('is the room the outline and shadow need on each side, in design px: 5 left/right, 3 top, 7 bottom', () => {
    expect(toPixelsX(STICKER_MARGIN.left)).toBeCloseTo(5, 10)
    expect(toPixelsX(STICKER_MARGIN.right)).toBeCloseTo(5, 10)
    expect(toPixelsY(STICKER_MARGIN.top)).toBeCloseTo(3, 10)
    expect(toPixelsY(STICKER_MARGIN.bottom)).toBeCloseTo(7, 10)
  })
})

describe('clampStickerPosition', () => {
  it('keeps a position that is already inside', () => {
    expect(clampStickerPosition({ x: 30, y: 20 })).toEqual({ x: 30, y: 20 })
  })

  it('keeps the margin from each edge: the sticker can no longer touch the window edge', () => {
    expect(clampStickerPosition({ x: 0, y: 20 })).toEqual({ x: MIN_X, y: 20 }) // left
    expect(clampStickerPosition({ x: 30, y: 0 })).toEqual({ x: 30, y: MIN_Y }) // top
    expect(clampStickerPosition({ x: 100 - STICKER_SIZE.width, y: 20 })).toEqual({ x: MAX_X, y: 20 }) // right
    expect(clampStickerPosition({ x: 30, y: 100 - STICKER_SIZE.height })).toEqual({ x: 30, y: MAX_Y }) // bottom
  })

  it('at each limit, the space left to the window edge is exactly the margin', () => {
    expect(MIN_X).toBeCloseTo(STICKER_MARGIN.left, 10)
    expect(100 - MAX_X - STICKER_SIZE.width).toBeCloseTo(STICKER_MARGIN.right, 10)
    expect(MIN_Y).toBeCloseTo(STICKER_MARGIN.top, 10)
    expect(100 - MAX_Y - STICKER_SIZE.height).toBeCloseTo(STICKER_MARGIN.bottom, 10)
  })

  it('pulls the sticker back into the corners', () => {
    expect(clampStickerPosition({ x: -50, y: -50 })).toEqual({ x: MIN_X, y: MIN_Y })
    expect(clampStickerPosition({ x: 500, y: 500 })).toEqual({ x: MAX_X, y: MAX_Y })
  })
})

describe('moveStickerBy', () => {
  it('moves by the given percent', () => {
    expect(moveStickerBy({ x: 30, y: 20 }, 2, -2)).toEqual({ x: 32, y: 18 })
  })

  it('never moves it out of the window', () => {
    expect(moveStickerBy({ x: 3, y: 3 }, -10, -10)).toEqual({ x: MIN_X, y: MIN_Y })
    expect(moveStickerBy({ x: MAX_X - 1, y: MAX_Y - 1 }, 10, 10)).toEqual({ x: MAX_X, y: MAX_Y })
  })
})

describe('pixelsToPercent', () => {
  it('turns a finger movement in pixels into percent of the window', () => {
    // a 324×196 window: 32.4 px right = 10%, 19.6 px down = 10%
    const result = pixelsToPercent(32.4, 19.6, 324, 196)
    expect(result.dx).toBeCloseTo(10, 10)
    expect(result.dy).toBeCloseTo(10, 10)
  })

  it('gives the same percent on a smaller card (a phone-size window of 162×98)', () => {
    const result = pixelsToPercent(16.2, -9.8, 162, 98)
    expect(result.dx).toBeCloseTo(10, 10)
    expect(result.dy).toBeCloseTo(-10, 10)
  })

  it('gives 0 for a window without a size (not on screen yet)', () => {
    expect(pixelsToPercent(10, 10, 0, 0)).toEqual({ dx: 0, dy: 0 })
  })
})
