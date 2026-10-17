// "Saved as MPC 003 ✓" after saving a card, with a link to My Cards.
// Focus moves to the message once, so keyboard and screen-reader users know the save worked.
import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import { formatCardNumber } from '../utils/savedCards.ts'

interface SavedNoticeProps {
  cardNumber: number
}

export default function SavedNotice({ cardNumber }: SavedNoticeProps) {
  const messageRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    messageRef.current?.focus()
  }, [])

  return (
    <>
      <p role="status" tabIndex={-1} ref={messageRef} className="saved-notice">
        Saved as {formatCardNumber(cardNumber)} ✓
      </p>
      <Link to="/my-cards" className="saved-notice-link">
        View in My Cards
      </Link>
    </>
  )
}
