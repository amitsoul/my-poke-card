import { describe, expect, it } from 'vitest'
import {
  validateAboutYou,
  validateAge,
  validateCardForm,
  validateName,
  validatePhoto,
  validateSuperpower,
  validateTextFields,
  type CardFormValues,
  type PhotoFile,
} from './cardForm.ts'

const MB = 1024 * 1024
const NAME_ERROR = 'Use English letters only (2–12)'
const AGE_ERROR = 'Age must be 1–120'
const SUPERPOWER_ERROR = 'English letters only (3–20)'
const ABOUT_YOU_ERROR = 'English only, up to 80 characters'
const PHOTO_TYPE_ERROR = 'Please upload a JPG, PNG or WebP image'

describe('validateName', () => {
  it('accepts a simple English name', () => {
    expect(validateName('Amit')).toEqual({ ok: true, value: 'Amit' })
  })

  it('ignores spaces at the start and end', () => {
    expect(validateName('  Amit  ')).toEqual({ ok: true, value: 'Amit' })
  })

  it('accepts one hyphen, apostrophe or space between letters', () => {
    expect(validateName('Mary-Ann').ok).toBe(true)
    expect(validateName("O'Neil").ok).toBe(true)
    expect(validateName('Mary Ann').ok).toBe(true)
  })

  it("treats the iPhone curly apostrophe ’ as '", () => {
    expect(validateName('O’Neil')).toEqual({ ok: true, value: "O'Neil" })
  })

  it('turns two spaces in a row into one', () => {
    expect(validateName('Mary  Ann')).toEqual({ ok: true, value: 'Mary Ann' })
  })

  it('accepts 2 and 12 characters (the limits)', () => {
    expect(validateName('Jo').ok).toBe(true)
    expect(validateName('Bartholomewz').ok).toBe(true)
  })

  it('asks for a name when it is empty or only spaces', () => {
    expect(validateName('')).toEqual({ ok: false, error: 'Please enter your name' })
    expect(validateName('   ')).toEqual({ ok: false, error: 'Please enter your name' })
  })

  it('rejects 1 or 13 characters', () => {
    expect(validateName('A')).toEqual({ ok: false, error: NAME_ERROR })
    expect(validateName('Bartholomewzz')).toEqual({ ok: false, error: NAME_ERROR })
  })

  it('rejects digits and non-English letters', () => {
    expect(validateName('Amit3')).toEqual({ ok: false, error: NAME_ERROR })
    expect(validateName('עמית')).toEqual({ ok: false, error: NAME_ERROR })
  })

  it('must start and end with a letter', () => {
    for (const name of ['--', "''", '-Amit', 'Amit-']) {
      expect(validateName(name)).toEqual({ ok: false, error: NAME_ERROR })
    }
  })

  it('rejects two separators in a row', () => {
    expect(validateName('Mary--Ann')).toEqual({ ok: false, error: NAME_ERROR })
  })
})

describe('validateAge', () => {
  it('turns a valid age into a number, ignoring spaces around it', () => {
    expect(validateAge('30')).toEqual({ ok: true, value: 30 })
    expect(validateAge(' 30 ')).toEqual({ ok: true, value: 30 })
  })

  it('accepts 1 and 120 (the limits)', () => {
    expect(validateAge('1')).toEqual({ ok: true, value: 1 })
    expect(validateAge('120')).toEqual({ ok: true, value: 120 })
  })

  it('accepts a leading zero ("025" → 25)', () => {
    expect(validateAge('025')).toEqual({ ok: true, value: 25 })
  })

  it('rejects ages outside 1–120', () => {
    for (const age of ['0', '121', '150']) {
      expect(validateAge(age)).toEqual({ ok: false, error: AGE_ERROR })
    }
  })

  it('rejects anything that is not only digits (decimals, "1e2", negative, text)', () => {
    for (const age of ['25.5', '1e2', '-5', 'abc']) {
      expect(validateAge(age)).toEqual({ ok: false, error: AGE_ERROR })
    }
  })

  it('asks for an age when it is empty', () => {
    expect(validateAge('')).toEqual({ ok: false, error: 'Please enter your age' })
  })
})

describe('validatePhoto', () => {
  it('accepts JPG, PNG and WebP images', () => {
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) {
      expect(validatePhoto({ type, size: 2 * MB }).ok).toBe(true)
    }
  })

  it('asks for an image when there is none', () => {
    expect(validatePhoto(null)).toEqual({ ok: false, error: 'Please upload an image' })
  })

  it('rejects GIF, HEIC, PDF and files without a type', () => {
    for (const type of ['image/gif', 'image/heic', 'application/pdf', '']) {
      const file: PhotoFile = { type, size: 1 * MB }
      expect(validatePhoto(file)).toEqual({ ok: false, error: PHOTO_TYPE_ERROR })
    }
  })

  it('rejects an image over 10 MB', () => {
    expect(validatePhoto({ type: 'image/jpeg', size: 11 * MB })).toEqual({
      ok: false,
      error: 'Image must be under 10 MB',
    })
  })
})

