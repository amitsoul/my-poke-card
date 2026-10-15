/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    // A fake browser (document, window, clicks) so component tests can render React
    environment: 'jsdom',
    // Runs before every test file: jest-dom matchers + cleanup between tests
    setupFiles: ['./src/test/setup.ts'],
  },
})
