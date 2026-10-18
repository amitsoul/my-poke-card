import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { STICKER_LIMITS, type StickerPosition } from '../utils/sticker.ts'
import CardSticker from './CardSticker.tsx'

const ARTWORK = 'https://example.com/25.png'
const START = { x: 40, y: 30 }
const { minX: MIN_X, maxX: MAX_X, minY: MIN_Y, maxY: MAX_Y } = STICKER_LIMITS

// The sticker inside a 324×196 photo window. jsdom has no real layout, so the window's size is faked.
function renderMovable(position = START) {
  const onMove = vi.fn<(position: StickerPosition) => void>()
  render(
    <div className="poke-card-window" data-testid="window">
      <CardSticker src={ARTWORK} pokemonName="Pikachu" position={position} onMove={onMove} />
    </div>,
  )
  const photoWindow = screen.getByTestId('window')
  Object.defineProperty(photoWindow, 'clientWidth', { value: 324 })
  Object.defineProperty(photoWindow, 'clientHeight', { value: 196 })
  return { onMove, sticker: screen.getByRole('button', { name: 'Pikachu sticker' }) }
}

describe('CardSticker — fixed (no onMove)', () => {
  it('is just the image at its position, not a button (for My Cards and the PNG)', () => {
    render(<CardSticker src={ARTWORK} pokemonName="Pikachu" position={START} />)

    expect(screen.queryByRole('button')).toBeNull()
    const image = screen.getByRole('img', { name: 'Pikachu' })
    expect(image.closest('.poke-card-sticker')).toHaveStyle({ left: '40%', top: '30%' })
  })
})

describe('CardSticker — movable (with onMove)', () => {
  it('is a button named "Pikachu sticker", with how-to-move as its description', () => {
    const { sticker } = renderMovable()

    expect(sticker).toHaveAccessibleDescription('Drag to move it, or use the arrow keys. Hold Shift to move faster.')
    expect(sticker).toHaveStyle({ left: '40%', top: '30%' })
  })

  it('arrow keys move it by 2%', async () => {
    const user = userEvent.setup()
    const { onMove, sticker } = renderMovable()
    sticker.focus()

    await user.keyboard('{ArrowRight}')
    expect(onMove).toHaveBeenLastCalledWith({ x: 42, y: 30 })
    await user.keyboard('{ArrowUp}')
    expect(onMove).toHaveBeenLastCalledWith({ x: 40, y: 28 })
  })

  it('Shift + arrow moves it by 10%', async () => {
    const user = userEvent.setup()
    const { onMove, sticker } = renderMovable()
    sticker.focus()

    await user.keyboard('{Shift>}{ArrowDown}{/Shift}')
    expect(onMove).toHaveBeenLastCalledWith({ x: 40, y: 40 })
    await user.keyboard('{Shift>}{ArrowLeft}{/Shift}')
    expect(onMove).toHaveBeenLastCalledWith({ x: 30, y: 30 })
  })

  it('the arrow keys never move it out of the window', async () => {
    const user = userEvent.setup()
    const atTopLeft = renderMovable({ x: MIN_X, y: MIN_Y })
    atTopLeft.sticker.focus()
    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(atTopLeft.onMove).toHaveBeenLastCalledWith({ x: MIN_X, y: MIN_Y })
  })

  it('the arrow keys never move it out at the bottom right either', async () => {
    const user = userEvent.setup()
    const atBottomRight = renderMovable({ x: MAX_X, y: MAX_Y })
    atBottomRight.sticker.focus()
    await user.keyboard('{Shift>}{ArrowRight}{ArrowDown}{/Shift}')
    expect(atBottomRight.onMove).toHaveBeenLastCalledWith({ x: MAX_X, y: MAX_Y })
  })

  it('the arrows do not scroll the page (their default is prevented); other keys work as usual', () => {
    const { onMove, sticker } = renderMovable()

    // fireEvent returns false when the event's default action was prevented
    expect(fireEvent.keyDown(sticker, { key: 'ArrowDown' })).toBe(false)
    expect(fireEvent.keyDown(sticker, { key: 'Tab' })).toBe(true)
    expect(onMove).toHaveBeenCalledTimes(1) // only the arrow moved it
  })

  it('dragging moves it by the pointer movement in % of the window', () => {
    const { onMove, sticker } = renderMovable()

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 100, clientY: 100 })
    // 32.4 px right of a 324 px window = 10%; 19.6 px down of a 196 px window = 10%
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 132.4, clientY: 119.6 })

    const position = onMove.mock.lastCall?.[0]
    expect(position?.x).toBeCloseTo(50, 10)
    expect(position?.y).toBeCloseTo(40, 10)
  })

  it('dragging far past an edge keeps it inside the window', () => {
    const { onMove, sticker } = renderMovable()

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 2000, clientY: -2000 })

    expect(onMove).toHaveBeenLastCalledWith({ x: MAX_X, y: MIN_Y })
  })

  it('stops following the pointer after it is released', () => {
    const { onMove, sticker } = renderMovable()

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerUp(sticker, { pointerId: 1, clientX: 100, clientY: 100 })
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 200, clientY: 200 })

    expect(onMove).not.toHaveBeenCalled()
  })

  it('a pointer move without pressing first does nothing', () => {
    const { onMove, sticker } = renderMovable()
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 200, clientY: 200 })
    expect(onMove).not.toHaveBeenCalled()
  })
})
