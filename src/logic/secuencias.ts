/**
 * Secuencias fijas de «E» y giro fijo del abanico.
 *
 * Cada línea de la prueba tiene su propia secuencia, distinta de las demás pero
 * siempre la misma: así lo que se ve en el celular coincide con docs/guia-resultados.md
 * y la prueba se puede comprobar a mano. Hay dos juegos (A y B): la primera
 * evaluación de un niño usa A y la siguiente B, para que al repetir no vea las
 * mismas «E».
 *
 * Una secuencia depende solo de su «clave» (tipo de prueba, ojo, ranura, nivel y
 * cuántas veces se mostró ya): no hay azar.
 */
import { DIRECCIONES, type Direccion } from './orientaciones';

export type VersionLineas = 'A' | 'B';

/** Giro de la segunda vuelta del abanico, fijo por juego y por ojo (grados, antihorario). */
export const GIROS_ABANICO: Record<VersionLineas, Record<'OD' | 'OI', 60 | 90 | 120>> = {
  A: { OD: 90, OI: 120 },
  B: { OD: 120, OI: 60 },
};

/** Juego A en la primera evaluación del niño, B en la segunda, A en la tercera… */
export function versionPorEvaluaciones(evaluacionesPrevias: number): VersionLineas {
  return evaluacionesPrevias % 2 === 0 ? 'A' : 'B';
}

/** Resumen numérico de un texto (FNV-1a de 32 bits). */
function resumen(texto: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Generador de números repetible (mulberry32). */
function generador(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Secuencia de la línea con esa clave: dos «E» seguidas nunca son iguales y
 * aparecen las cuatro orientaciones.
 */
export function secuenciaBase(version: VersionLineas, clave: string, cantidad = 5): Direccion[] {
  for (let intento = 0; ; intento++) {
    const azar = generador(resumen(`${version}|${clave}|${intento}`));
    const resultado: Direccion[] = [];
    let previa: Direccion | null = null;
    for (let i = 0; i < cantidad; i++) {
      const opciones = DIRECCIONES.filter((d) => d !== previa);
      previa = opciones[Math.min(Math.floor(azar() * opciones.length), opciones.length - 1)];
      resultado.push(previa);
    }
    if (cantidad < DIRECCIONES.length || DIRECCIONES.every((d) => resultado.includes(d))) return resultado;
  }
}

/**
 * La secuencia que se muestra. Como la primera «E» tampoco puede repetir la última
 * de la línea anterior, si coinciden se gira cada orientación una posición
 * (arriba→derecha→abajo→izquierda→arriba): sigue siendo fija para esa línea anterior.
 */
export function secuenciaLinea(
  version: VersionLineas,
  clave: string,
  anterior: Direccion | null,
  cantidad = 5,
): Direccion[] {
  const base = secuenciaBase(version, clave, cantidad);
  if (anterior === null || base[0] !== anterior) return base;
  return base.map((d) => DIRECCIONES[(DIRECCIONES.indexOf(d) + 1) % DIRECCIONES.length]);
}
