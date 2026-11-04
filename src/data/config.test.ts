import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { abrirDB } from './db';
import {
  completar,
  configuracionPorDefecto,
  estadoCalibracion,
  guardarConfiguracion,
  leerConfiguracion,
} from './config';

let n = 0;
const dbNueva = () => abrirDB(`prueba-${++n}`);

describe('configuración', () => {
  it('sin nada guardado devuelve los valores por defecto (sin calibrar)', async () => {
    const config = await leerConfiguracion(await dbNueva());
    expect(config.pxPorMm).toBeNull();
    expect(config.caja.P).toBe(3);
    expect(config.caja.ranuras_mm).toHaveLength(11);
    expect(config.umbralCorte).toBe('6/9');
    expect(config.franja).toEqual({ lado: 'arriba', ancho_mm: 15 });
  });

  it('guarda y vuelve a leer la calibración y la caja', async () => {
    const db = await dbNueva();
    const config = configuracionPorDefecto();
    config.pxPorMm = 6.42;
    config.caja.ranuras_mm[4] = 201.5;
    config.franja.lado = 'abajo';
    await guardarConfiguracion(db, config);
    expect(await leerConfiguracion(db)).toEqual(config);
  });

  it('los valores por defecto no se comparten entre configuraciones', () => {
    const a = configuracionPorDefecto();
    a.caja.ranuras_mm[0] = 1;
    expect(configuracionPorDefecto().caja.ranuras_mm[0]).toBeCloseTo(333.33, 2);
  });

  it('completa campos que falten en una configuración vieja', () => {
    const vieja = { pxPorMm: 6 } as Parameters<typeof completar>[0];
    expect(completar(vieja).franja.ancho_mm).toBe(15);
    expect(completar(vieja).pxPorMm).toBe(6);
  });
});

describe('estado de la calibración', () => {
  it('sin calibrar', () => {
    expect(estadoCalibracion(configuracionPorDefecto(), 2)).toBe('sin-calibrar');
  });

  it('vigente si el devicePixelRatio es el mismo que al calibrar', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3, dprCalibracion: 2.625 };
    expect(estadoCalibracion(c, 2.625)).toBe('vigente');
  });

  it('pide recalibrar si cambió el zoom o el tamaño de letra del celular', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3, dprCalibracion: 2.625 };
    expect(estadoCalibracion(c, 2.25)).toBe('cambio-zoom');
  });

  it('una calibración vieja sin devicePixelRatio guardado se acepta', () => {
    const c = { ...configuracionPorDefecto(), pxPorMm: 6.3 };
    expect(estadoCalibracion(c, 3)).toBe('vigente');
  });
});
