// An inline "are you sure?" box: a message and two buttons, right where the user clicked.
// Used for "Change Pokémon?" (Create page) and "Delete MPC 002?" (My Cards).
import { useEffect, useRef } from 'react'

interface InlineConfirmProps {
  message: string
  confirmLabel: string // e.g. "Yes, change" / "Yes, delete"
  cancelLabel: string // e.g. "Keep editing" / "Keep it"
  onConfirm: () => void
  onCancel: () => void
}

export default function InlineConfirm({ message, confirmLabel, cancelLabel, onConfirm, onCancel }: InlineConfirmProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  // Once, when the box appears: focus the safe choice, so Enter can't do the risky thing by accident
  useEffect(() => {
    cancelRef.current?.focus()
  }, [])

  return (
    <div className="inline-confirm" role="alert">
      <p>{message}</p>
      <div className="status-actions">
        <button type="button" className="button" onClick={onConfirm}>
          {confirmLabel}
        </button>
        <button type="button" className="button button-secondary" ref={cancelRef} onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  )
}
