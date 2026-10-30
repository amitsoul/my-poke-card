// Runs before every test file (see "setupFiles" in vite.config.ts).
import '@testing-library/jest-dom/vitest' // adds toBeInTheDocument, toHaveAttribute, … to expect
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { clearMoveCache } from '../utils/moveApi.ts'
import { clearPokemonListCache } from '../utils/pokemonListApi.ts'

// ---------- No console errors or warnings ----------
// Every console.error / console.warn in a test (from our code or from React, e.g. a missing "key")
// makes that test fail. A test that causes one on purpose must allow it with allowConsole(...).

type ConsoleLevel = 'error' | 'warn'

interface ConsoleCall {
  level: ConsoleLevel
  message: string
}

// Kept in our own list (not only in the spy), so a test that restores all mocks can't erase it
let consoleCalls: ConsoleCall[] = []
let allowed: { level: ConsoleLevel; pattern: RegExp }[] = []

// For a test that logs on purpose: allow this one message (only in this test)
export function allowConsole(level: ConsoleLevel, pattern: RegExp): void {
  allowed.push({ level, pattern })
}

function toMessage(args: unknown[]): string {
  return args.map((arg) => (arg instanceof Error ? arg.message : String(arg))).join(' ')
}

beforeEach(() => {
  consoleCalls = []
  allowed = []
  vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
    consoleCalls.push({ level: 'error', message: toMessage(args) })
  })
  vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
    consoleCalls.push({ level: 'warn', message: toMessage(args) })
  })
})

// After EVERY test, so one test can't affect the next:
afterEach(() => {
  // Remove what the test rendered, so the next test starts with an empty page.
  // (RTL only does this by itself when Vitest "globals" are on; we import describe/it/expect instead.)
  // First, so warnings logged while unmounting are caught too.
  cleanup()

  const unexpected = consoleCalls.filter(
    (call) => !allowed.some((allow) => allow.level === call.level && allow.pattern.test(call.message)),
  )
  // Forget every fake function's calls and answers (e.g. a fake resizePhoto that was told to fail),
  // and put the real console back
  vi.restoreAllMocks()
  vi.resetAllMocks()
  // Put back the real browser functions a test replaced (e.g. the fake fetch)
  vi.unstubAllGlobals()
  // Forget the moves and the Pokémon list fetched in this test (both caches live in memory, across tests)
  clearMoveCache()
  clearPokemonListCache()
  // Empty the test browser's localStorage (saved cards, the card counter), so no test sees another's cards
  try {
    window.localStorage.clear()
  } catch {
    // nothing to clean if storage isn't available
  }

  if (unexpected.length > 0) {
    throw new Error(
      `The test logged ${unexpected.length} console message(s):\n` +
        unexpected.map((call) => `console.${call.level}: ${call.message}`).join('\n'),
    )
  }
})
