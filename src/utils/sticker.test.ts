import { describe, expect, it } from 'vitest'
import {
  clampStickerPosition,
  DEFAULT_STICKER_POSITION,
  moveStickerBy,
  pixelsToPercent,
  STICKER_GAP,
  STICKER_SIZE,
} from './sticker.ts'

const MAX_X = 100 - STICKER_SIZE.width // the right edge of the sticker touches the window's right edge
const MAX_Y = 100 - STICKER_SIZE.height

describe('STICKER_SIZE / DEFAULT_STICKER_POSITION', () => {
  it('is 45% of the window height and square (≈ 27.2% of the window width)', () => {
    expect(STICKER_SIZE.height).toBe(45)
    expect(STICKER_SIZE.width).toBeCloseTo(27.22, 2)
  })

  it('starts at the bottom right, 3% from the right and bottom edges', () => {
    expect(DEFAULT_STICKER_POSITION.x + STICKER_SIZE.width + STICKER_GAP).toBeCloseTo(100, 10)
    expect(DEFAULT_STICKER_POSITION.y + STICKER_SIZE.height + STICKER_GAP).toBeCloseTo(100, 10)
  })

  it('the starting position is inside the window', () => {
    expect(clampStickerPosition(DEFAULT_STICKER_POSITION)).toEqual(DEFAULT_STICKER_POSITION)
  })
})

describe('clampStickerPosition', () => {
  it('keeps a position that is already inside', () => {
    expect(clampStickerPosition({ x: 30, y: 20 })).toEqual({ x: 30, y: 20 })
  })

  it('pulls the sticker back from each edge', () => {
    expect(clampStickerPosition({ x: -10, y: 20 })).toEqual({ x: 0, y: 20 }) // left
    expect(clampStickerPosition({ x: 30, y: -5 })).toEqual({ x: 30, y: 0 }) // top
    expect(clampStickerPosition({ x: 95, y: 20 })).toEqual({ x: MAX_X, y: 20 }) // right
    expect(clampStickerPosition({ x: 30, y: 90 })).toEqual({ x: 30, y: MAX_Y }) // bottom
  })

  it('pulls the sticker back into the corners', () => {
    expect(clampStickerPosition({ x: -50, y: -50 })).toEqual({ x: 0, y: 0 })
    expect(clampStickerPosition({ x: 500, y: 500 })).toEqual({ x: MAX_X, y: MAX_Y })
  })
})

describe('moveStickerBy', () => {
  it('moves by the given percent', () => {
    expect(moveStickerBy({ x: 30, y: 20 }, 2, -2)).toEqual({ x: 32, y: 18 })
  })

  it('never moves it out of the window', () => {
    expect(moveStickerBy({ x: 1, y: 1 }, -10, -10)).toEqual({ x: 0, y: 0 })
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
