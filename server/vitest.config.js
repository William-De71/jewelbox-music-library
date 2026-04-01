import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    reporters: ['verbose'],
    coverage: {
      provider: 'v8',
      include: ['src/db/queries.js', 'src/db/schema.js', 'src/routes/albums.js'],
      exclude: ['src/**/*.test.js'],
      reporter: ['text', 'html'],
      thresholds: {
        lines: 98,
        functions: 98,
        branches: 85,
        statements: 98,
      },
    },
  },
});
