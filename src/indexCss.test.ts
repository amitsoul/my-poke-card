// Checks the rule "class selectors only" in src/index.css: a plain element rule like `img { … }` or `h2 { … }`
// would also style the card, and so change the PNG. Only these page-level selectors are allowed besides classes.
import { describe, expect, it } from 'vitest'
// "?raw" (a Vite feature): the file's text as a string, without applying the styles
import css from './index.css?raw'

const ALLOWED_START = /^(\.|#root\b|:root\b|body\b)/

// Every selector in the file, also the ones inside @media blocks. @font-face has no selector and is skipped.
function allSelectors(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const selectors: string[] = []
  // Each "something {" is a rule's start: a selector list, or an at-rule like "@media (…)" (its rules follow)
  for (const match of withoutComments.matchAll(/([^{}]+)\{/g)) {
    const prelude = match[1].trim()
    if (prelude.startsWith('@')) continue
    selectors.push(...splitOnCommas(prelude))
  }
  return selectors
}

// ".a, .b:not(.c, .d)" → [".a", ".b:not(.c, .d)"]: only the commas outside brackets separate selectors
function splitOnCommas(list: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const char of list) {
    if (char === '(') depth += 1
    if (char === ')') depth -= 1
    if (char === ',' && depth === 0) {
      parts.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  parts.push(current.trim())
  return parts
}

describe('src/index.css', () => {
  it('every selector starts with a class (or is :root, #root or body), also inside @media', () => {
    const selectors = allSelectors(css)
    expect(selectors.length).toBeGreaterThan(100) // the file was really read
    for (const selector of selectors) expect(selector).toMatch(ALLOWED_START)
  })

  // The card name hides overflow (2-line limit), which used to cut the bottoms of g, j, p, q, y.
  // Its padding gives them room, and the same negative margin takes the space back, top and bottom,
  // so nothing on the card moves (checked on real cards; here only that the two cancel out).
  it('the card name has room for g, j, p, q, y without moving: padding and negative margin cancel out', () => {
    const rule = css.match(/\.poke-card-name\s*\{([^}]*)\}/)?.[1] ?? ''
    const padding = rule.match(/\bpadding:\s*([\d.]+em) 0;/)?.[1]
    const margin = rule.match(/\bmargin:\s*(-[\d.]+em) 0;/)?.[1]
    expect(padding).toBe('0.1em')
    expect(margin).toBe(`-${padding}`)
  })

  // With display scaling, the browser could round the photo's right edge down and the window's white showed
  // as a thin strip in the PNG. The photo is a little wider than the window, centered (checked on real captures)
  it('the card photo reaches past both sides of the window by the same amount, so no gap and a centered crop', () => {
    const rule = css.match(/\.poke-card-photo\s*\{([^}]*)\}/)?.[1] ?? ''
    const extra = Number(rule.match(/\bwidth:\s*calc\(100% \+ (\d+)px\);/)?.[1])
    const marginLeft = Number(rule.match(/\bmargin-left:\s*(-\d+)px;/)?.[1])
    expect(extra).toBe(2)
    expect(marginLeft).toBe(-extra / 2)
  })

  it('the check itself catches an element rule, also after a comma and inside @media', () => {
    expect(allSelectors('.home h2, img { color: red }')).toEqual(['.home h2', 'img'])
    expect(allSelectors('@media (min-width: 1px) { .a, p { margin: 0 } }')).toEqual(['.a', 'p'])
    expect('img').not.toMatch(ALLOWED_START)
    expect('p').not.toMatch(ALLOWED_START)
  })
})
