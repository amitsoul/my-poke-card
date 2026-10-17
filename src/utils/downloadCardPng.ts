// Download a card as a PNG with html-to-image (approved by the lecturer). Browser only: it needs real drawing.
// Only the card itself (.poke-card-frame) is captured — not the heading, the tip or the buttons.
import { toBlob } from 'html-to-image'

// Always 2× the 380×532 design, whatever the screen size: sharp and the same on every device
export const PNG_WIDTH = 760
export const PNG_HEIGHT = 1064

// Safari and every iPhone browser use WebKit, which sometimes draws images blank in the FIRST capture
// (a known html-to-image issue). Chrome, Edge, Firefox and Android browsers don't need the workaround.
// "Chrome" and "Android" also appear in non-WebKit browsers' text, so they're excluded; iPhone Chrome says "CriOS".
export function isWebKitSafari(userAgent: string): boolean {
  return /^((?!chrome|android).)*safari/i.test(userAgent)
}

export async function downloadCardPng(
  frame: HTMLElement,
  fileName: string,
  isSafari: boolean = isWebKitSafari(navigator.userAgent),
): Promise<void> {
  // Never capture a focus ring: if something inside the card has focus, take it away first
  if (document.activeElement instanceof HTMLElement && frame.contains(document.activeElement)) {
    document.activeElement.blur()
  }
  // Wait until our fonts are loaded, so the PNG uses Barlow and not a fallback font
  // (?. because the test environment, jsdom, has no document.fonts)
  await document.fonts?.ready

  // pixelRatio 1: the size is exactly canvasWidth × canvasHeight (otherwise phones would make it 2–3× bigger)
  const options = { canvasWidth: PNG_WIDTH, canvasHeight: PNG_HEIGHT, pixelRatio: 1 }
  if (isSafari) await toBlob(frame, options) // the "warm-up" capture; only the second one is used
  const blob = await toBlob(frame, options)
  if (blob === null) throw new Error('The card could not be drawn')

  // A temporary link with the "download" attribute starts the download; then it's removed
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  // Free the image's memory a moment later (some browsers still read the URL right after the click)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
