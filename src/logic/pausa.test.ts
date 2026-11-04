import { describe, expect, it } from 'vitest';
import { descontarPausa } from './pausa';

describe('tiempo de respuesta después de una pausa', () => {
  it('corre el último toque tanto como duró la pausa', () => {
    // Último toque a los 1000 ms; la ventana estuvo abierta de 5000 a 12000 ms.
    const ultimo = descontarPausa(1000, 5000, 12000);
    expect(ultimo).toBe(8000);
    // El siguiente toque, a los 12500 ms, tarda 4500 ms desde 8000: son los 4000 ms de antes más 500 ms de después.
    expect(12500 - ultimo).toBe(4500);
  });

  it('sin pausa no cambia nada', () => {
    expect(descontarPausa(1000, 5000, 5000)).toBe(1000);
  });

  it('un reloj que retrocede no da tiempos negativos', () => {
    expect(descontarPausa(1000, 5000, 4000)).toBe(1000);
  });
});
