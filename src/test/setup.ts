// Runs before every test file (see "setupFiles" in vite.config.ts).
import '@testing-library/jest-dom/vitest' // adds toBeInTheDocument, toHaveAttribute, … to expect
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Remove what each test rendered, so the next test starts with an empty page.
// (RTL only does this by itself when Vitest "globals" are on; we import describe/it/expect instead.)
afterEach(() => {
  cleanup()
})
