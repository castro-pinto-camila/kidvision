/**
 * Genera la plantilla de corte de la caja en docs/, con la configuración por defecto.
 * Uso: npm run plantilla
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { CAJA_POR_DEFECTO } from '../src/core/caja.ts';
import { generarPlantilla, plantillaHtml, plantillaSvg } from '../src/core/plantilla.ts';

const plantilla = generarPlantilla(CAJA_POR_DEFECTO);
mkdirSync('docs', { recursive: true });
writeFileSync('docs/plantilla-caja.html', plantillaHtml(plantilla, 'Plantilla de la caja KidVision'));
writeFileSync('docs/plantilla-caja.svg', plantillaSvg(plantilla));

const d = plantilla.dimensiones;
const mm = (n: number) => n.toFixed(1);
console.log('Plantilla escrita en docs/plantilla-caja.html (hojas A4) y docs/plantilla-caja.svg (hoja grande).');
console.log(`Caja: ${mm(d.largoTotal)} × ${mm(d.anchoTotal)} × ${mm(d.altoTotal)} mm (largo × ancho × alto).`);