describe('validateSuperpower', () => {
  it('accepts English words with a space', () => {
    expect(validateSuperpower('Super speed')).toEqual({ ok: true, value: 'Super speed' })
  })

  it('turns two spaces in a row into one', () => {
    expect(validateSuperpower('Super  speed')).toEqual({ ok: true, value: 'Super speed' })
  })

  it('accepts one hyphen between letters ("X-ray vision", "Fire-breathing")', () => {
    expect(validateSuperpower('X-ray vision').ok).toBe(true)
    expect(validateSuperpower('Fire-breathing').ok).toBe(true)
  })

  it('rejects two hyphens in a row or a hyphen at the start', () => {
    expect(validateSuperpower('X--ray')).toEqual({ ok: false, error: SUPERPOWER_ERROR })
    expect(validateSuperpower('-fly')).toEqual({ ok: false, error: SUPERPOWER_ERROR })
  })

  it('accepts 3 and 20 characters (the limits)', () => {
    expect(validateSuperpower('Fly').ok).toBe(true)
    expect(validateSuperpower('a'.repeat(20)).ok).toBe(true)
  })

  it('rejects 2 or 21 characters', () => {
    expect(validateSuperpower('Go')).toEqual({ ok: false, error: SUPERPOWER_ERROR })
    expect(validateSuperpower('a'.repeat(21))).toEqual({ ok: false, error: SUPERPOWER_ERROR })
  })

  it('rejects digits', () => {
    expect(validateSuperpower('Speed 2')).toEqual({ ok: false, error: SUPERPOWER_ERROR })
  })

  it('asks for a superpower when it is only spaces', () => {
    expect(validateSuperpower('   ')).toEqual({ ok: false, error: 'Please enter your superpower' })
  })
})

describe('validateAboutYou', () => {
  it('accepts English text with numbers and the allowed punctuation', () => {
    expect(validateAboutYou('I love cards since 2010.').ok).toBe(true)
  })

  it('accepts the letter é, as in "Pokémon" (and É)', () => {
    expect(validateAboutYou('I love Pokémon cards!')).toEqual({ ok: true, value: 'I love Pokémon cards!' })
    expect(validateAboutYou('POKÉMON FAN').ok).toBe(true)
  })

  it('accepts exactly 80 characters and rejects 81', () => {
    expect(validateAboutYou('a'.repeat(80)).ok).toBe(true)
    expect(validateAboutYou('a'.repeat(81))).toEqual({ ok: false, error: ABOUT_YOU_ERROR })
  })

  it('counts the length after trimming the spaces around the text', () => {
    expect(validateAboutYou('  Hi!  ')).toEqual({ ok: true, value: 'Hi!' })
    expect(validateAboutYou('  ' + 'a'.repeat(80) + '  ').ok).toBe(true)
  })

  it('rejects other symbols, emoji and non-English letters', () => {
    for (const text of ['Hi :)', 'Hi 😀', 'שלום']) {
      expect(validateAboutYou(text)).toEqual({ ok: false, error: ABOUT_YOU_ERROR })
    }
  })

  it("treats the iPhone curly apostrophe ’ as '", () => {
    expect(validateAboutYou('I’m Amit')).toEqual({ ok: true, value: "I'm Amit" })
  })

  it('accepts a pasted "é" made of "e" + an accent, and joins it into one letter', () => {
    const decomposed = 'I love Pokémon' // "e" + combining accent: 2 characters that look like "é"
    expect(validateAboutYou(decomposed)).toEqual({ ok: true, value: 'I love Pokémon' })
  })

  it('asks for text when it is empty', () => {
    expect(validateAboutYou('')).toEqual({ ok: false, error: 'Please write something about you' })
  })
})

describe('validateTextFields', () => {
  it('returns the cleaned answers and no errors when the 4 text fields are valid', () => {
    const result = validateTextFields({ name: '  Amit ', age: '030', superpower: 'Super  speed', aboutYou: 'Hi!' })
    expect(result).toEqual({
      errors: {},
      firstInvalidField: null,
      data: { name: 'Amit', age: 30, superpower: 'Super speed', aboutYou: 'Hi!' },
    })
  })

  it('returns 4 errors, the name first and no data, when everything is empty', () => {
    const result = validateTextFields({ name: '', age: '', superpower: '', aboutYou: '' })
    expect(Object.keys(result.errors)).toEqual(['name', 'age', 'superpower', 'aboutYou'])
    expect(result.firstInvalidField).toBe('name')
    expect(result.data).toBeNull()
  })
})

describe('validateCardForm', () => {
  const validValues: CardFormValues = {
    name: 'Amit',
    age: '30',
    photo: { type: 'image/jpeg', size: 2 * MB },
    superpower: 'Super speed',
    aboutYou: 'I love Pokémon cards!',
  }

  it('returns no errors when every field is valid', () => {
    expect(validateCardForm(validValues)).toEqual({ errors: {}, firstInvalidField: null })
  })

  it('returns every error, and the first invalid field in form order', () => {
    const result = validateCardForm({ ...validValues, age: '150', aboutYou: 'Hi :)' })
    expect(result.errors).toEqual({ age: AGE_ERROR, aboutYou: ABOUT_YOU_ERROR })
    expect(result.firstInvalidField).toBe('age')
  })

  it('returns all 5 errors for an empty form, starting at the name', () => {
    const result = validateCardForm({ name: '', age: '', photo: null, superpower: '', aboutYou: '' })
    expect(Object.keys(result.errors)).toHaveLength(5)
    expect(result.firstInvalidField).toBe('name')
  })
})
