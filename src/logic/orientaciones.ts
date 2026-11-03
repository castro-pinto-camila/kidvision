/**
 * Orientaciones al azar de las «E».
 */

export const DIRECCIONES = ['arriba', 'derecha', 'abajo', 'izquierda'] as const;
export type Direccion = (typeof DIRECCIONES)[number];

/** Fuente de azar: devuelve un número en [0, 1), como Math.random. */
export type Azar = () => number;

/**
 * Genera `cantidad` orientaciones al azar. Dos seguidas nunca son iguales,
 * tampoco la primera con `anterior` (la última «E» de la línea previa). Así un
 * niño que responde bien nunca da cinco respuestas iguales seguidas.
 */
export function generarOrientaciones(
  cantidad: number,
  azar: Azar,
  anterior: Direccion | null = null,
): Direccion[] {
  const resultado: Direccion[] = [];
  let previa = anterior;
  for (let i = 0; i < cantidad; i++) {
    const opciones = DIRECCIONES.filter((d) => d !== previa);
    const elegida = opciones[Math.min(Math.floor(azar() * opciones.length), opciones.length - 1)];
    resultado.push(elegida);
    previa = elegida;
  }
  return resultado;
}
