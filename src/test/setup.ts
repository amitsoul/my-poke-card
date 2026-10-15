// Runs before every test file (see "setupFiles" in vite.config.ts).
import '@testing-library/jest-dom/vitest' // adds toBeInTheDocument, toHaveAttribute, … to expect
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { clearMoveCache } from '../utils/moveApi.ts'

// After EVERY test, so one test can't affect the next:
afterEach(() => {
  // Remove what the test rendered, so the next test starts with an empty page.
  // (RTL only does this by itself when Vitest "globals" are on; we import describe/it/expect instead.)
  cleanup()
  // Forget every fake function's calls and answers (e.g. a fake resizePhoto that was told to fail)
  vi.resetAllMocks()
  // Put back the real browser functions a test replaced (e.g. the fake fetch)
  vi.unstubAllGlobals()
  // Forget the moves fetched in this test (the move cache lives in memory, across tests)
  clearMoveCache()
})
