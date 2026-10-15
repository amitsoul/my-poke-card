// The inline warning shown under "Your favorite Pokémon" before changing it, when the form has answers.
import { useEffect, useRef } from 'react'

interface ChangeWarningProps {
  onConfirm: () => void // "Yes, change"
  onCancel: () => void // "Keep editing"
}

export default function ChangeWarning({ onConfirm, onCancel }: ChangeWarningProps) {
  const keepEditingRef = useRef<HTMLButtonElement>(null)

  // Once, when the warning appears: focus the safe choice, so Enter can't clear the answers by accident
  useEffect(() => {
    keepEditingRef.current?.focus()
  }, [])

  return (
    <div className="change-warning" role="alert">
      <p>Change Pokémon? Your answers will be cleared.</p>
      <div className="status-actions">
        <button type="button" className="button" onClick={onConfirm}>
          Yes, change
        </button>
        <button type="button" className="button button-secondary" ref={keepEditingRef} onClick={onCancel}>
          Keep editing
        </button>
      </div>
    </div>
  )
}
