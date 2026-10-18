// Checks for the Create card form, exactly as in CARD_SPEC.md "Form fields".
// Plain functions (no React), so every rule can be tested on its own.
import type { StickerPosition } from './sticker.ts'

// Every check returns either the cleaned value or the error to show
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

// Only what we check about a file, so tests don't need a real File
export interface PhotoFile {
  type: string
  size: number
}

export type CardFormField = 'name' | 'age' | 'photo' | 'superpower' | 'aboutYou'
export type CardTextField = Exclude<CardFormField, 'photo'>

// What the user typed (before cleaning)
export interface CardFormValues {
  name: string
  age: string
  photo: PhotoFile | null
  superpower: string
  aboutYou: string
}
export type CardTextValues = Omit<CardFormValues, 'photo'>

// The cleaned text answers, once every text field is valid
export interface CardTextData {
  name: string
  age: number
  superpower: string
  aboutYou: string
}

// The photo after resizing: a JPEG as a data URL (text, so it can be saved in localStorage later).
// It has a type and a size, so validatePhoto can check it like a file.
export interface CardPhoto extends PhotoFile {
  dataUrl: string
  type: 'image/jpeg'
}

// What a valid form gives: the cleaned answers and the photo
export interface CardFormData extends CardTextData {
  photo: CardPhoto
}

// The finished card: the form data + where the Pokémon sticker sits on the photo (in %)
export interface CardData extends CardFormData {
  stickerPosition: StickerPosition
}

// What the form starts with after "Edit": the typed answers and the ready photo
export interface CardFormDraft extends CardTextValues {
  photo: CardPhoto | null
}

export const ABOUT_YOU_MAX = 80
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// The order of the fields on the form — used to find the first invalid one
const FIELD_ORDER: CardFormField[] = ['name', 'age', 'photo', 'superpower', 'aboutYou']
const TEXT_FIELD_ORDER: CardTextField[] = ['name', 'age', 'superpower', 'aboutYou']

// Letters with ONE space, hyphen or apostrophe between them, or " & " (with a space on each side) for two names
// ("Philip & Charlie"); starts and ends with a letter
const NAME_PATTERN = /^[A-Za-z]+(?:(?:[ '-]| & )[A-Za-z]+)*$/
const NAME_MIN = 2
const NAME_MAX = 16
// Letters with ONE space or hyphen between them; starts and ends with a letter
const SUPERPOWER_PATTERN = /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/
// English letters, é/É (as in "Pokémon"), numbers, spaces and . , ! ? ' -
const ABOUT_YOU_PATTERN = /^[A-Za-z0-9éÉ .,!?'-]+$/
const DIGITS_PATTERN = /^\d+$/

// iPhone "smart punctuation" turns ' into ’ — treat them the same
function straightenApostrophes(text: string): string {
  return text.replace(/’/g, "'")
}

// "  Mary   Ann " → "Mary Ann"
function trimAndJoinSpaces(text: string): string {
  return text.trim().replace(/ {2,}/g, ' ')
}

function fail<T>(error: string): ValidationResult<T> {
  return { ok: false, error }
}

export function validateName(raw: string): ValidationResult<string> {
  const name = straightenApostrophes(trimAndJoinSpaces(raw))
  if (name === '') return fail('Please enter your name')
  if (name.length < NAME_MIN || name.length > NAME_MAX || !NAME_PATTERN.test(name)) {
    return fail(`Use English letters only (${NAME_MIN}–${NAME_MAX})`)
  }
  return { ok: true, value: name }
}

export function validateAge(raw: string): ValidationResult<number> {
  const text = raw.trim()
  if (text === '') return fail('Please enter your age')
  // Check the text first: Number() alone would accept "1e2" (100), "0x1F" (31) or "25.5"
  if (!DIGITS_PATTERN.test(text)) return fail('Age must be 1–120')
  const age = Number(text) // "025" → 25
  if (age < 1 || age > 120) return fail('Age must be 1–120')
  return { ok: true, value: age }
}

export function validatePhoto(file: PhotoFile | null): ValidationResult<PhotoFile> {
  if (file === null) return fail('Please upload an image')
  if (!PHOTO_TYPES.includes(file.type)) return fail('Please upload a JPG, PNG or WebP image')
  if (file.size > PHOTO_MAX_BYTES) return fail('Image must be under 10 MB')
  return { ok: true, value: file }
}

export function validateSuperpower(raw: string): ValidationResult<string> {
  const superpower = trimAndJoinSpaces(raw)
  if (superpower === '') return fail('Please enter your superpower')
  if (superpower.length < 3 || superpower.length > 20 || !SUPERPOWER_PATTERN.test(superpower)) {
    return fail('English letters only (3–20)')
  }
  return { ok: true, value: superpower }
}

export function validateAboutYou(raw: string): ValidationResult<string> {
  // NFC joins a pasted "e" + accent (2 characters) into one "é", so it matches the pattern and counts as 1
  const aboutYou = straightenApostrophes(raw.normalize('NFC').trim())
  if (aboutYou === '') return fail('Please write something about you')
  if (aboutYou.length > ABOUT_YOU_MAX || !ABOUT_YOU_PATTERN.test(aboutYou)) {
    return fail('English only, up to 80 characters')
  }
  return { ok: true, value: aboutYou }
}

// Checks the 4 text fields: all errors, the first invalid field, and the cleaned answers if all are valid
export function validateTextFields(values: CardTextValues): {
  errors: Partial<Record<CardTextField, string>>
  firstInvalidField: CardTextField | null
  data: CardTextData | null
} {
  const name = validateName(values.name)
  const age = validateAge(values.age)
  const superpower = validateSuperpower(values.superpower)
  const aboutYou = validateAboutYou(values.aboutYou)

  const errors: Partial<Record<CardTextField, string>> = {}
  if (!name.ok) errors.name = name.error
  if (!age.ok) errors.age = age.error
  if (!superpower.ok) errors.superpower = superpower.error
  if (!aboutYou.ok) errors.aboutYou = aboutYou.error

  const firstInvalidField = TEXT_FIELD_ORDER.find((field) => errors[field] !== undefined) ?? null
  const data =
    name.ok && age.ok && superpower.ok && aboutYou.ok
      ? { name: name.value, age: age.value, superpower: superpower.value, aboutYou: aboutYou.value }
      : null
  return { errors, firstInvalidField, data }
}

// The first field with an error, in form order (name, age, photo, superpower, about you)
export function getFirstInvalidField(errors: Partial<Record<CardFormField, string>>): CardFormField | null {
  return FIELD_ORDER.find((field) => errors[field] !== undefined) ?? null
}

// Checks every field (text fields + photo): all errors, and the first invalid field in form order
export function validateCardForm(values: CardFormValues): {
  errors: Partial<Record<CardFormField, string>>
  firstInvalidField: CardFormField | null
} {
  const textResult = validateTextFields(values)
  const photo = validatePhoto(values.photo)

  const errors: Partial<Record<CardFormField, string>> = { ...textResult.errors }
  if (!photo.ok) errors.photo = photo.error

  return { errors, firstInvalidField: getFirstInvalidField(errors) }
}
