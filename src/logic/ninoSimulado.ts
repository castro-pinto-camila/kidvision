/**
 * Niño simulado para las pruebas del flujo. No se usa en la app.
 *
 * Modelo simple: el ojo enfoca nítido una vergencia S (en el ojo) si
 * F − A − 0,3 ≤ S ≤ F + 0,3, donde F es su refracción (miope < 0,
 * hipermétrope > 0) y A su acomodación. Si ve nítido lee cualquier línea;
 * si ve borroso solo lee las letras de tamaño ≥ `borrosa`.
 */
import { vergenciaDeRanura, vergenciaEnOjo } from '../core/caja';
import { anguloFisico, BOTONES_ABANICO } from './abanico';
import type { Paso } from './flujo';
import type { Respuesta, Toque } from './linea';
import type { Azar, Direccion } from './orientaciones';
import type { Evento, Ojo, PasoLinea } from './pasos';

export interface OjoSimulado {
  /** Refracción F (D). */
  refraccion: number;
  /** Acomodación A (D); 10 por defecto. */
  acomodacion?: number;
  /** false = no ve nítido nunca (otra causa). */
  puedeVerNitido?: boolean;
  /** Denominador del nivel que lee cuando ve borroso (60 = solo 6/60). */
  borrosa?: number;
  /** Denominador que lee con el estenopeico (por defecto, igual que `borrosa`). */
  conEstenopeico?: number;
  /** Ángulo físico de la línea que ve más negra; null = todas iguales. */
  ejeAstigmatismo?: number | null;
  /** Responde siempre esto (para probar el control de calidad). */
  respondeSiempre?: Respuesta;
}

export type Nino = Record<Ojo, OjoSimulado>;

const TOLERANCIA_D = 0.3;
const OPUESTA: Record<Direccion, Direccion> = {
  arriba: 'abajo',
  abajo: 'arriba',
  derecha: 'izquierda',
  izquierda: 'derecha',
};

/** Vergencia que llega al ojo en ese paso (el clip suma +2.00 D al lente). */
export function vergenciaEstimulo(paso: PasoLinea): number {
  const P = paso.lugar.P + (paso.prueba === 'clip' ? 2 : 0);
  return vergenciaEnOjo(vergenciaDeRanura(paso.lugar.d_mm, P), paso.lugar.e_mm);
}

/** ¿Lee correctamente esta línea? */
export function leeLinea(ojo: OjoSimulado, paso: PasoLinea): boolean {
  const S = vergenciaEstimulo(paso);
  const F = ojo.refraccion;
  const A = ojo.acomodacion ?? 10;
  const nitido =
    (ojo.puedeVerNitido ?? true) && S >= F - A - TOLERANCIA_D && S <= F + TOLERANCIA_D;
  if (nitido) return true;
  const limite =
    paso.prueba === 'estenopeico' ? (ojo.conEstenopeico ?? ojo.borrosa ?? 60) : (ojo.borrosa ?? 60);
  return paso.nivel.denominador >= limite;
}

/** Respuestas de una línea: todas bien si la lee, todas al revés si no. */
export function toquesPara(paso: PasoLinea, bien: boolean, ojo?: OjoSimulado): Toque[] {
  return paso.orientaciones.map((d) => ({
    respuesta: ojo?.respondeSiempre ?? (bien ? d : OPUESTA[d]),
    ms: 1200,
  }));
}

export function responderComo(nino: Nino, paso: Paso): Evento {
  switch (paso.tipo) {
    case 'colocar':
    case 'espera':
      return { tipo: 'confirmar' };
    case 'linea': {
      const ojo = nino[paso.ojo];
      return { tipo: 'linea', toques: toquesPara(paso, leeLinea(ojo, paso), ojo) };
    }
    case 'abanico': {
      const eje = nino[paso.ojo].ejeAstigmatismo ?? null;
      const boton = BOTONES_ABANICO.findIndex((_, b) => anguloFisico(b, paso.rotacion) === eje);
      return { tipo: 'abanico', eleccion: boton >= 0 ? boton : 'iguales' };
    }
    case 'fin':
      throw new Error('La prueba ya terminó');
  }
}

/** Azar repetible (generador congruencial) para que las pruebas den siempre lo mismo. */
export function azarConSemilla(semilla: number): Azar {
  let x = semilla >>> 0;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 2 ** 32;
  };
}
