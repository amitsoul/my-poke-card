// downloadCardPng with fakes: jsdom (the test browser) can't draw, so html-to-image is replaced by a fake
// toBlob; URL.createObjectURL doesn't exist in jsdom, and a real link click would try to navigate.
import { toBlob } from 'html-to-image'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { downloadCardPng, isWebKitSafari, PNG_HEIGHT, PNG_WIDTH } from './downloadCardPng.ts'

vi.mock('html-to-image', () => ({ toBlob: vi.fn() }))

const FAKE_PNG = new Blob(['png'], { type: 'image/png' })

// What the fake link click "downloaded"
let clicked: { href: string; download: string }[] = []

beforeEach(() => {
  clicked = []
  vi.mocked(toBlob).mockResolvedValue(FAKE_PNG)
  URL.createObjectURL = vi.fn(() => 'blob:fake-png')
  URL.revokeObjectURL = vi.fn()
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    clicked.push({ href: this.href, download: this.download })
  })
})

afterEach(() => {
  vi.restoreAllMocks() // the real link click again
  vi.useRealTimers()
})

function makeFrame(): HTMLElement {
  const frame = document.createElement('div')
  frame.className = 'poke-card-frame'
  document.body.append(frame)
  return frame
}

describe('downloadCardPng', () => {
  it('captures the card frame at exactly 760×1064 (pixelRatio 1), once outside Safari', async () => {
    const frame = makeFrame()

    await downloadCardPng(frame, 'amits-pikachu-mpc-001.png', false)

    expect(toBlob).toHaveBeenCalledTimes(1)
    expect(toBlob).toHaveBeenCalledWith(frame, { canvasWidth: PNG_WIDTH, canvasHeight: PNG_HEIGHT, pixelRatio: 1 })
    expect([PNG_WIDTH, PNG_HEIGHT]).toEqual([760, 1064])
  })

  it('captures twice on Safari (the first capture only "warms up" the images)', async () => {
    await downloadCardPng(makeFrame(), 'card.png', true)
    expect(toBlob).toHaveBeenCalledTimes(2)
  })

  it('downloads it through a temporary link with the file name, then frees the URL', async () => {
    vi.useFakeTimers()

    await downloadCardPng(makeFrame(), 'amits-pikachu-mpc-001.png', false)

    expect(URL.createObjectURL).toHaveBeenCalledWith(FAKE_PNG)
    expect(clicked).toEqual([{ href: 'blob:fake-png', download: 'amits-pikachu-mpc-001.png' }])
    expect(document.querySelector('a[download]')).toBeNull() // the link was removed again
    vi.advanceTimersByTime(1000)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-png')
  })

  it('fails (so the button can show its message) when the card could not be drawn', async () => {
    vi.mocked(toBlob).mockResolvedValue(null)
    await expect(downloadCardPng(makeFrame(), 'card.png', false)).rejects.toThrow()
    expect(clicked).toEqual([])
  })

  it('takes the focus away from anything inside the card first, so no focus ring is captured', async () => {
    const frame = makeFrame()
    const inside = document.createElement('button')
    frame.append(inside)
    inside.focus()
    expect(inside).toHaveFocus()

    await downloadCardPng(frame, 'card.png', false)

    expect(inside).not.toHaveFocus()
  })

  it('waits for the fonts before capturing', async () => {
    let fontsLoaded: () => void = () => {}
    const ready = new Promise<void>((resolve) => {
      fontsLoaded = resolve
    })
    Object.defineProperty(document, 'fonts', { value: { ready }, configurable: true })
    try {
      const download = downloadCardPng(makeFrame(), 'card.png', false)
      await Promise.resolve()
      expect(toBlob).not.toHaveBeenCalled() // still waiting for the fonts

      fontsLoaded()
      await download
      expect(toBlob).toHaveBeenCalledTimes(1)
    } finally {
      Reflect.deleteProperty(document, 'fonts')
    }
  })
})

describe('isWebKitSafari', () => {
  it('is true for Safari on a Mac and every iPhone browser (they all use WebKit)', () => {
    const macSafari =
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15'
    const iphoneSafari =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    const iphoneChrome =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0 Mobile/15E148 Safari/604.1'
    expect([macSafari, iphoneSafari, iphoneChrome].map(isWebKitSafari)).toEqual([true, true, true])
  })

  it('is false for Chrome, Edge, Firefox and Android browsers', () => {
    const chrome =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
    const edge = `${chrome} Edg/124.0`
    const firefox = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0'
    const androidChrome =
      'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36'
    expect([chrome, edge, firefox, androidChrome].map(isWebKitSafari)).toEqual([false, false, false, false])
  })
})
