import { describe, expect, it } from 'vitest';
import { mmAPx } from './ejemplo';

describe('mmAPx', () => {
  it('convierte el ancho de la tarjeta (85,6 mm) a píxeles', () => {
    expect(mmAPx(85.6, 10)).toBeCloseTo(856);
  });

  it('0 mm son 0 px', () => {
    expect(mmAPx(0, 16.7)).toBe(0);
  });
});
