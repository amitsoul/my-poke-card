// Checks for the Create card form, exactly as in CARD_SPEC.md "Form fields".
// Plain functions (no React), so every rule can be tested on its own.

// Every check returns either the cleaned value or the error to show
export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string }

// Only what we check about a file, so tests don't need a real File
export interface PhotoFile {
  type: string
  size: number
}

export type CardFormField = 'name' | 'age' | 'photo' | 'superpower' | 'aboutYou'

export interface CardFormValues {
  name: string
  age: string
  photo: PhotoFile | null
  superpower: string
  aboutYou: string
}

export const ABOUT_YOU_MAX = 80
export const PHOTO_MAX_BYTES = 10 * 1024 * 1024 // 10 MB
const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// The order of the fields on the form — used to find the first invalid one
const FIELD_ORDER: CardFormField[] = ['name', 'age', 'photo', 'superpower', 'aboutYou']

// Letters with ONE space, hyphen or apostrophe between them; starts and ends with a letter
const NAME_PATTERN = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/
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
  if (name.length < 2 || name.length > 12 || !NAME_PATTERN.test(name)) {
    return fail('Use English letters only (2–12)')
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
  const aboutYou = straightenApostrophes(raw.trim())
  if (aboutYou === '') return fail('Please write something about you')
  if (aboutYou.length > ABOUT_YOU_MAX || !ABOUT_YOU_PATTERN.test(aboutYou)) {
    return fail('English only, up to 80 characters')
  }
  return { ok: true, value: aboutYou }
}

// Checks every field (for "Create my card"): all errors, and the first invalid field in form order
export function validateCardForm(values: CardFormValues): {
  errors: Partial<Record<CardFormField, string>>
  firstInvalidField: CardFormField | null
} {
  const results: Record<CardFormField, ValidationResult<unknown>> = {
    name: validateName(values.name),
    age: validateAge(values.age),
    photo: validatePhoto(values.photo),
    superpower: validateSuperpower(values.superpower),
    aboutYou: validateAboutYou(values.aboutYou),
  }

  const errors: Partial<Record<CardFormField, string>> = {}
  for (const field of FIELD_ORDER) {
    const result = results[field]
    if (!result.ok) errors[field] = result.error
  }

  const firstInvalidField = FIELD_ORDER.find((field) => errors[field] !== undefined) ?? null
  return { errors, firstInvalidField }
}
