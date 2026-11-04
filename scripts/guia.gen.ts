/**
 * Genera docs/guia-resultados.md (qué secuencia de elecciones da cada resultado) y las dos tablas
 * de verdad de las reglas en CSV (docs/tabla-reglas-ojo.csv y docs/tabla-reglas-nino.csv).
 * Uso: npm run guia (corre con Vitest para poder usar los módulos de src/logic).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { it } from 'vitest';
import { ESCENARIOS, guiaMarkdown } from '../src/logic/escenarios';
import { csvNino, csvOjo } from '../src/logic/tablaReglas';

it('escribe docs/guia-resultados.md', () => {
  mkdirSync('docs', { recursive: true });
  writeFileSync('docs/guia-resultados.md', guiaMarkdown());
  writeFileSync('docs/tabla-reglas-ojo.csv', csvOjo());
  writeFileSync('docs/tabla-reglas-nino.csv', csvNino());
  console.log(`Guía escrita en docs/guia-resultados.md (${ESCENARIOS.length} escenarios).`);
});
