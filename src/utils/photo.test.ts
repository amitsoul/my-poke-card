import { describe, expect, it, vi } from 'vitest'
import type { PhotoFile } from './cardForm.ts'
import { getDataUrlBytes, getResizedSize, PHOTO_READ_ERROR, preparePhoto } from './photo.ts'

const MB = 1024 * 1024
const SMALL_JPEG = 'data:image/jpeg;base64,AAAA' // 4 base64 characters = 3 bytes

describe('getResizedSize', () => {
  it('shrinks a landscape photo to 400px wide, same shape (4000×3000 → 400×300)', () => {
    expect(getResizedSize(4000, 3000)).toEqual({ width: 400, height: 300 })
  })

  it('shrinks a portrait photo to 400px wide, same shape (3000×4000 → 400×533)', () => {
    expect(getResizedSize(3000, 4000)).toEqual({ width: 400, height: 533 })
  })

  it('keeps a photo that is exactly 400px wide', () => {
    expect(getResizedSize(400, 400)).toEqual({ width: 400, height: 400 })
  })

  it('never makes a small photo bigger (200×100 stays 200×100)', () => {
    expect(getResizedSize(200, 100)).toEqual({ width: 200, height: 100 })
  })

  it('rounds the height to whole pixels (1001×333 → 400×133)', () => {
    expect(getResizedSize(1001, 333)).toEqual({ width: 400, height: 133 })
  })
})

describe('getDataUrlBytes', () => {
  it('counts the bytes inside a base64 data URL, without the "=" padding', () => {
    expect(getDataUrlBytes('data:image/jpeg;base64,AAAA')).toBe(3)
    expect(getDataUrlBytes('data:image/jpeg;base64,AAA=')).toBe(2)
    expect(getDataUrlBytes('data:image/jpeg;base64,AA==')).toBe(1)
  })
})

describe('preparePhoto', () => {
  it('resizes a valid image and returns it as a small JPEG', async () => {
    const resize = vi.fn(async () => SMALL_JPEG)
    const file: PhotoFile = { type: 'image/png', size: 2 * MB }

    const result = await preparePhoto(file, resize)

    expect(resize).toHaveBeenCalledWith(file)
    expect(result).toEqual({ ok: true, value: { dataUrl: SMALL_JPEG, type: 'image/jpeg', size: 3 } })
  })

  it('checks the ORIGINAL file first: a PDF is never loaded or resized', async () => {
    const resize = vi.fn(async () => SMALL_JPEG)

    const result = await preparePhoto({ type: 'application/pdf', size: 1 * MB }, resize)

    expect(resize).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, error: 'Please upload a JPG, PNG or WebP image' })
  })

  it('checks the ORIGINAL file first: a 50 MB image is never loaded or resized', async () => {
    const resize = vi.fn(async () => SMALL_JPEG)

    const result = await preparePhoto({ type: 'image/jpeg', size: 50 * MB }, resize)

    expect(resize).not.toHaveBeenCalled()
    expect(result).toEqual({ ok: false, error: 'Image must be under 10 MB' })
  })

  it('shows the "couldn\'t read" error when a file says image/jpeg but is broken', async () => {
    const resize = vi.fn(async () => {
      throw new Error('The image could not be decoded')
    })

    const result = await preparePhoto({ type: 'image/jpeg', size: 1 * MB }, resize)

    expect(result).toEqual({ ok: false, error: PHOTO_READ_ERROR })
  })
})
