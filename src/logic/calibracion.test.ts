import { describe, expect, it } from 'vitest';
import {
  anchoReferenciaPx,
  OBJETIVO_CALIBRACION,
  pxPorMmDesdeAncho,
  referenciaPorId,
  REFERENCIAS,
  TOLERANCIA_CALIBRACION,
  valorInicial,
} from './calibracion';

describe('referencias de calibración', () => {
  it('hay tres: tarjeta (primera), regla del kit y regla común', () => {
    expect(REFERENCIAS.map((r) => r.id)).toEqual(['tarjeta', 'regla-kit', 'regla']);
  });

  it('la tarjeta mide 85,6 mm y las reglas, 10 cm', () => {
    expect(referenciaPorId('tarjeta').mm).toBe(85.6);
    expect(referenciaPorId('regla-kit').mm).toBe(100);
    expect(referenciaPorId('regla').mm).toBe(100);
  });

  it('ancho y calibración son inversos', () => {
    for (const r of REFERENCIAS) {
      expect(pxPorMmDesdeAncho(r, anchoReferenciaPx(r, 6.4))).toBeCloseTo(6.4, 9);
    }
  });

  it('la tolerancia es ±5 % y el objetivo ±2 %', () => {
    expect(TOLERANCIA_CALIBRACION).toBe(0.05);
    expect(OBJETIVO_CALIBRACION).toBe(0.02);
  });
});

describe('valor inicial del ajuste', () => {
  it('usa la calibración anterior si existe', () => {
    expect(valorInicial(6.71, false)).toBe(6.71);
  });

  it('si no, el valor típico: Android 160 px por pulgada, iPhone 163', () => {
    expect(valorInicial(null, false)).toBeCloseTo(6.299, 3);
    expect(valorInicial(null, true)).toBeCloseTo(6.417, 3);
  });

  it('el valor típico está dentro de ±10 % de un celular real (6,0 a 6,8 px/mm)', () => {
    for (const real of [6.0, 6.3, 6.8]) expect(Math.abs(valorInicial(null, false) / real - 1)).toBeLessThan(0.1);
  });
});
