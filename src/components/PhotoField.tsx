// The Photo field: a file input styled as a button, the preview, "Remove photo", and its error.
// Display only: CardForm checks and resizes the file and passes the result in.
import { useId, type ChangeEvent, type Ref } from 'react'
import type { PhotoState } from '../utils/photo.ts'

interface PhotoFieldProps {
  photo: PhotoState
  error: string | undefined
  onSelect: (file: File) => void
  onRemove: () => void
  inputRef?: Ref<HTMLInputElement> // lets the form move focus here
}

export default function PhotoField({ photo, error, onSelect, onRemove, inputRef }: PhotoFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy = error !== undefined ? `${errorId} ${hintId}` : hintId

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Clear the input, so choosing the same file again (e.g. after "Remove photo") still counts as a choice
    event.target.value = ''
    if (file !== undefined) onSelect(file)
  }

  return (
    <div className="form-field photo-field">
      <label htmlFor={id}>Photo</label>
      {/* The real input is hidden visually only: it still gets keyboard focus and is read by screen readers.
          The browser's own button text would be in the computer's language, so we show our own (the label below). */}
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="visually-hidden"
        onChange={handleChange}
        required
        aria-invalid={error !== undefined}
        aria-describedby={describedBy}
      />

      {photo.status === 'ready' && <img src={photo.photo.dataUrl} alt="Your photo" className="photo-preview" />}
      {photo.status === 'preparing' && <p role="status">Preparing your photo...</p>}

      <div className="photo-actions">
        <label htmlFor={id} className="button photo-button">
          {photo.status === 'ready' ? 'Choose another photo' : 'Choose a photo'}
        </label>
        {photo.status === 'ready' && (
          <button type="button" className="button button-secondary" onClick={onRemove}>
            Remove photo
          </button>
        )}
      </div>

      <p id={hintId} className="field-hint">
        JPG, PNG or WebP, up to 10 MB
      </p>
      {error !== undefined && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
