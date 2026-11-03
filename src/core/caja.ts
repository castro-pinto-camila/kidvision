/**
 * Óptica de la caja: ranuras, distancias y vergencias (SPEC.md, «Óptica de la caja»).
 * Distancias en mm; potencias y vergencias en dioptrías.
 */

/** Parámetros editables de la caja. */
export interface ConfigCaja {
  /** Potencia del lente de la caja (D). */
  P: number;
  /** Distancia del lente al ojo (mm). */
  e_mm: number;
  /** Distancia de la pantalla al lente en cada ranura, de R0 a R10 (mm). */
  ranuras_mm: number[];
  /** Distancia horizontal del centro de la pantalla al centro del lente (mm). */
  lenteDesdeCentro_mm: number;
}

/** Geometría con la que se ve la pantalla: sirve para una ranura o para la prueba de cerca. */
export interface Geometria {
  /** Distancia de la pantalla al lente (mm); sin lente, al ojo. */
  d_mm: number;
  /** Distancia del lente al ojo (mm). */
  e_mm: number;
  /** Potencia del lente (D); 0 si no hay lente. */
  P: number;
}

export interface Ranura extends Geometria {
  id: string;
  /** Vergencia que produce la ranura (D). */
  V: number;
  /** Vergencia en el ojo (D). */
  Vojo: number;
}

/** Vergencias de diseño de R0 a R10 (D). */
export const VERGENCIAS_NOMINALES: readonly number[] = [
  0, -0.5, -1, -1.5, -2, -2.5, -3, -3.5, -4, -4.5, -5,
];

/** d = 1 / (P − V), en mm. */
export function distanciaParaVergencia(V: number, P: number): number {
  if (P - V <= 0) {
    throw new RangeError(`No hay distancia posible para V = ${V} D con P = ${P} D`);
  }
  return 1000 / (P - V);
}

/** V = P − 1/d: la vergencia que produce una ranura a d_mm del lente. */
export function vergenciaDeRanura(d_mm: number, P: number): number {
  return P - 1000 / d_mm;
}

/** V_ojo = V / (1 − e·V). */
export function vergenciaEnOjo(V: number, e_mm: number): number {
  return V / (1 - (e_mm / 1000) * V);
}

/** Caja con las ranuras ubicadas en las vergencias de diseño. */
export function crearCaja(P = 3, e_mm = 15, lenteDesdeCentro_mm = 31): ConfigCaja {
  return {
    P,
    e_mm,
    ranuras_mm: VERGENCIAS_NOMINALES.map((V) => distanciaParaVergencia(V, P)),
    lenteDesdeCentro_mm,
  };
}

export const CAJA_POR_DEFECTO: ConfigCaja = crearCaja();

/**
 * Ranuras R0…R10 de una caja. La vergencia sale de la distancia, para que
 * corregir la distancia de una ranura corrija también su vergencia.
 */
export function ranuras(config: ConfigCaja): Ranura[] {
  return config.ranuras_mm.map((d_mm, i) => {
    const V = vergenciaDeRanura(d_mm, config.P);
    return {
      id: `R${i}`,
      d_mm,
      e_mm: config.e_mm,
      P: config.P,
      V,
      Vojo: vergenciaEnOjo(V, config.e_mm),
    };
  });
}
