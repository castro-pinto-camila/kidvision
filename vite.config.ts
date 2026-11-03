/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

export default defineConfig({
  // Rutas relativas para que la app funcione en GitHub Pages (sesión 5).
  base: './',
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
