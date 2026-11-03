import { describe, expect, it } from 'vitest';
import { CAJA_POR_DEFECTO, crearCaja, ranuras } from './caja';
import {
  GEOMETRIA_CERCA,
  NIVELES,
  alturaOptotipoMm,
  alturaPxCss,
  esDibujable,
  nivelObjetivo,
  nivelPorNombre,
  nivelesDibujables,
  trazoPxFisicos,
  type Pantalla,
} from './optotipos';

// Las tablas de SPEC.md usan 0,06 mm por píxel FÍSICO.
// Con devicePixelRatio = 1, un píxel CSS es un píxel físico.
const PANTALLA_006: Pantalla = { pxPorMm: 1 / 0.06, dpr: 1 };
// La misma pantalla física descrita con DPR = 2: 0,12 mm por píxel CSS.
const PANTALLA_006_DPR2: Pantalla = { pxPorMm: 1 / 0.12, dpr: 2 };

const R = ranuras(CAJA_POR_DEFECTO);
const nivel = nivelPorNombre;

// Tabla de tamaños de SPEC.md: [nivel, logMAR, θ (min), altura en R0 (mm), píxeles físicos en R0].
const TABLA_TAMANOS: [string, number, number, number, number][] = [
  ['6/60', 1.0, 50, 4.85, 81],
  ['6/36', 0.78, 30, 2.91, 48],
  ['6/24', 0.6, 20, 1.94, 32],
  ['6/18', 0.48, 15, 1.45, 24],
  ['6/12', 0.3, 10, 0.97, 16],
  ['6/9', 0.18, 7.5, 0.73, 12],
  ['6/6', 0.0, 5, 0.48, 8],
];

describe('niveles', () => {
  it('son siete, de 6/60 a 6/6', () => {
    expect(NIVELES.map((n) => n.nombre)).toEqual(TABLA_TAMANOS.map((f) => f[0]));
  });

  it.each(TABLA_TAMANOS)('%s: logMAR %s y θ = %s′', (nombre, logMAR, theta) => {
    expect(nivel(nombre).thetaMin).toBe(theta);
    expect(Math.abs(nivel(nombre).logMAR - logMAR)).toBeLessThanOrEqual(0.005);
  });
});

describe('tabla de tamaños en R0 (0,06 mm por píxel físico)', () => {
  it.each(TABLA_TAMANOS)('%s mide %s mm y %s px', (nombre, _logMAR, _theta, alturaMm, px) => {
    const h = alturaOptotipoMm(nivel(nombre).thetaMin, R[0]);
    expect(Math.abs(h - alturaMm)).toBeLessThanOrEqual(0.05);
    expect(Math.round(trazoPxFisicos(h, PANTALLA_006) * 5)).toBe(px);
    expect(Math.round(alturaPxCss(h, PANTALLA_006))).toBe(px);
  });

  it('en R0 la altura no depende de e', () => {
    const base = alturaOptotipoMm(50, R[0]);
    for (const e_mm of [0, 15, 30]) {
      expect(alturaOptotipoMm(50, { ...R[0], e_mm })).toBeCloseTo(base, 9);
    }
  });

  it('en las demás ranuras e sí cambia la altura', () => {
    expect(alturaOptotipoMm(50, { ...R[10], e_mm: 0 })).not.toBeCloseTo(
      alturaOptotipoMm(50, R[10]),
      3,
    );
  });
});

describe('regla de resolución (0,06 mm por píxel físico)', () => {
  it('el 6/12 se dibuja en R3 (trazo 2,20 px)', () => {
    expect(esDibujable(nivel('6/12'), R[3], PANTALLA_006)).toBe(true);
  });

  it('el 6/12 no se dibuja en R5 (trazo 1,83 px)', () => {
    expect(esDibujable(nivel('6/12'), R[5], PANTALLA_006)).toBe(false);
  });

  it('en R0 se dibuja hasta el 6/9; el 6/6 no (trazo 1,62 px)', () => {
    expect(nivelesDibujables(R[0], PANTALLA_006).map((n) => n.nombre)).toEqual([
      '6/60', '6/36', '6/24', '6/18', '6/12', '6/9',
    ]);
  });

  it('cuenta el píxel físico: la misma pantalla con DPR = 2 da el mismo resultado', () => {
    for (const r of R) {
      expect(nivelesDibujables(r, PANTALLA_006_DPR2)).toEqual(nivelesDibujables(r, PANTALLA_006));
    }
  });

  it('si se ignorara el DPR, el 6/9 no se dibujaría en R0', () => {
    const soloCss: Pantalla = { pxPorMm: 1 / 0.12, dpr: 1 };
    expect(esDibujable(nivel('6/9'), R[0], soloCss)).toBe(false);
    expect(esDibujable(nivel('6/9'), R[0], PANTALLA_006_DPR2)).toBe(true);
  });
});

