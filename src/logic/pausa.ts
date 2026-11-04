/**
 * Cuando el docente abre «¿Salir de la prueba?» y decide seguir, el tiempo que
 * estuvo abierto no cuenta como tiempo de respuesta del niño.
 */
export function descontarPausa(ultimoToque: number, inicioPausa: number, ahora: number): number {
  return ultimoToque + Math.max(0, ahora - inicioPausa);
}
