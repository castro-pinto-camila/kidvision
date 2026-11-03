/// <reference types="vitest/config" />
import basicSsl from '@vitejs/plugin-basic-ssl';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // Rutas relativas para que la app funcione en GitHub Pages (sesión 5).
  base: './',
  // Solo para probar en el celular durante el desarrollo (npm run dev:celular):
  // HTTPS con un certificado propio, necesario para Wake Lock y el service worker.
  plugins: mode === 'celular' ? [basicSsl()] : [],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
