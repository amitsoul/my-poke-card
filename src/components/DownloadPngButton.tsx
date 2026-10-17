// "Download PNG" for a saved card. It finds its card (the .poke-card-frame in the same <article>),
// shows "Preparing PNG..." while working, and a message if it fails.
import { useState, type MouseEvent } from 'react'
import { downloadCardPng } from '../utils/downloadCardPng.ts'

interface DownloadPngButtonProps {
  fileName: string // e.g. "amits-pikachu-mpc-001.png"
}

export default function DownloadPngButton({ fileName }: DownloadPngButtonProps) {
  const [status, setStatus] = useState<'idle' | 'working' | 'error'>('idle')
  const isWorking = status === 'working'

  async function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (isWorking) return // one PNG at a time
    const frame = event.currentTarget.closest('article')?.querySelector<HTMLElement>('.poke-card-frame')
    if (frame === null || frame === undefined) {
      setStatus('error')
      return
    }
    setStatus('working')
    try {
      await downloadCardPng(frame, fileName)
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      {/* aria-disabled (not disabled) while working, so the button keeps keyboard focus */}
      <button
        type="button"
        className="button button-secondary"
        aria-busy={isWorking}
        aria-disabled={isWorking}
        onClick={handleClick}
      >
        {isWorking ? 'Preparing PNG...' : 'Download PNG'}
      </button>
      {status === 'error' && (
        <p role="alert" className="save-message">
          Sorry, the PNG couldn't be created. Please try again.
        </p>
      )}
    </>
  )
}
