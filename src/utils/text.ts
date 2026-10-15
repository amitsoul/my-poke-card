// Small text helpers for display. They never change what is stored — only how it is shown.

// The first letter of every word in capitals, the rest as typed: "super speed" → "Super Speed".
// Words are split at spaces and hyphens, like the attack names: "x-ray vision" → "X-Ray Vision".
export function toTitleCase(text: string): string {
  return text.replace(/(^|[ -])(\p{L})/gu, (_match, separator: string, letter: string) => separator + letter.toUpperCase())
}