describe('nivel objetivo del punto remoto (0,06 mm por píxel físico)', () => {
  // R4 se omite: el trazo del 6/12 mide 1,997 px, justo en el límite.
  it.each([
    ['R0', '6/12'],
    ['R1', '6/12'],
    ['R2', '6/12'],
    ['R3', '6/12'],
    ['R5', '6/18'],
    ['R6', '6/18'],
    ['R7', '6/18'],
    ['R8', '6/18'],
    ['R9', '6/18'],
    ['R10', '6/24'],
  ])('%s → %s', (id, esperado) => {
    const r = R.find((x) => x.id === id)!;
    expect(nivelObjetivo(r, PANTALLA_006)?.nombre).toBe(esperado);
  });

  it('nunca es más pequeño que 6/12, aunque se pueda dibujar el 6/6', () => {
    const muyFina: Pantalla = { pxPorMm: 1 / 0.02, dpr: 1 };
    expect(esDibujable(nivel('6/6'), R[0], muyFina)).toBe(true);
    expect(nivelObjetivo(R[0], muyFina)?.nombre).toBe('6/12');
  });

  it('es null si no se puede dibujar ningún nivel', () => {
    expect(nivelObjetivo(R[0], { pxPorMm: 1, dpr: 1 })).toBeNull();
  });
});

describe('con otro lente (P = +2.00 D) nada depende de P = 3', () => {
  const R2D = ranuras(crearCaja(2));

  it('en R0 (d = 500 mm) la altura sigue sin depender de e', () => {
    expect(alturaOptotipoMm(50, R2D[0])).toBeCloseTo(7.27, 2);
    for (const e_mm of [0, 15, 30]) {
      expect(alturaOptotipoMm(50, { ...R2D[0], e_mm })).toBeCloseTo(7.27, 2);
    }
  });

  it('en R2 (d = 333,3 mm) usa P = 2 en la corrección por e', () => {
    // θ = 50′ · (333,3 + 15 · (1 − 2 · 0,3333)) = 0,014544 rad · 338,3 mm
    expect(alturaOptotipoMm(50, R2D[2])).toBeCloseTo(4.921, 2);
  });

  it('el 6/9 se dibuja en R0 y el objetivo de R10 cambia con la caja', () => {
    expect(esDibujable(nivel('6/9'), R2D[0], PANTALLA_006)).toBe(true);
    // R10 con P = 2 está a 142,9 mm: el 6/18 mide 2,20 px y ya se dibuja.
    expect(nivelObjetivo(R2D[10], PANTALLA_006)?.nombre).toBe('6/18');
  });
});

describe('prueba de cerca a 40 cm, sin el lente de la caja', () => {
  it('el 6/9 mide θ · 400 mm = 0,87 mm', () => {
    expect(alturaOptotipoMm(7.5, GEOMETRIA_CERCA)).toBeCloseTo(0.873, 3);
  });

  it('con 0,06 mm por píxel físico el 6/9 se dibuja', () => {
    expect(esDibujable(nivel('6/9'), GEOMETRIA_CERCA, PANTALLA_006)).toBe(true);
  });

  it('si el 6/9 se dibuja en R0, también se dibuja de cerca', () => {
    for (const mmPorPx of [0.04, 0.06, 0.07, 0.072, 0.08, 0.094]) {
      const p: Pantalla = { pxPorMm: 1 / mmPorPx, dpr: 1 };
      if (esDibujable(nivel('6/9'), R[0], p)) {
        expect(esDibujable(nivel('6/9'), GEOMETRIA_CERCA, p)).toBe(true);
      }
    }
  });
});
