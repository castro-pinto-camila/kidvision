/**
 * Calificación de una línea de cinco «E».
 */
import type { Direccion } from './orientaciones';

/** Lo que toca el docente por cada «E»: una flecha o «no sé». */
export type Respuesta = Direccion | 'nose';

export interface Toque {
  respuesta: Respuesta;
  /** Milisegundos desde el toque anterior (el primero, desde que apareció la línea). */
  ms: number;
}

export const LETRAS_POR_LINEA = 5;

/** Aciertos para pasar una línea de tamizaje (IAPB). */
export const ACIERTOS_PARA_PASAR = 4;

/** Aciertos para aprobar un nivel del umbral. */
export const ACIERTOS_UMBRAL = 3;

/** Cuenta los aciertos. «No sé» cuenta como error. */
export function contarAciertos(mostradas: Direccion[], respuestas: Respuesta[]): number {
  return mostradas.filter((d, i) => respuestas[i] === d).length;
}

/**
 * Cuántas respuestas hacen falta para que la línea quede decidida: pasa al
 * llegar a `necesarios` aciertos y falla cuando ya no puede llegar. null si con
 * estas respuestas todavía no se decide. Cortar ahí no cambia el resultado.
 */
export function respuestasParaDecidir(
  mostradas: Direccion[],
  respuestas: Respuesta[],
  necesarios: number,
): number | null {
  let aciertos = 0;
  let errores = 0;
  const n = Math.min(mostradas.length, respuestas.length);
  for (let i = 0; i < n; i++) {
    if (respuestas[i] === mostradas[i]) aciertos++;
    else errores++;
    if (aciertos >= necesarios || errores > mostradas.length - necesarios) return i + 1;
  }
  return null;
}
