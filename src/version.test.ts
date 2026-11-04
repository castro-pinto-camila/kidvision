import { describe, expect, it } from 'vitest';
import { formatearVersion, VERSION_APP } from './version';

describe('versión de la app', () => {
  it('muestra el commit y la fecha con día/mes/año', () => {
    expect(formatearVersion('6b1da13', '2026-11-04T15:30:00.000Z')).toBe('Versión 6b1da13 · publicada el 04/11/2026');
  });

  it('en la app compilada hay un commit y una fecha', () => {
    expect(VERSION_APP).toMatch(/^Versión \S+ · publicada el \d{2}\/\d{2}\/\d{4}$/);
  });
});
