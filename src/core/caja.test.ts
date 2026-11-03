import { describe, expect, it } from 'vitest';
import {
  CAJA_POR_DEFECTO,
  crearCaja,
  distanciaParaVergencia,
  ranuras,
  vergenciaDeRanura,
  vergenciaEnOjo,
} from './caja';

// Tabla de ranuras de SPEC.md: [V (D), d (mm), V en el ojo con e = 15 mm (D)].
const TABLA_RANURAS: [number, number, number][] = [
  [0.0, 333.3, 0.0],
  [-0.5, 285.7, -0.5],
  [-1.0, 250.0, -0.99],
  [-1.5, 222.2, -1.47],
  [-2.0, 200.0, -1.94],
  [-2.5, 181.8, -2.41],
  [-3.0, 166.7, -2.87],
  [-3.5, 153.8, -3.33],
  [-4.0, 142.9, -3.77],
  [-4.5, 133.3, -4.22],
  [-5.0, 125.0, -4.65],
];

describe('tabla de ranuras con la caja por defecto (P = +3.00 D, e = 15 mm)', () => {
  const lista = ranuras(CAJA_POR_DEFECTO);

  it('tiene 11 ranuras, de R0 a R10', () => {
    expect(lista.map((r) => r.id)).toEqual([
      'R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10',
    ]);
  });

  it.each(TABLA_RANURAS.map((fila, i) => [`R${i}`, ...fila] as const))(
    '%s: V = %s D, d = %s mm, V en el ojo = %s D',
    (id, V, d_mm, Vojo) => {
      const r = lista.find((x) => x.id === id)!;
      expect(Math.abs(r.d_mm - d_mm)).toBeLessThanOrEqual(0.1);
      expect(Math.abs(r.V - V)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(r.Vojo - Vojo)).toBeLessThanOrEqual(0.01);
    },
  );
});

describe('fórmulas', () => {
  it('d = 1 / (P − V)', () => {
    expect(distanciaParaVergencia(-2, 3)).toBeCloseTo(200, 6);
  });

  it('vergenciaDeRanura es la inversa de distanciaParaVergencia', () => {
    expect(vergenciaDeRanura(distanciaParaVergencia(-3.5, 3), 3)).toBeCloseTo(-3.5, 9);
  });

  it('con e = 0 la vergencia en el ojo es igual a V', () => {
    expect(vergenciaEnOjo(-4, 0)).toBe(-4);
  });

  it('rechaza una vergencia que no se puede lograr con ese lente', () => {
    expect(() => distanciaParaVergencia(3, 3)).toThrow(RangeError);
  });

  it('si se corrige la distancia de una ranura, su vergencia cambia', () => {
    const caja = crearCaja();
    caja.ranuras_mm[4] = 205;
    expect(ranuras(caja)[4].V).toBeCloseTo(3 - 1000 / 205, 9);
  });
});

describe('con otro lente (P = +2.00 D) nada depende de P = 3', () => {
  const lista = ranuras(crearCaja(2));

  it('las distancias salen de d = 1 / (2 − V)', () => {
    expect(lista[0].d_mm).toBeCloseTo(500, 6);
    expect(lista[1].d_mm).toBeCloseTo(400, 6);
    expect(lista[10].d_mm).toBeCloseTo(1000 / 7, 6);
  });

  it('las vergencias y la vergencia en el ojo son las mismas que con P = 3', () => {
    lista.forEach((r, i) => {
      const [V, , Vojo] = TABLA_RANURAS[i];
      expect(Math.abs(r.V - V)).toBeLessThanOrEqual(0.01);
      expect(Math.abs(r.Vojo - Vojo)).toBeLessThanOrEqual(0.01);
    });
  });
});
