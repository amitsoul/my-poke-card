// Preparing the user's photo for the card: check it, then shrink it to a small JPEG (CARD_SPEC.md "Form fields").
import { validatePhoto, type CardPhoto, type PhotoFile, type ValidationResult } from './cardForm.ts'

export const PHOTO_WIDTH = 400
export const JPEG_QUALITY = 0.85
export const PHOTO_READ_ERROR = "We couldn't read this image. Please try another one."
export const PHOTO_WAIT_ERROR = 'Please wait until your photo is ready'

// Where the photo is in the form
export type PhotoState =
  | { status: 'empty' }
  | { status: 'preparing' } // being checked and resized
  | { status: 'ready'; photo: CardPhoto }

// The output size: at most maxWidth wide, same shape, never bigger than the original.
// 4000×3000 → 400×300 · 3000×4000 → 400×533 · 200×100 stays 200×100
export function getResizedSize(width: number, height: number, maxWidth: number = PHOTO_WIDTH): { width: number; height: number } {
  if (width <= maxWidth) return { width, height }
  return { width: maxWidth, height: Math.round((height * maxWidth) / width) }
}

// How many bytes a base64 data URL holds ("data:image/jpeg;base64,AAAA" → 3)
export function getDataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(',') + 1)
  const padding = base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0
  return Math.floor((base64.length * 3) / 4) - padding
}

// Check the ORIGINAL file first (type and size), and only then resize it.
// So a PDF or a 50 MB file is never loaded into an image at all.
// `resize` is passed in, so tests can use a fake one (jsdom has no real canvas).
export async function preparePhoto<F extends PhotoFile>(
  file: F,
  resize: (file: F) => Promise<string>,
): Promise<ValidationResult<CardPhoto>> {
  const check = validatePhoto(file)
  if (!check.ok) return check

  try {
    const dataUrl = await resize(file)
    return { ok: true, value: { dataUrl, type: 'image/jpeg', size: getDataUrlBytes(dataUrl) } }
  } catch {
    return { ok: false, error: PHOTO_READ_ERROR }
  }
}

// Browser only: load the image, draw it smaller on a canvas, return a JPEG data URL.
// Loading through an <img> lets the browser turn sideways phone photos upright (EXIF) by itself.
export async function resizePhoto(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode() // fails for a broken file → the caller shows PHOTO_READ_ERROR
    if (image.naturalWidth === 0 || image.naturalHeight === 0) throw new Error('Empty image')

    const { width, height } = getResizedSize(image.naturalWidth, image.naturalHeight)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (context === null) throw new Error('No canvas')

    // JPEG has no transparency: paint white first, so a transparent PNG doesn't turn black
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(image, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', JPEG_QUALITY)
  } finally {
    URL.revokeObjectURL(url) // free the temporary link to the file, even if something failed
  }
}
