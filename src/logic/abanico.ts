/**
 * Carta de abanico: 12 rayos que forman 6 líneas rectas, numeradas del 1 al 6.
 * Cada línea lleva su número en los dos extremos (no es un reloj).
 * Ángulos en grados, antihorario desde la horizontal, sobre 180°.
 */
import { exigir, type Contexto, type Flujo, type Lugar } from './pasos';
import { GIROS_ABANICO } from './secuencias';

/** Botones del docente: cada uno es una línea de la carta, con el número que lleva en sus dos extremos. */
export const BOTONES_ABANICO = ['1', '2', '3', '4', '5', '6'] as const;

/**
 * Número que se dibuja en el extremo del rayo `hora` (1 a 12, como las horas del reloj).
 * Los dos extremos de una línea (hora y hora + 6) llevan el mismo número, y ese número
 * es el del botón que le corresponde: botón = número − 1.
 */
export function etiquetaRayo(hora: number): number {
  return (hora % 6) + 1;
}

/** Giro de la segunda vuelta, al azar entre estos valores. */
export const ROTACIONES_SEGUNDA_VUELTA = [60, 90, 120] as const;

export const TOLERANCIA_ABANICO = 15;

/** null = «todas iguales». */
export type AnguloAbanico = number | null;

function modulo180(a: number): number {
  return ((a % 180) + 180) % 180;
}

/**
 * Ángulo físico de la línea del botón elegido, con la carta girada `rotacion`
 * grados. El botón 0 («1») sin giro es la vertical (90°); el 3 («4»), la horizontal (0°).
 */
export function anguloFisico(boton: number, rotacion: number): number {
  return modulo180(90 - 30 * boton + rotacion);
}

/** Diferencia entre dos líneas, de 0° a 90°. */
export function diferenciaAngular(a: number, b: number): number {
  const d = modulo180(a - b);
  return Math.min(d, 180 - d);
}

/** Consistente si las dos líneas difieren ≤ 15°. «Todas iguales» en una vuelta = no consistente. */
export function abanicoConsistente(primera: AnguloAbanico, segunda: AnguloAbanico): boolean {
  if (primera === null || segunda === null) return false;
  return diferenciaAngular(primera, segunda) <= TOLERANCIA_ABANICO;
}

/** Las dos vueltas: sin giro y con un giro al azar de 60°, 90° o 120°. */
export function* hacerAbanico(ctx: Contexto, lugar: Lugar): Flujo<[AnguloAbanico, AnguloAbanico]> {
  const opciones = ROTACIONES_SEGUNDA_VUELTA;
  // Sin azar (la prueba real): el giro es fijo por ojo y por juego de secuencias.
  const azar = ctx.azar;
  const giro = azar
    ? opciones[Math.min(Math.floor(azar() * opciones.length), opciones.length - 1)]
    : GIROS_ABANICO[ctx.version][ctx.ojo];
  const angulos: AnguloAbanico[] = [];
  for (const [vuelta, rotacion] of [[1, 0], [2, giro]] as const) {
    const { eleccion } = exigir(
      yield { tipo: 'abanico', ojo: ctx.ojo, vuelta, rotacion, lugar },
      'abanico',
    );
    angulos.push(eleccion === 'iguales' ? null : anguloFisico(eleccion, rotacion));
  }
  return [angulos[0], angulos[1]];
}
