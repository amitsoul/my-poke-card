// The Create card form: Your name, Age (HP), Photo, Superpower, About you.
// It owns what the user types/chooses and which errors are shown; the page only hears about it through callbacks.
import { useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import {
  ABOUT_YOU_MAX,
  getFirstInvalidField,
  validateAboutYou,
  validateAge,
  validateCardForm,
  validateName,
  validateSuperpower,
  validateTextFields,
  type CardFormData,
  type CardFormDraft,
  type CardFormField,
  type CardTextField,
  type CardTextValues,
  type ValidationResult,
} from '../utils/cardForm.ts'
import { PHOTO_WAIT_ERROR, preparePhoto, resizePhoto, type PhotoState } from '../utils/photo.ts'
import FormField from './FormField.tsx'
import PhotoField from './PhotoField.tsx'

interface CardFormProps {
  initialValues?: CardFormDraft // for "Edit": start with the previous answers and photo
  onDirtyChange: (hasValues: boolean) => void // tells the page whether a field has a value (for the "Change" warning)
  onSubmit: (card: CardFormData) => void // called ONLY when everything is valid, with the cleaned answers
}

const EMPTY_DRAFT: CardFormDraft = { name: '', age: '', photo: null, superpower: '', aboutYou: '' }

// The check for each text field (used on blur, and to hide an error as soon as it's fixed)
const VALIDATORS: Record<CardTextField, (raw: string) => ValidationResult<unknown>> = {
  name: validateName,
  age: validateAge,
  superpower: validateSuperpower,
  aboutYou: validateAboutYou,
}

// A text field with only spaces counts as empty; a photo counts as soon as one was chosen
function hasAnyValue(values: CardTextValues, photo: PhotoState): boolean {
  return photo.status !== 'empty' || Object.values(values).some((value) => value.trim() !== '')
}

export default function CardForm({ initialValues = EMPTY_DRAFT, onDirtyChange, onSubmit }: CardFormProps) {
  const { photo: initialPhoto, ...initialText } = initialValues
  const [values, setValues] = useState<CardTextValues>(initialText)
  const [photo, setPhoto] = useState<PhotoState>(
    initialPhoto === null ? { status: 'empty' } : { status: 'ready', photo: initialPhoto },
  )
  // Only the errors the user should see now (set on blur, on choosing a photo, or on submit — never while typing)
  const [shownErrors, setShownErrors] = useState<Partial<Record<CardFormField, string>>>({})
  // The inputs, so submit can move focus to the first invalid one
  const inputs = useRef<Partial<Record<CardFormField, HTMLInputElement | null>>>({})
  // Counts photo choices: a slow resize of an OLD choice must not replace a newer one
  const photoRequest = useRef(0)
  // The latest typed answers, for code that runs after an await (where `values` would be from before it)
  const latestValues = useRef<CardTextValues>(initialText)

  function handleChange(field: CardTextField, value: string) {
    const nextValues = { ...values, [field]: value }
    setValues(nextValues)
    latestValues.current = nextValues
    // While typing, a shown error disappears as soon as the value is valid — but a new error never appears
    if (shownErrors[field] !== undefined && VALIDATORS[field](value).ok) {
      setShownErrors((errors) => ({ ...errors, [field]: undefined }))
    }
    onDirtyChange(hasAnyValue(nextValues, photo))
  }

  // Leaving a field: show its error if it's wrong, hide it if it's fine
  function handleBlur(field: CardTextField) {
    const result = VALIDATORS[field](values[field])
    setShownErrors((errors) => ({ ...errors, [field]: result.ok ? undefined : result.error }))
  }

  // A new photo replaces the old one. Checked (type, size) BEFORE resizing, inside preparePhoto.
  async function handlePhotoSelect(file: File) {
    photoRequest.current += 1
    const request = photoRequest.current
    setPhoto({ status: 'preparing' })
    setShownErrors((errors) => ({ ...errors, photo: undefined }))
    onDirtyChange(true)

    const result = await preparePhoto(file, resizePhoto)
    if (request !== photoRequest.current) return // the user chose another photo (or removed it) meanwhile

    const nextPhoto: PhotoState = result.ok ? { status: 'ready', photo: result.value } : { status: 'empty' }
    setPhoto(nextPhoto)
    // Choosing a file is a finished action, so a wrong file shows its error right away
    setShownErrors((errors) => ({ ...errors, photo: result.ok ? undefined : result.error }))
    onDirtyChange(hasAnyValue(latestValues.current, nextPhoto))
  }

  function handlePhotoRemove() {
    photoRequest.current += 1 // a resize still running for the removed photo is ignored
    const nextPhoto: PhotoState = { status: 'empty' }
    setPhoto(nextPhoto)
    setShownErrors((errors) => ({ ...errors, photo: undefined })) // no error yet — it comes on submit
    onDirtyChange(hasAnyValue(values, nextPhoto))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stay on the page (no real form submit)
    const readyPhoto = photo.status === 'ready' ? photo.photo : null
    const errors = { ...validateCardForm({ ...values, photo: readyPhoto }).errors }
    if (photo.status === 'preparing') errors.photo = PHOTO_WAIT_ERROR // not "Please upload an image": they did

    // With problems: show ALL errors, then move focus to the first invalid field.
    // flushSync makes React put the errors on the screen RIGHT NOW (normally it waits until this function ends).
    // So when focus lands on the field, its error already exists and a screen reader reads them together.
    flushSync(() => setShownErrors(errors))
    const firstInvalidField = getFirstInvalidField(errors)
    if (firstInvalidField !== null) {
      inputs.current[firstInvalidField]?.focus()
      return
    }

    const text = validateTextFields(values).data
    if (text !== null && readyPhoto !== null) onSubmit({ ...text, photo: readyPhoto })
  }

  function saveInput(field: CardFormField) {
    return (input: HTMLInputElement | null) => {
      inputs.current[field] = input
    }
  }

  // The props every text field gets: its value, its shown error, and the handlers
  function fieldProps(field: CardTextField) {
    return {
      value: values[field],
      error: shownErrors[field],
      onChange: (value: string) => handleChange(field, value),
      onBlur: () => handleBlur(field),
      inputRef: saveInput(field),
    }
  }

  return (
    <form className="card-form" noValidate onSubmit={handleSubmit}>
      <FormField label="Your name" autoComplete="given-name" {...fieldProps('name')} />
      <FormField label="Age (HP)" inputMode="numeric" autoComplete="off" {...fieldProps('age')} />
      <PhotoField
        photo={photo}
        error={shownErrors.photo}
        onSelect={handlePhotoSelect}
        onRemove={handlePhotoRemove}
        inputRef={saveInput('photo')}
      />
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
