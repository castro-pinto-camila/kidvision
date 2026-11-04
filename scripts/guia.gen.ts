/**
 * Genera docs/guia-resultados.md: qué secuencia de elecciones da cada resultado.
 * Uso: npm run guia (corre con Vitest para poder usar los módulos de src/logic).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { ESCENARIOS, guiaMarkdown } from '../src/logic/escenarios';

it('escribe docs/guia-resultados.md', () => {
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/guia-resultados.md', guiaMarkdown());
  console.log(`Guía escrita en docs/guia-resultados.md (${ESCENARIOS.length} escenarios).`);
});
