import { defineConfig } from 'vitest/config';

// Solo para `npm run guia`: corre scripts/guia.gen.ts, que escribe la guía de resultados.
export default defineConfig({ test: { environment: 'node', include: ['scripts/guia.gen.ts'] } });
