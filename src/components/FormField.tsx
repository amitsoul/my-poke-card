// One form field: a label, a text input, an optional hint (like a counter) and an error.
// The error and the hint are connected to the input, so screen readers read them with it.
import { useId, type Ref } from 'react'

interface FormFieldProps {
  label: string
  value: string
  error: string | undefined // shown only when the form decides to show it
  onChange: (value: string) => void
  onBlur: () => void
  inputRef?: Ref<HTMLInputElement> // lets the form move focus here
  hint?: string
  inputMode?: 'text' | 'numeric'
  autoComplete?: string
  maxLength?: number
}

export default function FormField({
  label,
  value,
  error,
  onChange,
  onBlur,
  inputRef,
  hint,
  inputMode,
  autoComplete,
  maxLength,
}: FormFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  // e.g. "«r1»-error «r1»-hint": what a screen reader reads after the label
  const describedBy = [error !== undefined ? errorId : null, hint !== undefined ? hintId : null]
    .filter((part) => part !== null)
    .join(' ')

  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        required
        inputMode={inputMode}
        autoComplete={autoComplete}
        maxLength={maxLength}
        aria-invalid={error !== undefined}
        aria-describedby={describedBy === '' ? undefined : describedBy}
      />
      {hint !== undefined && (
        <p id={hintId} className="field-hint">
          {hint}
        </p>
      )}
      {error !== undefined && (
        <p id={errorId} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}
