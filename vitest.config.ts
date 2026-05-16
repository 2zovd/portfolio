import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const src = (p: string) => fileURLToPath(new URL(`./src/${p}`, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@shared': src('shared'),
      '@features': src('features'),
      '@widgets': src('widgets'),
      '@entities': src('entities'),
      '@app': src('app'),
    },
  },
  test: {
    environment: 'jsdom',
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      include: ['src/shared/ui/**', 'src/features/**'],
      exclude: ['**/index.ts', '**/*.test.ts'],
    },
  },
});
