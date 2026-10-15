// Test helpers: read attack rows and the Weakness / Resistance / Retreat columns the way a screen reader
// hears them — the names of images (Type symbols) plus the visible text, skipping hidden (decorative) parts.
import { within } from '@testing-library/react'

// The text of an element as heard: an image counts as its name, hidden parts are skipped
function heardText(element: Element): string {
  const parts: string[] = []
  for (const node of Array.from(element.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      parts.push(node.textContent ?? '')
    } else if (node instanceof Element) {
      if (node.getAttribute('aria-hidden') === 'true') continue
      if (node.getAttribute('role') === 'img') parts.push(` ${node.getAttribute('aria-label') ?? ''} `)
      else parts.push(heardText(node))
    }
  }
  return parts.join('').replace(/\s+/g, ' ').trim()
}

// Every attack row as "Cost: Lightning, Colorless | Thunder Shock | 40" (no damage: "… | Transform | ")
export function getAttackRows(scope: HTMLElement): string[] {
  return within(scope)
    .queryAllByRole('listitem')
    .filter((item) => item.classList.contains('attack-row'))
    .map((row) => {
      const cost = row.querySelector('.attack-cost')?.getAttribute('aria-label') ?? ''
      const name = row.querySelector('.attack-name')?.textContent ?? ''
      const damage = row.querySelector('.attack-damage')?.textContent ?? ''
      return `${cost} | ${name} | ${damage}`
    })
}

// One column of the Weakness row, as heard: "Fighting ×2", "Fighting −30", "none", "Colorless, Colorless"
export function getWeaknessValue(scope: HTMLElement, term: 'Weakness' | 'Resistance' | 'Retreat'): string {
  const termElement = within(scope).getByText(term, { selector: 'dt' })
  const value = termElement.nextElementSibling
  if (value === null) throw new Error(`No value after "${term}"`)
  return heardText(value)
}
