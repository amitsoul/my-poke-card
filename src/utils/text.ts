// Small text helpers for display. They never change what is stored — only how it is shown.

// The first letter of every word in capitals, the rest as typed: "super speed" → "Super Speed".
// Words are split at spaces, hyphens and apostrophes: "x-ray vision" → "X-Ray Vision", "o'neil" → "O'Neil".
export function toTitleCase(text: string): string {
  return text.replace(/(^|[ '-])(\p{L})/gu, (_match, separator: string, letter: string) => separator + letter.toUpperCase())
}

// The browser tab title for a page: "My Cards" → "My Cards · My Poke Card"
export function getPageTitle(page: string): string {
  return `${page} · My Poke Card`
}
