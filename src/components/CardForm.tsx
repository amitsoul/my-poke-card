// The Create card form: Your name, Age (HP), Superpower, About you (the photo comes in step 8e).
// It owns what the user types and which errors are shown; the page only hears about it through callbacks.
import { useRef, useState, type FormEvent } from 'react'
import {
  ABOUT_YOU_MAX,
  validateAboutYou,
  validateAge,
  validateName,
  validateSuperpower,
  validateTextFields,
  type CardTextData,
  type CardTextField,
  type CardTextValues,
  type ValidationResult,
} from '../utils/cardForm.ts'
import FormField from './FormField.tsx'

interface CardFormProps {
  initialValues?: CardTextValues // for "Edit": start with the previous answers
  onDirtyChange: (hasValues: boolean) => void // tells the page whether a field has a value (for the "Change" warning)
  onSubmit: (card: CardTextData) => void // called ONLY when everything is valid, with the cleaned answers
}

const EMPTY_VALUES: CardTextValues = { name: '', age: '', superpower: '', aboutYou: '' }

// The check for each field (used on blur, and to hide an error as soon as it's fixed)
const VALIDATORS: Record<CardTextField, (raw: string) => ValidationResult<unknown>> = {
  name: validateName,
  age: validateAge,
  superpower: validateSuperpower,
  aboutYou: validateAboutYou,
}

// A field with only spaces counts as empty
function hasAnyValue(values: CardTextValues): boolean {
  return Object.values(values).some((value) => value.trim() !== '')
}

export default function CardForm({ initialValues = EMPTY_VALUES, onDirtyChange, onSubmit }: CardFormProps) {
  const [values, setValues] = useState<CardTextValues>(initialValues)
  // Only the errors the user should see now (set on blur or submit, never while typing)
  const [shownErrors, setShownErrors] = useState<Partial<Record<CardTextField, string>>>({})
  // The inputs, so submit can move focus to the first invalid one
  const inputs = useRef<Partial<Record<CardTextField, HTMLInputElement | null>>>({})

  function handleChange(field: CardTextField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    // While typing, a shown error disappears as soon as the value is valid — but a new error never appears
    if (shownErrors[field] !== undefined && VALIDATORS[field](value).ok) {
      setShownErrors((errors) => ({ ...errors, [field]: undefined }))
    }
    onDirtyChange(hasAnyValue(nextValues))
  }

  // Leaving a field: show its error if it's wrong, hide it if it's fine
  function handleBlur(field: CardTextField) {
    const result = VALIDATORS[field](values[field])
    setShownErrors((errors) => ({ ...errors, [field]: result.ok ? undefined : result.error }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stay on the page (no real form submit)
    const result = validateTextFields(values)
    setShownErrors(result.errors) // with problems: show ALL errors…
    if (result.firstInvalidField !== null) {
      inputs.current[result.firstInvalidField]?.focus() // …and move focus to the first invalid field
      return
    }
    if (result.data !== null) onSubmit(result.data)
  }

  // The props every field gets: its value, its shown error, and the handlers
  function fieldProps(field: CardTextField) {
    return {
      value: values[field],
      error: shownErrors[field],
      onChange: (value: string) => handleChange(field, value),
      onBlur: () => handleBlur(field),
      inputRef: (input: HTMLInputElement | null) => {
        inputs.current[field] = input
      },
    }
  }

  return (
    <form className="card-form" noValidate onSubmit={handleSubmit}>
      <FormField label="Your name" autoComplete="given-name" {...fieldProps('name')} />
      <FormField label="Age (HP)" inputMode="numeric" autoComplete="off" {...fieldProps('age')} />
      <FormField label="Superpower" autoComplete="off" {...fieldProps('superpower')} />
      <FormField
        label="About you"
        autoComplete="off"
        maxLength={ABOUT_YOU_MAX}
        hint={`${values.aboutYou.length} / ${ABOUT_YOU_MAX}`}
        {...fieldProps('aboutYou')}
      />
      <button type="submit" className="button">
        Create my card
      </button>
    </form>
  )
}
