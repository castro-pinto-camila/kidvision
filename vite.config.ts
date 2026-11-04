/// <reference types="vitest/config" />
import basicSsl from '@vitejs/plugin-basic-ssl';
import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

/** Archivos de public/, con rutas relativas y barras normales. */
function archivosPublicos(dir = 'public'): string[] {
  return readdirSync(dir).flatMap((nombre) => {
    const ruta = join(dir, nombre);
    return statSync(ruta).isDirectory() ? archivosPublicos(ruta) : [relative('public', ruta).replace(/\\/g, '/')];
  });
}

/**
 * Escribe sw.js al compilar, con la lista de todos los archivos de la app y
 * una versión que cambia cuando cambia algún archivo. Así la app funciona sin
 * internet después de la primera carga, sin librerías.
 */
function serviceWorker(): Plugin {
  return {
    name: 'kidvision-service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const archivos = ['./', './index.html', ...Object.keys(bundle), ...archivosPublicos()]
        .filter((a) => a !== 'sw.js')
        .map((a) => (a.startsWith('./') ? a : `./${a}`));
      const unicos = [...new Set(archivos)].sort();
      const hash = createHash('sha256');
      for (const nombre of Object.keys(bundle).sort()) {
        const item = bundle[nombre];
        hash.update(nombre);
        hash.update(item.type === 'chunk' ? item.code : item.source);
      }
      const version = hash.digest('hex').slice(0, 12);
      const plantilla = readFileSync('src/sw.js', 'utf-8');
      this.emitFile({
        type: 'asset',
        fileName: 'sw.js',
        source: plantilla
          .replace('__VERSION__', version)
          .replace('__ARCHIVOS__', JSON.stringify(unicos, null, 2)),
      });
    },
  };
}

/** Identificador corto del último commit, para mostrar qué versión de la app tiene cada celular. */
function commitActual(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'sin-git';
  }
}

export default defineConfig(({ mode }) => ({
  define: {
    __COMMIT__: JSON.stringify(commitActual()),
    __FECHA_COMPILACION__: JSON.stringify(new Date().toISOString()),
  },
  // Rutas relativas para que la app funcione en GitHub Pages (sesión 5).
  base: './',
  plugins: [
    serviceWorker(),
    // Solo para probar en el celular durante el desarrollo (npm run dev:celular):
    // HTTPS con un certificado propio, necesario para Wake Lock y el service worker.
    ...(mode === 'celular' ? [basicSsl()] : []),
  ],
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
