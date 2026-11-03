/**
 * Tamaño de la «E» y regla de resolución (SPEC.md, «Tamaño de los optotipos»).
 */
import type { Geometria } from './caja';

export interface Nivel {
  /** Fracción Snellen, por ejemplo «6/12». */
  nombre: string;
  denominador: number;
  logMAR: number;
  /** Tamaño angular de la «E» completa (minutos de arco). */
  thetaMin: number;
}

/** Datos de la pantalla del celular. */
export interface Pantalla {
  /** Píxeles CSS por milímetro, de la calibración con la tarjeta. */
  pxPorMm: number;
  /** window.devicePixelRatio: píxeles físicos por píxel CSS. */
  dpr: number;
}

/** Los siete niveles, de mayor a menor. θ sale de la fracción Snellen: 5′ × denominador / 6. */
export const NIVELES: readonly Nivel[] = [60, 36, 24, 18, 12, 9, 6].map((denominador) => ({
  nombre: `6/${denominador}`,
  denominador,
  logMAR: Math.log10(denominador / 6),
  thetaMin: (5 * denominador) / 6,
}));

/** Grosor mínimo del trazo, en píxeles físicos. */
export const TRAZO_MINIMO_PX = 2;

/** El objetivo del punto remoto nunca es más pequeño que este nivel. */
export const NIVEL_OBJETIVO_MINIMO = '6/12';

/** Prueba de cerca: celular a 40 cm del ojo, sin el lente de la caja. */
export const GEOMETRIA_CERCA: Geometria = { d_mm: 400, e_mm: 0, P: 0 };

export function nivelPorNombre(nombre: string): Nivel {
  const nivel = NIVELES.find((n) => n.nombre === nombre);
  if (!nivel) throw new RangeError(`Nivel desconocido: ${nombre}`);
  return nivel;
}

/** h = θ_rad · (d + e·(1 − P·d)), en mm. */
export function alturaOptotipoMm(thetaMin: number, g: Geometria): number {
  const thetaRad = (thetaMin / 60) * (Math.PI / 180);
  const d = g.d_mm / 1000;
  const e = g.e_mm / 1000;
  return thetaRad * (d + e * (1 - g.P * d)) * 1000;
}

/** Altura en píxeles CSS, para dibujar. */
export function alturaPxCss(alturaMm: number, pantalla: Pantalla): number {
  return alturaMm * pantalla.pxPorMm;
}

/** Grosor del trazo (1/5 de la «E») en píxeles físicos. */
export function trazoPxFisicos(alturaMm: number, pantalla: Pantalla): number {
  return (alturaMm * pantalla.pxPorMm * pantalla.dpr) / 5;
}

/** Un nivel se puede dibujar si su trazo mide al menos 2 píxeles físicos. */
export function esDibujable(nivel: Nivel, g: Geometria, pantalla: Pantalla): boolean {
  return trazoPxFisicos(alturaOptotipoMm(nivel.thetaMin, g), pantalla) >= TRAZO_MINIMO_PX;
}

/** Niveles que se pueden dibujar, de mayor a menor. */
export function nivelesDibujables(g: Geometria, pantalla: Pantalla): Nivel[] {
  return NIVELES.filter((nivel) => esDibujable(nivel, g, pantalla));
}

/**
 * Nivel que se muestra en la búsqueda del punto remoto: el mayor entre 6/12 y
 * el nivel más pequeño dibujable. null si no se puede dibujar ninguno.
 */
export function nivelObjetivo(g: Geometria, pantalla: Pantalla): Nivel | null {
  const dibujables = nivelesDibujables(g, pantalla);
  if (dibujables.length === 0) return null;
  const masPequeno = dibujables[dibujables.length - 1];
  const minimo = nivelPorNombre(NIVEL_OBJETIVO_MINIMO);
  return masPequeno.thetaMin > minimo.thetaMin ? masPequeno : minimo;
}
