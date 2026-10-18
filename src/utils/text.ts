// Small text helpers for display. They never change what is stored — only how it is shown.

// The first letter of every word in capitals, the rest as typed: "super speed" → "Super Speed".
// Words are split at spaces, hyphens and apostrophes: "x-ray vision" → "X-Ray Vision", "o'neil" → "O'Neil".
export function toTitleCase(text: string): string {
  return text.replace(/(^|[ '-])(\p{L})/gu, (_match, separator: string, letter: string) => separator + letter.toUpperCase())
}

// The app's name, as shown on the landing page tab and after every page's name
export const APP_NAME = 'My Poké Card'

// The browser tab title for a page: "My Cards" → "My Cards · My Poké Card"
export function getPageTitle(page: string): string {
  return `${page} · ${APP_NAME}`
}
