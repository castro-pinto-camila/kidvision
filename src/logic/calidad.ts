/**
 * Control de calidad (SPEC.md, «Control de calidad»).
 * La regla de «menos de 0,5 s» está desactivada en el MVP; los tiempos se guardan en el registro.
 */
import type { Respuesta } from './linea';

export type MotivoDudoso =
  | 'respuestas-iguales'
  | 'falla-grande-acierta-menor'
  | 'punto-remoto-no-confirmado'
  | 'limite-dispositivo';

export const IGUALES_SEGUIDAS = 5;

/** Cinco flechas iguales seguidas. «No sé» no cuenta ni corta la racha. */
export function hayRespuestasIguales(respuestas: Respuesta[]): boolean {
  let racha = 0;
  let previa: Respuesta | null = null;
  for (const r of respuestas) {
    if (r === 'nose') continue;
    racha = r === previa ? racha + 1 : 1;
    previa = r;
    if (racha >= IGUALES_SEGUIDAS) return true;
  }
  return false;
}
