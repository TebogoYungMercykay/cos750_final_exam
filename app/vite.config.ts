import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths let the same build run on GitHub Pages, under any sub path, or from a local folder.
  base: './',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      // Logic is covered here; screens and components are covered by the Playwright suite.
      include: ['src/engine/**', 'src/content/**', 'src/state/**/*.ts'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/content/types.ts'],
      reporter: ['text', 'html', 'lcov'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
        'src/engine/**': { lines: 100, functions: 100, branches: 100, statements: 100 },
      },
    },
  },
})
